from fastapi import APIRouter, Depends

from app.core.security import User, require_role
from app.services import farms
from app.services.farms import FarmInput

router = APIRouter(prefix="/farms", tags=["farms"])
farmer = require_role("farmer")


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
