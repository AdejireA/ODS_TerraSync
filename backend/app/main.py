from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.drafts import router as drafts_router
from app.api.farms import router as farms_router
from app.api.guidance import router as guidance_router
from app.api.harvest import router as harvest_router
from app.api.insights import router as insights_router
from app.api.reference import router as reference_router
from app.api.tasks import router as tasks_router
from app.api.voice import router as voice_router
from app.core.config import cors_origins, env_bool, livekit_configured
from app.core.database import connection, initialize
from app.services.harvest import Forbidden, NotFound
from app.services.voice import VoiceUnavailable

VERSION = "0.2.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize()
    yield


app = FastAPI(title="TerraSync API", version=VERSION, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=cors_origins(), allow_credentials=False,
                   allow_methods=["*"], allow_headers=["Authorization", "Content-Type"])

for router in (auth_router, harvest_router, drafts_router, guidance_router, reference_router,
               farms_router, insights_router, tasks_router, voice_router):
    app.include_router(router, prefix="/api/v1")


@app.exception_handler(NotFound)
async def _not_found(_: Request, exc: NotFound):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(Forbidden)
async def _forbidden(_: Request, exc: Forbidden):
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.exception_handler(VoiceUnavailable)
async def _voice_unavailable(_: Request, exc: VoiceUnavailable):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(ValueError)
async def _invalid_value(_: Request, exc: ValueError):
    # Raised by catalog normalisation for query parameters (e.g. unknown crop or LGA).
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/health")
def health():
    try:
        with connection() as db:
            db.execute("SELECT 1")
        database = "ok"
    except Exception:
        database = "error"
    return {"status": "ok" if database == "ok" else "degraded", "version": VERSION, "database": database,
            "voice_configured": livekit_configured(), "weather_enabled": env_bool("TERRASYNC_WEATHER_ENABLED", True)}
