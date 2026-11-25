"""LiveKit voice sessions: short-lived browser tokens plus agent dispatch."""
import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.core.config import VOICE_AGENT_NAME, env, env_int, livekit_configured
from app.core.database import connection
from app.services.harvest import Forbidden, NotFound


class VoiceUnavailable(Exception):
    pass


def create_session(language: str, user_id: str | None, farm_id: str | None, display_name: str | None = None) -> dict:
    if not livekit_configured():
        raise VoiceUnavailable("Voice calling is not configured on this server")
    from livekit import api  # imported lazily so the API runs without LiveKit installed

    session_id = str(uuid4())
    room = f"terrasync-{session_id}"
    identity = f"farmer-{user_id}" if user_id else f"guest-{session_id[:8]}"

    with connection() as db:
        if farm_id:
            farm = db.execute("SELECT user_id FROM farms WHERE id = ?", (farm_id,)).fetchone()
            if farm is None or farm["user_id"] != user_id:
                raise Forbidden("Farm not found for this account")
        db.execute("INSERT INTO voice_sessions (id, room, user_id, farm_id, language) VALUES (?, ?, ?, ?, ?)",
                   (session_id, room, user_id, farm_id, language))

    ttl_minutes = env_int("TERRASYNC_VOICE_TOKEN_TTL_MINUTES", 15)
    # Only the session id travels in metadata; the agent loads trusted context from the database.
    metadata = json.dumps({"session_id": session_id, "language": language})
    token = (
        api.AccessToken(env("LIVEKIT_API_KEY"), env("LIVEKIT_API_SECRET"))
        .with_identity(identity)
        .with_name(display_name or ("Farmer" if user_id else "Guest"))
        .with_ttl(timedelta(minutes=ttl_minutes))
        .with_grants(api.VideoGrants(room_join=True, room=room, can_publish=True,
                                     can_subscribe=True, can_publish_data=True,
                                     can_publish_sources=["microphone"]))
        .with_room_config(api.RoomConfiguration(
            agents=[api.RoomAgentDispatch(agent_name=VOICE_AGENT_NAME, metadata=metadata)]))
        .to_jwt()
    )
    return {
        "session_id": session_id, "room": room, "url": env("LIVEKIT_URL"), "token": token,
        "identity": identity, "language": language, "farm_id": farm_id,
        "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)).isoformat(timespec="seconds"),
        "transcripts_stored": user_id is not None,
    }


def load_session(session_id: str) -> dict | None:
    with connection() as db:
        row = db.execute("SELECT id, room, user_id, farm_id, language, created_at, ended_at FROM voice_sessions WHERE id = ?",
                         (session_id,)).fetchone()
    return dict(row) if row else None


def add_transcript(session_id: str, role: str, text: str) -> None:
    if not text.strip():
        return
    with connection() as db:
        db.execute("INSERT INTO voice_transcripts (session_id, role, text) VALUES (?, ?, ?)", (session_id, role, text.strip()))


def end_session(session_id: str) -> None:
    with connection() as db:
        db.execute("UPDATE voice_sessions SET ended_at = CURRENT_TIMESTAMP WHERE id = ? AND ended_at IS NULL", (session_id,))


def get_transcript(session_id: str, user_id: str) -> dict:
    session = load_session(session_id)
    if session is None or session["user_id"] != user_id:
        raise NotFound("Voice session not found")
    with connection() as db:
        rows = db.execute("SELECT role, text, created_at FROM voice_transcripts WHERE session_id = ? ORDER BY id",
                          (session_id,)).fetchall()
    return {"session_id": session_id, "language": session["language"], "created_at": session["created_at"],
            "ended_at": session["ended_at"], "items": [dict(row) for row in rows]}


def list_sessions(user_id: str) -> list[dict]:
    with connection() as db:
        rows = db.execute(
            """SELECT s.id AS session_id, s.language, s.farm_id, s.created_at, s.ended_at,
               (SELECT COUNT(*) FROM voice_transcripts t WHERE t.session_id = s.id) AS turns
               FROM voice_sessions s WHERE s.user_id = ? ORDER BY s.created_at DESC LIMIT 50""", (user_id,)).fetchall()
    return [dict(row) for row in rows]
