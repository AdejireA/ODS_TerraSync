from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.harvest import router as harvest_router
from app.api.guidance import router as guidance_router
from app.api.drafts import router as drafts_router
from app.core.database import initialize

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize()
    yield

app = FastAPI(title="TerraSync API", version="0.1.0", lifespan=lifespan)
app.include_router(harvest_router, prefix="/api/v1")
app.include_router(guidance_router, prefix="/api/v1")
app.include_router(drafts_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
