"""LiveKit voice worker for the TerraSync prototype."""
import os

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentServer, AgentSession, RunContext, function_tool, inference
from livekit.plugins import silero, spitch

from app.api.drafts import confirm_draft, create_draft, update_draft
from app.api.guidance import find_guidance
from app.api.harvest import HarvestReport
from app.core.database import initialize

load_dotenv(".env")
load_dotenv("app/.env")

class FarmerAssistant(Agent):
    def __init__(self, language: str):
        self.language = language
        self.draft_id = None
        super().__init__(instructions=(
            "You are TerraSync's automated farming assistant. Speak briefly in the "
            "configured language. Use the guidance tool for farming advice and say "
            "when no reviewed guidance is available. Never invent diagnoses or pesticide "
            "doses. For a harvest report, collect crop, quantity, unit, state, LGA, "
            "availability date and callback contact. Create a draft, read all details "
            "back and ask for explicit confirmation. Update the draft if corrected. "
            "Only call confirm after the farmer agrees to publish. Do not claim a buyer "
            "or follow-up exists."
        ))

    @function_tool()
    async def guidance(self, context: RunContext, crop: str) -> dict:
        """Find reviewed guidance for a crop in the session language."""
        return find_guidance(crop=crop, language=self.language)

    @function_tool()
    async def prepare_harvest(self, context: RunContext, crop: str, quantity: float,
                              unit: str, state: str, lga: str,
                              available_date: str, contact: str) -> dict:
        """Create or correct a draft. Date must be YYYY-MM-DD. Do not publish."""
        report = HarvestReport(crop=crop, quantity=quantity, unit=unit, state=state,
                               lga=lga, available_date=available_date, contact=contact)
        if self.draft_id:
            return update_draft(self.draft_id, report)
        result = create_draft(report)
        self.draft_id = result["id"]
        return result

    @function_tool()
    async def publish_confirmed_harvest(self, context: RunContext) -> dict:
        """Publish the current draft only after the farmer confirms all details."""
        if not self.draft_id:
            return {"error": "No harvest draft exists."}
        context.disallow_interruptions()
        return confirm_draft(self.draft_id)

server = AgentServer()

@server.rtc_session(agent_name="terrasync-farmer-assistant")
async def entrypoint(ctx: agents.JobContext):
    language = os.getenv("TERRASYNC_VOICE_LANGUAGE", "en")
    if language not in ("en", "yo"):
        raise ValueError("TERRASYNC_VOICE_LANGUAGE must be en or yo")
    initialize()
    voice = "sade" if language == "yo" else "lina"
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=spitch.STT(language=language),
        llm=inference.LLM(model=os.getenv("TERRASYNC_LLM_MODEL", "google/gemma-4-31b-it")),
        tts=spitch.TTS(language=language, voice=voice),
    )
    await session.start(room=ctx.room, agent=FarmerAssistant(language))
    await session.generate_reply(instructions="Introduce yourself as TerraSync's automated assistant and ask how you can help.")

if __name__ == "__main__":
    agents.cli.run_app(server)
