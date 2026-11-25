"""LiveKit voice worker for TerraSync.

Each browser call is created by POST /api/v1/voice/session, which dispatches this
agent with {"session_id", "language"} metadata. Phone calls arrive through the SIP
dispatch rule without metadata and are treated as guests. The agent loads trusted
context (signed-in farmer, saved farm) from the shared database and uses the same
service functions as the web API, so voice and screen give the same answers.

Latency notes: Spitch STT and TTS are non-streaming, so every turn waits for the
caller to stop, transcribes the whole utterance, then synthesises sentence by
sentence. We therefore keep replies short, keep tool results small (fewer LLM
tokens), start the LLM before the end-of-turn delay (preemptive generation),
prewarm models, and log per-turn timings so changes can be measured.
"""
import asyncio
import json
import logging
import os
from datetime import date

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import (
    Agent, AgentServer, AgentSession, AudioConfig, BackgroundAudioPlayer, BuiltinAudioClip,
    JobProcess, MetricsCollectedEvent, RunContext, function_tool, inference, metrics,
)
from livekit.plugins import silero, spitch

from app.core.config import VOICE_AGENT_NAME, env_bool
from app.core.database import initialize
from app.services import farms, harvest, insights, supply, tasks, voice
from app.services.harvest import HarvestReport
from app.services.tasks import TaskInput
from app.services.weather import get_weather

load_dotenv(".env")
load_dotenv("app/.env")
# The Spitch plugin reads SPITCH_API_KEY; accept the older SPITCH_API name too.
if not os.getenv("SPITCH_API_KEY") and os.getenv("SPITCH_API"):
    os.environ["SPITCH_API_KEY"] = os.environ["SPITCH_API"]
logger = logging.getLogger("terrasync.voice")

LANGUAGE_NAMES = {"en": "English", "yo": "Yorùbá"}
VOICES = {"en": "lina", "yo": "sade"}
# Fixed greetings are spoken instantly (no LLM round trip). Yorùbá needs fluent review.
GREETINGS = {
    "en": "Hello, I'm TerraSync's automated farming assistant, not a person. How can I help your farm today?",
    "yo": "Ẹ n lẹ́ o. Èmi ni olùrànlọ́wọ́ oko aládàáṣe TerraSync, kì í ṣe ènìyàn. Báwo ni mo ṣe lè ràn yín lọ́wọ́ lónìí?",
}
SAVED_NOTICE = {
    "en": " This call is saved to your account.",
    "yo": " A ó fi ìpè yìí pamọ́ sí àkọọ́lẹ̀ yín.",
}
LLM_MODEL = os.getenv("TERRASYNC_LLM_MODEL", "google/gemma-4-31b-it")


def _float_env(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError:
        return default


def _error(exc: Exception) -> dict:
    return {"error": str(exc)}


# ------------------------------------------------- compact tool results
# The LLM only needs what it will say aloud; smaller results = faster replies.

def _brief(items: list[dict], limit: int = 3) -> list[dict]:
    out = []
    for item in items[:limit]:
        entry = {"title": item["title"], "do": item["action"]}
        if item.get("escalation"):
            entry["escalate"] = item["escalation"]
        out.append(entry)
    return out


def _weather_brief(weather: dict | None) -> dict | None:
    if not weather:
        return None
    if not weather.get("available"):
        return {"available": False}
    return {
        "available": True,
        "now_c": weather["current"]["temperature_c"],
        "days": [{"date": d["date"], "rain_chance_pct": d["precipitation_probability_pct"],
                  "max_c": d["temperature_max_c"]} for d in weather["daily"]],
        "note": weather["location"]["note"],
    }


def _insights_brief(result: dict) -> dict:
    items = result["items"]
    return {
        "crop": result["context"]["crop"],
        "days_after_planting": result["context"]["days_after_planting"],
        "advice": _brief(items),
        "more_items": max(0, len(items) - 3),
        "missing": [m["message"] for m in result["missing_context"]],
        "pending_expert_review": any(i["review_status"] != "reviewed" for i in items),
        "weather": _weather_brief(result.get("weather")),
    }


def _readiness_brief(result: dict) -> dict:
    window = result["expected_window"]
    return {
        "phase": result["phase"],
        "harvest_window": {"from": window["start_date"], "to": window["end_date"]} if window else None,
        "days_to_window": result["days_to_window"],
        "checks": _brief(result["readiness_checks"], 2),
        "after_harvest": _brief(result["post_harvest"], 2),
        "report_prefill": result["suggested_report"],
        "missing": [m["message"] for m in result["missing_context"]],
        "pending_expert_review": True,
    }


class FarmerAssistant(Agent):
    def __init__(self, language: str, session_row: dict | None, farm: dict | None):
        self.language = language
        self.session_id = session_row["id"] if session_row else None
        self.user_id = session_row["user_id"] if session_row else None
        self.farm = farm
        self.draft_id = None

        if farm:
            if farm["planting_date"]:
                planted = f"planted on {farm['planting_date']}"
            elif farm["approximate_age_weeks"] is not None:
                planted = f"about {farm['approximate_age_weeks']} weeks old"
            else:
                planted = "planting date unknown"
            context = f"Caller is signed in. Saved farm: {farm['crop']} in {farm['lga']}, {farm['state']}, {planted}."
        elif self.user_id:
            context = "Caller is signed in without a saved farm; ask crop, LGA and planting date when needed."
        else:
            context = "Caller is a guest; ask crop, LGA and planting date when needed. Guests cannot create tasks."

        super().__init__(instructions=(
            f"You are TerraSync's automated farming assistant for smallholder farmers in Ogun State, Nigeria. "
            f"Speak only {LANGUAGE_NAMES[language]}. Today is {date.today().isoformat()}. {context}\n"
            "Voice style: this is a phone-style call. Start every reply with one short sentence (under 10 words), "
            "then at most two more short sentences. No lists, symbols or markdown. Give the single most useful "
            "action first; offer more only if asked.\n"
            "Before calling a lookup tool, first say a very short phrase such as 'Let me check.' in the caller's language.\n"
            "Facts come only from tools: get_daily_insights (what to do now), search_agricultural_knowledge "
            "(specific questions), get_local_weather, get_harvest_readiness (harvest timing and handling), "
            "list_harvest_reports and get_supply_summary (produce availability). "
            "Never invent weather, maturity, quantities, diagnoses, pesticides or doses. If a tool has no answer, "
            "say so and suggest an extension officer. Say once per call that advice is pending expert review.\n"
            "Harvest report: collect crop, quantity, unit, LGA, availability date (YYYY-MM-DD), callback contact and "
            "whether they agree to share the contact with buyers. Call prepare_harvest_report, read the details back, "
            "and call publish_confirmed_harvest only after a clear yes. Re-run prepare_harvest_report on any correction. "
            "Tasks: read back and call create_farm_task only after a clear yes. Never promise buyers, prices or callbacks."
        ))

    # ------------------------------------------------------------- context
    @function_tool()
    async def get_farm_profile(self, context: RunContext) -> dict:
        """The caller's saved farm (crop, location, planting date), if any."""
        if not self.farm:
            return {"farm": None, "message": "No saved farm. Ask for crop, LGA and planting date."}
        f = self.farm
        return {"crop": f["crop"], "state": f["state"], "lga": f["lga"], "planting_date": f["planting_date"],
                "approximate_age_weeks": f["approximate_age_weeks"]}

    @function_tool()
    async def get_daily_insights(self, context: RunContext, crop: str | None = None, lga: str | None = None,
                                 planting_date: str | None = None) -> dict:
        """Top advice for today. Uses the saved farm unless crop/lga/planting_date (YYYY-MM-DD) are given."""
        try:
            if self.farm and not crop:
                f = self.farm
                result = await asyncio.to_thread(insights.daily_insights, f["crop"], f["state"], f["lga"],
                                                 farms.effective_planting_date(f), True, self.language, f["id"])
            elif crop:
                planted = date.fromisoformat(planting_date) if planting_date else None
                result = await asyncio.to_thread(insights.daily_insights, crop, "Ogun", lga, planted, True,
                                                 self.language)
            else:
                return {"error": "Ask which crop they are growing."}
            return _insights_brief(result)
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def search_agricultural_knowledge(self, context: RunContext, crop: str, question: str = "",
                                            category: str | None = None) -> dict:
        """Search TerraSync guidance. category: planting, crop_care, harvest, post_harvest, weather or market."""
        try:
            result = insights.search_knowledge(crop, category, "Ogun", question)
            return {"advice": _brief(result["items"]), "status": result["status"]}
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def get_local_weather(self, context: RunContext) -> dict:
        """3-day forecast for Ogun State (approximate: Abeokuta)."""
        state = self.farm["state"] if self.farm else "Ogun"
        try:
            return _weather_brief(await asyncio.to_thread(get_weather, state))
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def get_harvest_readiness(self, context: RunContext, crop: str | None = None,
                                    lga: str | None = None, planting_date: str | None = None) -> dict:
        """Expected harvest window, readiness checks and post-harvest handling.
        Uses the saved farm unless crop/lga/planting_date (YYYY-MM-DD) are given."""
        try:
            if self.farm and not crop:
                f = self.farm
                result = await asyncio.to_thread(insights.harvest_readiness, f["crop"], f["state"], f["lga"],
                                                 farms.effective_planting_date(f), True, f["id"])
            elif crop:
                planted = date.fromisoformat(planting_date) if planting_date else None
                result = await asyncio.to_thread(insights.harvest_readiness, crop, "Ogun" if lga else None,
                                                 lga, planted)
            else:
                return {"error": "Ask which crop they mean."}
            return _readiness_brief(result)
        except ValueError as exc:
            return _error(exc)

    # ------------------------------------------------------------- supply
    @function_tool()
    async def get_supply_summary(self, context: RunContext, crop: str | None = None, lga: str | None = None) -> dict:
        """Expected produce supply from TerraSync farmer reports (not total production)."""
        try:
            result = supply.supply_summary(crop=crop, lga=lga)
            return {"totals": [{k: t[k] for k in ("crop", "unit", "total_quantity", "reports", "lgas")}
                               for t in result["totals"]],
                    "note": "Only TerraSync reports, not total production."}
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def list_harvest_reports(self, context: RunContext, crop: str | None = None) -> dict:
        """Upcoming produce on the board (no contact details)."""
        try:
            reports = harvest.list_reports(crop=crop, limit=5)
            return {"reports": [{k: r[k] for k in ("crop", "quantity", "unit", "lga", "available_date", "status")}
                                for r in reports]}
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def prepare_harvest_report(self, context: RunContext, crop: str, quantity: float, unit: str,
                                     lga: str, available_date: str, contact: str, contact_consent: bool) -> dict:
        """Create or correct a harvest draft (Ogun State). Date YYYY-MM-DD. Does NOT publish."""
        try:
            report = HarvestReport(crop=crop, quantity=quantity, unit=unit, state="Ogun", lga=lga,
                                   available_date=available_date, contact=contact,
                                   contact_consent=contact_consent,
                                   farm_id=self.farm["id"] if self.farm else None)
            if self.draft_id:
                result = harvest.update_draft(self.draft_id, report, self.user_id)
            else:
                result = harvest.create_draft(report, self.user_id, source="voice")
                self.draft_id = result["id"]
            return {"draft": result["report"], "next": "Read these details back and ask for a clear yes."}
        except (ValueError, harvest.Forbidden, harvest.NotFound) as exc:
            return _error(exc)

    @function_tool()
    async def publish_confirmed_harvest(self, context: RunContext) -> dict:
        """Publish the current draft to the produce board. Only after the farmer explicitly confirms."""
        if not self.draft_id:
            return {"error": "No harvest draft exists yet."}
        context.disallow_interruptions()
        try:
            result = harvest.confirm_draft(self.draft_id, self.user_id)
            self.draft_id = None
            return {"published": True, "report_id": result["id"]}
        except (harvest.Forbidden, harvest.NotFound) as exc:
            return _error(exc)

    @function_tool()
    async def create_farm_task(self, context: RunContext, action: str, due_date: str | None = None) -> dict:
        """Save a farm task (due_date YYYY-MM-DD). Only after the farmer agrees. Signed-in farmers only."""
        if not self.user_id:
            return {"error": "Tasks need a signed-in account; suggest signing in on the TerraSync app."}
        try:
            task = TaskInput(action=action, due_date=due_date, farm_id=self.farm["id"] if self.farm else None)
            created = tasks.create_task(self.user_id, task, source="voice")
            return {"saved": True, "action": created["action"], "due_date": created["due_date"]}
        except (ValueError, harvest.Forbidden, harvest.NotFound) as exc:
            return _error(exc)


# ------------------------------------------------------------------ worker

def prewarm(proc: JobProcess) -> None:
    """Runs once per worker process, before any call: load models and warm caches."""
    proc.userdata["vad"] = silero.VAD.load()
    initialize()
    try:
        get_weather("Ogun")  # fills the 30-minute weather cache used by insights
    except Exception:
        logger.warning("weather prewarm failed", exc_info=True)


server = AgentServer()
server.setup_fnc = prewarm


def _log_turn_metrics(session: AgentSession, call_id: str) -> metrics.ModelUsageCollector:
    """One compact timing line per stage, plus a usage summary at the end of the call."""
    usage = metrics.ModelUsageCollector()

    @session.on("metrics_collected")
    def _on_metrics(event: MetricsCollectedEvent) -> None:
        m = event.metrics
        usage.collect(m)
        if isinstance(m, metrics.EOUMetrics):
            logger.info("turn-timing call=%s stage=end_of_turn wait=%.2fs transcript_delay=%.2fs",
                        call_id, m.end_of_utterance_delay, m.transcription_delay)
        elif isinstance(m, metrics.STTMetrics):
            logger.info("turn-timing call=%s stage=stt duration=%.2fs audio=%.2fs",
                        call_id, m.duration, m.audio_duration)
        elif isinstance(m, metrics.LLMMetrics):
            logger.info("turn-timing call=%s stage=llm model=%s first_token=%.2fs total=%.2fs tokens_in=%s",
                        call_id, LLM_MODEL, m.ttft, m.duration, m.prompt_tokens)
        elif isinstance(m, metrics.TTSMetrics):
            logger.info("turn-timing call=%s stage=tts first_audio=%.2fs chars=%s",
                        call_id, m.ttfb, m.characters_count)

    return usage


@server.rtc_session(agent_name=VOICE_AGENT_NAME)
async def entrypoint(ctx: agents.JobContext):
    try:
        metadata = json.loads(ctx.job.metadata or "{}")
    except json.JSONDecodeError:
        metadata = {}

    session_row = voice.load_session(metadata["session_id"]) if metadata.get("session_id") else None
    language = (session_row or {}).get("language") or os.getenv("TERRASYNC_VOICE_LANGUAGE", "en")
    if language not in VOICES:
        language = "en"
    farm = None
    if session_row and session_row["farm_id"] and session_row["user_id"]:
        try:
            farm = farms.get_farm(session_row["user_id"], session_row["farm_id"])
        except harvest.NotFound:
            farm = None

    store = bool(session_row and session_row["user_id"]) and env_bool("TERRASYNC_STORE_TRANSCRIPTS", True)
    vad = ctx.proc.userdata.get("vad") or silero.VAD.load()

    session = AgentSession(
        vad=vad,
        stt=spitch.STT(language=language),
        llm=inference.LLM(model=LLM_MODEL),
        tts=spitch.TTS(language=language, voice=VOICES[language]),
        turn_handling={
            # Spitch transcribes after the caller stops; a short fixed wait avoids cutting people off.
            "endpointing": {
                "mode": "fixed",
                "min_delay": _float_env("TERRASYNC_ENDPOINTING_MIN_DELAY", 0.6),
                "max_delay": _float_env("TERRASYNC_ENDPOINTING_MAX_DELAY", 3.0),
            },
            # Start the LLM as soon as the transcript arrives instead of after the end-of-turn wait.
            "preemptive_generation": {"enabled": env_bool("TERRASYNC_PREEMPTIVE_GENERATION", True)},
        },
    )

    call_id = (session_row or {}).get("id") or ctx.room.name
    usage = _log_turn_metrics(session, call_id)

    if store:
        @session.on("conversation_item_added")
        def _save(event):
            item = event.item
            text = getattr(item, "text_content", None)
            if getattr(item, "role", None) in ("user", "assistant") and text:
                try:
                    voice.add_transcript(session_row["id"], item.role, text)
                except Exception:
                    logger.exception("Failed to store transcript turn")

    async def _ended():
        logger.info("call-usage call=%s %s", call_id, usage.flatten())
        if session_row:
            voice.end_session(session_row["id"])
    ctx.add_shutdown_callback(_ended)

    await session.start(room=ctx.room, agent=FarmerAssistant(language, session_row, farm))

    # Soft typing sound while the agent is thinking, so callers never hear dead air.
    if env_bool("TERRASYNC_THINKING_SOUND", True):
        background = BackgroundAudioPlayer(thinking_sound=[
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING, volume=0.6),
            AudioConfig(BuiltinAudioClip.KEYBOARD_TYPING2, volume=0.5),
        ])
        await background.start(room=ctx.room, agent_session=session)

    session.say(GREETINGS[language] + (SAVED_NOTICE[language] if store else ""), allow_interruptions=True)


if __name__ == "__main__":
    agents.cli.run_app(server)
