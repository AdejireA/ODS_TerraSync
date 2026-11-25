from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.ratelimit import rate_limit
from app.core.security import User, current_user, optional_user
from app.services import voice

router = APIRouter(prefix="/voice", tags=["voice"])


class SessionInput(BaseModel):
    language: Literal["en", "yo"] = "en"
    farm_id: str | None = None


@router.post("/session", status_code=201, dependencies=[Depends(rate_limit("voice-session", 10))])
def create_session(body: SessionInput, user: User | None = Depends(optional_user)):
    """Create a browser call. Guests get general advice; signed-in farmers may pass farm_id."""
    if body.farm_id and user is None:
        raise HTTPException(401, "Sign in to use a saved farm in a call")
    return voice.create_session(body.language, user.id if user else None, body.farm_id,
                                user.name if user else None)


@router.get("/sessions")
def list_sessions(user: User = Depends(current_user)):
    return voice.list_sessions(user.id)


@router.get("/sessions/{session_id}/transcript")
def transcript(session_id: str, user: User = Depends(current_user)):
    return voice.get_transcript(session_id, user.id)
