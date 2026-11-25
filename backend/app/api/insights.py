from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import User, optional_user
from app.services import farms, insights

router = APIRouter(tags=["insights"])
Category = Literal["crop_care", "harvest", "post_harvest", "weather"]


@router.get("/insights/today")
def insights_today(farm_id: str | None = None, crop: str | None = None, state: str | None = None,
                   lga: str | None = None, planting_date: date | None = None,
                   language: Literal["en", "yo"] = "en", include_weather: bool = True,
                   user: User | None = Depends(optional_user)):
    """Ranked, rule-based Daily Insights.

    Signed-in farmers pass `farm_id`; guests pass crop/state/lga/planting_date directly."""
    if farm_id:
        if user is None:
            raise HTTPException(401, "Sign in to use a saved farm")
        farm = farms.get_farm(user.id, farm_id)
        return insights.daily_insights(farm["crop"], farm["state"], farm["lga"],
                                       farms.effective_planting_date(farm), include_weather, language, farm_id)
    if not crop:
        raise HTTPException(422, "Provide farm_id, or crop with optional state, lga and planting_date")
    return insights.daily_insights(crop, state, lga, planting_date, include_weather, language)


@router.get("/knowledge")
def knowledge(crop: str, category: Category | None = None, state: str | None = None, q: str | None = None):
    """Search the regional rule set, e.g. post-harvest guidance for maize."""
    return insights.search_knowledge(crop, category, state, q)
