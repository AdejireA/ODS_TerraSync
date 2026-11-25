from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import User, optional_user
from app.services import farms, insights, supply

router = APIRouter(tags=["insights"])
Category = Literal["planting", "crop_care", "harvest", "post_harvest", "weather", "market"]


def _farm_context(farm_id: str | None, user: User | None, crop: str | None, state: str | None,
                  lga: str | None, planting_date: date | None) -> dict:
    """Resolve context from a saved farm (signed in) or from guest query parameters."""
    if farm_id:
        if user is None:
            raise HTTPException(401, "Sign in to use a saved farm")
        farm = farms.get_farm(user.id, farm_id)
        return {"crop": farm["crop"], "state": farm["state"], "lga": farm["lga"],
                "planting_date": farms.effective_planting_date(farm), "farm_id": farm_id}
    if not crop:
        raise HTTPException(422, "Provide farm_id, or crop with optional state, lga and planting_date")
    return {"crop": crop, "state": state, "lga": lga, "planting_date": planting_date, "farm_id": None}


@router.get("/insights/today")
def insights_today(farm_id: str | None = None, crop: str | None = None, state: str | None = None,
                   lga: str | None = None, planting_date: date | None = None,
                   language: Literal["en", "yo"] = "en", include_weather: bool = True,
                   user: User | None = Depends(optional_user)):
    """Ranked, rule-based Daily Insights.

    Signed-in farmers pass `farm_id`; guests pass crop/state/lga/planting_date directly."""
    ctx = _farm_context(farm_id, user, crop, state, lga, planting_date)
    return insights.daily_insights(ctx["crop"], ctx["state"], ctx["lga"], ctx["planting_date"],
                                   include_weather, language, ctx["farm_id"])


@router.get("/harvest-readiness", tags=["harvest intelligence"])
def harvest_readiness(farm_id: str | None = None, crop: str | None = None, state: str | None = None,
                      lga: str | None = None, planting_date: date | None = None, include_weather: bool = True,
                      user: User | None = Depends(optional_user)):
    """Expected harvest window, phase, readiness checks, post-harvest guidance and a report pre-fill."""
    ctx = _farm_context(farm_id, user, crop, state, lga, planting_date)
    return insights.harvest_readiness(ctx["crop"], ctx["state"], ctx["lga"], ctx["planting_date"],
                                      include_weather, ctx["farm_id"])


@router.get("/knowledge")
def knowledge(crop: str, category: Category | None = None, state: str | None = None, q: str | None = None):
    """Search the knowledge base, e.g. post-harvest guidance for maize."""
    return insights.search_knowledge(crop, category, state, q)


@router.get("/supply/summary", tags=["supply intelligence"])
def supply_summary(crop: str | None = None, state: str | None = None, lga: str | None = None,
                   days: int = Query(default=60, ge=1, le=365)):
    """Expected supply by crop, LGA and week from board reports (participating farmers only)."""
    return supply.supply_summary(crop, lga, state, days)
