import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import User, require_role
from app.core.database import connection
from app.services import farms
from app.services.farms import FarmInput

router = APIRouter(prefix="/farms", tags=["farms"])
farmer = require_role("farmer")


class ProfileInput(BaseModel):
    profile: dict[str, Any] | None


@router.get("/profile")
def get_profile(user: User = Depends(farmer)):
    with connection() as db:
        row = db.execute("SELECT profile FROM user_farm_profiles WHERE user_id = ?", (user.id,)).fetchone()
    return {"profile": json.loads(row["profile"]) if row else None}


@router.put("/profile")
def put_profile(body: ProfileInput, user: User = Depends(farmer)):
    payload = json.dumps(body.profile)
    if len(payload.encode()) > 100_000:
        raise HTTPException(413, "Profile is too large")
    with connection() as db:
        if body.profile is None:
            db.execute("DELETE FROM user_farm_profiles WHERE user_id = ?", (user.id,))
        else:
            db.execute("INSERT INTO user_farm_profiles (user_id, profile) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET profile = excluded.profile", (user.id, payload))
    return {"profile": body.profile}


@router.get("")
def list_farms(user: User = Depends(farmer)):
    return farms.list_farms(user.id)


@router.post("", status_code=201)
def create_farm(body: FarmInput, user: User = Depends(farmer)):
    return farms.create_farm(user.id, body)


@router.get("/{farm_id}")
def get_farm(farm_id: str, user: User = Depends(farmer)):
    return farms.get_farm(user.id, farm_id)


@router.put("/{farm_id}")
def update_farm(farm_id: str, body: FarmInput, user: User = Depends(farmer)):
    return farms.update_farm(user.id, farm_id, body)
