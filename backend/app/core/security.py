"""Phone + PIN authentication with HMAC-signed bearer tokens (stdlib only)."""
import base64
import hashlib
import hmac
import json
import re
import secrets
import time
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import env_int, secret_key
from app.core.database import connection

_bearer = HTTPBearer(auto_error=False)
_SCRYPT = {"n": 2**14, "r": 8, "p": 1}


@dataclass
class User:
    id: str
    phone: str
    role: str
    name: str | None = None
    language: str = "en"


def normalize_phone(raw: str) -> str:
    """Normalise Nigerian numbers to +234XXXXXXXXXX; accept other E.164 numbers."""
    digits = re.sub(r"[^\d+]", "", raw or "")
    if digits.startswith("+"):
        digits = "+" + re.sub(r"\D", "", digits)
    elif digits.startswith("234"):
        digits = "+" + digits
    elif digits.startswith("0") and len(digits) == 11:
        digits = "+234" + digits[1:]
    if not re.fullmatch(r"\+\d{10,15}", digits):
        raise ValueError("Enter a valid phone number, e.g. 08012345678")
    return digits


def hash_pin(pin: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(pin.encode(), salt=salt, **_SCRYPT)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_pin(pin: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    digest = hashlib.scrypt(pin.encode(), salt=bytes.fromhex(salt_hex), **_SCRYPT)
    return hmac.compare_digest(digest.hex(), digest_hex)


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def create_token(user: User) -> tuple[str, int]:
    ttl = env_int("TERRASYNC_TOKEN_TTL_HOURS", 72) * 3600
    expires_at = int(time.time()) + ttl
    payload = _b64(json.dumps({"sub": user.id, "role": user.role, "exp": expires_at}).encode())
    signature = _b64(hmac.new(secret_key().encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{signature}", expires_at


def decode_token(token: str) -> dict | None:
    try:
        payload, signature = token.split(".")
        expected = _b64(hmac.new(secret_key().encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        data = json.loads(_unb64(payload))
        if data.get("exp", 0) < time.time():
            return None
        return data
    except (ValueError, json.JSONDecodeError):
        return None


def load_user(user_id: str) -> User | None:
    with connection() as db:
        row = db.execute("SELECT id, phone, role, name, language FROM users WHERE id = ?", (user_id,)).fetchone()
    return User(**dict(row)) if row else None


def optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> User | None:
    """Return the signed-in user, None for guests, 401 for a bad or expired token."""
    if credentials is None:
        return None
    data = decode_token(credentials.credentials)
    user = load_user(data["sub"]) if data else None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token",
                            headers={"WWW-Authenticate": "Bearer"})
    return user


def current_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in required",
                            headers={"WWW-Authenticate": "Bearer"})
    return user


def require_role(*roles: str):
    def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You do not have access to this action")
        return user
    return dependency
