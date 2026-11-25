"""LiveKit voice worker for TerraSync.

Each browser call is created by POST /api/v1/voice/session, which dispatches this
agent with {"session_id", "language"} metadata. The agent loads the trusted
session (signed-in farmer, saved farm) from the shared database and uses the
same service functions as the web API, so voice and screen give the same answers.
"""
import asyncio
import json
import logging
import os
from datetime import date

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, RunContext, function_tool, inference
from livekit.plugins import silero, spitch

from app.core.config import VOICE_AGENT_NAME, env_bool
from app.core.database import initialize
from app.services import farms, harvest, insights, tasks, voice
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


def _error(exc: Exception) -> dict:
    return {"error": str(exc)}


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
            context = (f"The caller is a signed-in farmer. Saved farm: {farm['crop']} in {farm['lga']}, "
                       f"{farm['state']} State, {planted}.")
        elif self.user_id:
            context = "The caller is signed in but has no saved farm. Ask for crop, state, LGA and planting date when needed."
        else:
            context = ("The caller is a guest. Give general advice only. Ask for crop, state, LGA and planting date "
                       "when needed. Guests cannot create tasks.")

        super().__init__(instructions=(
            f"You are TerraSync's automated farming assistant for smallholder farmers in Southwest Nigeria. "
            f"Speak {LANGUAGE_NAMES[language]} in short, simple sentences suitable for audio. Today is {date.today().isoformat()}. "
            f"{context} "
            "Always use tools for facts: get_daily_insights for what to do today, search_agricultural_knowledge for "
            "specific questions, get_local_weather for weather, list_harvest_reports for produce availability. "
            "Never invent weather, crop maturity, quantities, diagnoses, pesticide products or doses. "
            "If a tool returns no guidance or an error, say so plainly and suggest contacting an extension officer. "
            "Mention when advice is pending expert review. "
            "For a harvest report collect crop, quantity, unit, state, LGA, availability date (YYYY-MM-DD) and a "
            "callback contact, and ask whether the farmer agrees to share the contact with buyers. Call "
            "prepare_harvest_report, read every detail back, and only call publish_confirmed_harvest after the farmer "
            "clearly agrees. If they correct anything, call prepare_harvest_report again. "
            "For a farm task, read it back and call create_farm_task only after the farmer agrees. "
            "Do not promise buyers, prices or follow-up calls."
        ))

    # ------------------------------------------------------------- context
    @function_tool()
    async def get_farm_profile(self, context: RunContext) -> dict:
        """Return the caller's saved farm (crop, location, planting date), if any."""
        if not self.farm:
            return {"farm": None, "message": "No saved farm. Ask the farmer for crop, state, LGA and planting date."}
        return {"farm": self.farm}

    @function_tool()
    async def get_daily_insights(self, context: RunContext, crop: str | None = None, state: str | None = None,
                                 lga: str | None = None, planting_date: str | None = None) -> dict:
        """Ranked advice for today. Uses the saved farm unless crop/state/lga/planting_date (YYYY-MM-DD) are given."""
        try:
            if self.farm and not crop:
                f = self.farm
                return await asyncio.to_thread(insights.daily_insights, f["crop"], f["state"], f["lga"],
                                               farms.effective_planting_date(f), True, self.language, f["id"])
            if not crop:
                return {"error": "Ask the farmer which crop they are growing."}
            planted = date.fromisoformat(planting_date) if planting_date else None
            return await asyncio.to_thread(insights.daily_insights, crop, state, lga, planted, True, self.language)
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def search_agricultural_knowledge(self, context: RunContext, crop: str, question: str = "",
                                            category: str | None = None) -> dict:
        """Search reviewed/draft TerraSync rules. category: crop_care, harvest, post_harvest or weather."""
        try:
            state = self.farm["state"] if self.farm else None
            return insights.search_knowledge(crop, category, state, question)
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def get_local_weather(self, context: RunContext, state: str | None = None) -> dict:
        """Forecast for a state (approximate, state capital). Uses the saved farm's state by default."""
        state = state or (self.farm["state"] if self.farm else None)
        if not state:
            return {"error": "Ask the farmer which state they farm in."}
        try:
            return await asyncio.to_thread(get_weather, state)
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def get_harvest_readiness(self, context: RunContext, crop: str | None = None) -> dict:
        """Harvest and post-harvest guidance for the crop."""
        crop = crop or (self.farm["crop"] if self.farm else None)
        if not crop:
            return {"error": "Ask the farmer which crop they mean."}
        try:
            return {"harvest": insights.search_knowledge(crop, "harvest")["items"],
                    "post_harvest": insights.search_knowledge(crop, "post_harvest")["items"]}
        except ValueError as exc:
            return _error(exc)

    # ------------------------------------------------------------- supply
    @function_tool()
    async def list_harvest_reports(self, context: RunContext, crop: str | None = None,
                                   state: str | None = None) -> dict:
        """Current produce board entries (no contact details)."""
        try:
            return {"reports": harvest.list_reports(crop=crop, state=state, limit=10)}
        except ValueError as exc:
            return _error(exc)

    @function_tool()
    async def prepare_harvest_report(self, context: RunContext, crop: str, quantity: float, unit: str,
                                     state: str, lga: str, available_date: str, contact: str,
                                     contact_consent: bool) -> dict:
        """Create or correct a harvest draft. Date must be YYYY-MM-DD. This does NOT publish."""
        try:
            report = HarvestReport(crop=crop, quantity=quantity, unit=unit, state=state, lga=lga,
                                   available_date=available_date, contact=contact,
                                   contact_consent=contact_consent,
                                   farm_id=self.farm["id"] if self.farm else None)
            if self.draft_id:
                return harvest.update_draft(self.draft_id, report, self.user_id)
            result = harvest.create_draft(report, self.user_id, source="voice")
            self.draft_id = result["id"]
            return result
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
            return result
        except (harvest.Forbidden, harvest.NotFound) as exc:
            return _error(exc)

    @function_tool()
    async def create_farm_task(self, context: RunContext, action: str, due_date: str | None = None) -> dict:
        """Save a farm task (due_date YYYY-MM-DD). Only after the farmer agrees. Signed-in farmers only."""
        if not self.user_id:
            return {"error": "Tasks need a signed-in account. Suggest the farmer signs in on the TerraSync app."}
        try:
            task = TaskInput(action=action, due_date=due_date, farm_id=self.farm["id"] if self.farm else None)
            return tasks.create_task(self.user_id, task, source="voice")
        except (ValueError, harvest.Forbidden, harvest.NotFound) as exc:
            return _error(exc)


server = AgentServer()


@server.rtc_session(agent_name=VOICE_AGENT_NAME)
async def entrypoint(ctx: agents.JobContext):
    initialize()
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

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=spitch.STT(language=language),
        llm=inference.LLM(model=os.getenv("TERRASYNC_LLM_MODEL", "google/gemma-4-31b-it")),
        tts=spitch.TTS(language=language, voice=VOICES[language]),
    )

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

    if session_row:
        async def _ended():
            voice.end_session(session_row["id"])
        ctx.add_shutdown_callback(_ended)

    await session.start(room=ctx.room, agent=FarmerAssistant(language, session_row, farm))
    notice = " Mention briefly that this conversation is saved to their account." if store else ""
    await session.generate_reply(instructions=(
        f"In {LANGUAGE_NAMES[language]}, introduce yourself as TerraSync's automated assistant, "
        f"say you are not a human, and ask how you can help.{notice}"))


if __name__ == "__main__":
    agents.cli.run_app(server)
