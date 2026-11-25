"""Agronomic knowledge base loader.

Rules live as data in `app/data/knowledge/*.json` so researchers can replace or
extend them without touching code. Every file is validated at import time; an
invalid rule stops the app from starting rather than serving bad advice.

Region hierarchy used for fallback: lga -> state -> southwest -> national.
Trigger types:
  always               applies whenever the crop matches
  stage                days after planting within window_days (needs planting date)
  months               current month is in `months` (1-12); planting-season advice
  rain_forecast        max rain chance over the forecast >= rain_probability
                       (optionally only inside window_days)
  dry_forecast         max rain chance over the forecast <= rain_probability
                       (optionally only inside window_days)
Crop "all" applies to every crop.
"""
import json
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.data.catalog import CROPS, STATES

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"
Category = Literal["planting", "crop_care", "harvest", "post_harvest", "weather", "market"]
CATEGORIES = ["planting", "crop_care", "harvest", "post_harvest", "weather", "market"]


class Region(BaseModel):
    level: Literal["lga", "state", "southwest", "national"]
    states: list[str] | None = None
    lgas: list[str] | None = None


class Trigger(BaseModel):
    type: Literal["always", "stage", "months", "rain_forecast", "dry_forecast"]
    window_days: tuple[int, int] | None = None
    months: list[int] | None = None
    rain_probability: int | None = Field(default=None, ge=0, le=100)

    @model_validator(mode="after")
    def _check(self):
        if self.type == "stage" and self.window_days is None:
            raise ValueError("stage trigger needs window_days")
        if self.type == "months" and not self.months:
            raise ValueError("months trigger needs months")
        if self.type in ("rain_forecast", "dry_forecast") and self.rain_probability is None:
            raise ValueError(f"{self.type} trigger needs rain_probability")
        if self.window_days and self.window_days[0] > self.window_days[1]:
            raise ValueError("window_days must be [min, max]")
        if self.months and any(m < 1 or m > 12 for m in self.months):
            raise ValueError("months must be 1-12")
        return self


class Source(BaseModel):
    title: str
    url: str
    verified: bool = False


class Rule(BaseModel):
    id: str = Field(pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    crop: str
    category: Category
    region: Region
    trigger: Trigger
    requires: list[Literal["planting_date", "weather"]] = []
    priority: Literal[1, 2, 3]
    title: str = Field(min_length=3, max_length=120)
    action: str = Field(min_length=3, max_length=400)
    rationale: str
    uncertainty: str
    contraindications: str | None = None
    escalation: str | None = None
    source: Source
    review_status: Literal["unreviewed", "reviewed"] = "unreviewed"

    @model_validator(mode="after")
    def _check(self):
        if self.crop != "all" and self.crop not in CROPS:
            raise ValueError(f"{self.id}: unknown crop {self.crop}")
        for state in self.region.states or []:
            if state not in STATES:
                raise ValueError(f"{self.id}: unknown state {state}")
        if self.region.level == "lga":
            known = {lga for info in STATES.values() for lga in info["lgas"]}
            missing = [lga for lga in self.region.lgas or [] if lga not in known]
            if not self.region.lgas or missing:
                raise ValueError(f"{self.id}: lga rules need valid lgas, unknown: {missing}")
        return self


class CropProfile(BaseModel):
    """Typical harvest window used by harvest intelligence (approximate)."""
    harvest_window_days: tuple[int, int]
    counted_from: Literal["planting", "transplanting"] = "planting"
    uncertainty: str
    source: Source
    review_status: Literal["unreviewed", "reviewed"] = "unreviewed"


def _load() -> tuple[list[dict], dict[str, dict]]:
    rules: list[dict] = []
    profiles: dict[str, dict] = {}
    for path in sorted(KNOWLEDGE_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for raw in data.get("rules", []):
            rules.append(Rule.model_validate(raw).model_dump(mode="json"))
        for crop, raw in data.get("crop_profiles", {}).items():
            if crop not in CROPS:
                raise ValueError(f"{path.name}: unknown crop profile {crop}")
            profiles[crop] = CropProfile.model_validate(raw).model_dump(mode="json")
    ids = [rule["id"] for rule in rules]
    duplicates = {i for i in ids if ids.count(i) > 1}
    if duplicates:
        raise ValueError(f"Duplicate rule ids: {sorted(duplicates)}")
    return rules, profiles


RULES, CROP_PROFILES = _load()
RULES_BY_ID = {rule["id"]: rule for rule in RULES}
CROPS_WITH_RULES = sorted({rule["crop"] for rule in RULES if rule["crop"] != "all"})
