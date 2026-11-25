import hmac
import sqlite3
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.core.config import env
from app.core.database import connection
from app.core.ratelimit import rate_limit
from app.core.security import User, create_token, current_user, hash_pin, normalize_phone, verify_pin

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterInput(BaseModel):
    phone: str
    pin: str = Field(pattern=r"^\d{4,8}$", description="4–8 digit PIN")
    name: str | None = Field(default=None, max_length=100)
    language: Literal["en", "yo"] = "en"
    role: Literal["farmer", "coordinator"] = "farmer"
    coordinator_code: str | None = None

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return normalize_phone(value)


class LoginInput(BaseModel):
    phone: str
    pin: str

    @field_validator("phone")
    @classmethod
    def _phone(cls, value: str) -> str:
        return normalize_phone(value)


def _session(user: User) -> dict:
    token, expires_at = create_token(user)
    return {"access_token": token, "token_type": "bearer", "expires_at": expires_at, "user": _public(user)}


def _public(user: User) -> dict:
    return {"id": user.id, "phone": user.phone, "name": user.name, "role": user.role, "language": user.language}


@router.post("/register", status_code=201, dependencies=[Depends(rate_limit("auth", 10))])
def register(body: RegisterInput):
    if body.role == "coordinator":
        expected = env("TERRASYNC_COORDINATOR_CODE")
        if not expected or not hmac.compare_digest(body.coordinator_code or "", expected):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "A valid coordinator code is required")
    user = User(id=str(uuid4()), phone=body.phone, role=body.role, name=body.name, language=body.language)
    try:
        with connection() as db:
            db.execute("INSERT INTO users (id, phone, name, role, pin_hash, language) VALUES (?, ?, ?, ?, ?, ?)",
                       (user.id, user.phone, user.name, user.role, hash_pin(body.pin), user.language))
    except sqlite3.IntegrityError:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this phone number already exists")
    return _session(user)


@router.post("/login", dependencies=[Depends(rate_limit("auth", 10))])
def login(body: LoginInput):
    with connection() as db:
        row = db.execute("SELECT id, phone, role, name, language, pin_hash FROM users WHERE phone = ?",
                         (body.phone,)).fetchone()
    if row is None or not verify_pin(body.pin, row["pin_hash"]):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect phone number or PIN")
    data = dict(row)
    data.pop("pin_hash")
    return _session(User(**data))


@router.get("/me")
def me(user: User = Depends(current_user)):
    return _public(user)
