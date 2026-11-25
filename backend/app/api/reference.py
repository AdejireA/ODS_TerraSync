"""Public reference data: locations, crops, units, weather."""
from fastapi import APIRouter

from app.data.catalog import CROPS, STATES, UNITS, active_states
from app.data.rules import CROPS_WITH_RULES
from app.services.weather import get_weather

router = APIRouter(tags=["reference"])


@router.get("/locations")
def locations():
    return {"states": [{"name": name, "capital": info["capital"], "pilot": info["pilot"], "lgas": info["lgas"]}
                       for name, info in STATES.items() if name in active_states()]}


@router.get("/crops")
def crops():
    return {"crops": [{"id": crop_id, **names, "has_rules": crop_id in CROPS_WITH_RULES}
                      for crop_id, names in CROPS.items()],
            "units": UNITS}


@router.get("/weather", tags=["weather"])
def weather(state: str, lga: str | None = None):
    """Observed/forecast weather only; `available: false` when the provider fails."""
    return get_weather(state, lga)
