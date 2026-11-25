"""Environment-driven settings, read at call time so tests can override them."""
import os
import secrets
import warnings

_FALLBACK_SECRET = secrets.token_urlsafe(32)
_warned = False


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def env_int(name: str, default: int) -> int:
    try:
        return int(env(name, str(default)))
    except ValueError:
        return default


def env_bool(name: str, default: bool) -> bool:
    value = env(name, "true" if default else "false").lower()
    return value in ("1", "true", "yes", "on")


def database_path() -> str:
    return env("TERRASYNC_DATABASE_PATH", "terrasync.db")


def secret_key() -> str:
    """Token signing key. Falls back to a per-process key (tokens die on restart)."""
    global _warned
    key = env("TERRASYNC_SECRET_KEY")
    if key:
        return key
    if not _warned:
        warnings.warn("TERRASYNC_SECRET_KEY is not set; using a temporary key. Tokens will be invalid after restart.")
        _warned = True
    return _FALLBACK_SECRET


def cors_origins() -> list[str]:
    raw = env("TERRASYNC_CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def livekit_configured() -> bool:
    return all(env(name) for name in ("LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"))


VOICE_AGENT_NAME = "terrasync-farmer-assistant"
