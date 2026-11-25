"""Deterministic Daily Insights and knowledge lookup over the regional rule set.

The same functions back the web dashboard and the voice agent, so both give the
same advice. No LLM is involved in selecting or ranking rules.
"""
from datetime import date

from app.data.catalog import CROPS, normalize_crop, normalize_lga, normalize_state
from app.data.rules import CROPS_WITH_RULES, RULES
from app.services.weather import get_weather, max_rain_probability

LEVEL_RANK = {"lga": 0, "state": 1, "southwest": 2, "national": 3}


def _region_applies(rule: dict, state: str | None, lga: str | None) -> bool:
    region = rule["region"]
    if region["level"] == "national":
        return True
    if state is None:
        return region["level"] == "southwest"
    if region["level"] == "lga":
        return lga in (region.get("lgas") or [])
    return state in (region.get("states") or [])


def _public_rule(rule: dict, reason: str) -> dict:
    return {
        "rule_id": rule["id"], "crop": rule["crop"], "category": rule["category"],
        "priority": rule["priority"], "urgency": {1: "high", 2: "medium", 3: "low"}[rule["priority"]],
        "title": rule["title"], "reason": reason, "action": rule["action"], "rationale": rule["rationale"],
        "evidence": {"source_title": rule["source"]["title"], "source_url": rule["source"]["url"],
                     "source_verified": rule["source"]["verified"]},
        "review_status": rule["review_status"], "uncertainty": rule["uncertainty"],
        "contraindications": rule["contraindications"], "escalation": rule["escalation"],
        "region_level": rule["region"]["level"], "language": "en",
    }


def _match(rule: dict, days: int | None, rain: int | None) -> str | None:
    """Return the reason a rule fires, or None."""
    trigger = rule["trigger"]
    if trigger["type"] == "always":
        return "General guidance for this crop."
    if days is None:
        return None
    low, high = trigger["window_days"]
    if not low <= days <= high:
        return None
    if trigger["type"] == "stage":
        return f"Your crop is about {days} days after planting (window {low}–{high} days)."
    if trigger["type"] == "rain_during_window":
        if rain is None or rain < trigger["rain_probability"]:
            return None
        return f"Your crop is about {days} days after planting and the forecast shows up to {rain}% chance of rain."
    return None


def daily_insights(crop: str, state: str | None = None, lga: str | None = None,
                   planting_date: date | None = None, include_weather: bool = True,
                   language: str = "en", farm_id: str | None = None) -> dict:
    crop = normalize_crop(crop)
    if state:
        state = normalize_state(state)
        lga = normalize_lga(state, lga) if lga else None

    days = (date.today() - planting_date).days if planting_date else None
    missing = []
    if planting_date is None:
        missing.append({"field": "planting_date",
                        "message": "Add a planting date or approximate crop age for stage-specific advice."})
    if state is None:
        missing.append({"field": "state", "message": "Add your state and LGA for regional advice."})

    weather = None
    rain = None
    if include_weather and state:
        weather = get_weather(state, lga)
        rain = max_rain_probability(weather)
        if not weather.get("available"):
            missing.append({"field": "weather", "message": "Weather is unavailable, so weather-based advice is skipped."})

    items = []
    for rule in RULES:
        if rule["crop"] != crop or not _region_applies(rule, state, lga):
            continue
        reason = _match(rule, days, rain)
        if reason:
            items.append((rule, reason))
    items.sort(key=lambda pair: (pair[0]["priority"], LEVEL_RANK[pair[0]["region"]["level"]], pair[0]["id"]))

    notes = []
    if crop not in CROPS_WITH_RULES:
        notes.append(f"TerraSync does not have rules for {CROPS[crop]['name_en']} yet.")
    elif not items:
        notes.append("No rule applies to this crop stage today.")
    if any(rule["review_status"] != "reviewed" for rule, _ in items):
        notes.append("Some advice is pending expert review; treat it as general guidance.")
    if language != "en":
        notes.append("Yorùbá text for these insights is not available yet; showing English.")

    return {
        "date": date.today().isoformat(),
        "context": {"farm_id": farm_id, "crop": crop, "state": state, "lga": lga,
                    "planting_date": planting_date.isoformat() if planting_date else None,
                    "days_after_planting": days},
        "items": [_public_rule(rule, reason) for rule, reason in items],
        "missing_context": missing,
        "notes": notes,
        "weather": weather,
        "status": "ok" if items else "no_applicable_rules",
    }


def search_knowledge(crop: str, category: str | None = None, state: str | None = None,
                     query: str | None = None) -> dict:
    crop = normalize_crop(crop)
    state = normalize_state(state) if state else None
    words = [w for w in (query or "").lower().split() if len(w) > 2]
    results = []
    for rule in RULES:
        if rule["crop"] != crop or (category and rule["category"] != category):
            continue
        if not _region_applies(rule, state, None):
            continue
        text = " ".join(str(rule[k]) for k in ("title", "action", "rationale")).lower()
        if words and not any(w in text for w in words):
            continue
        results.append(_public_rule(rule, "Matches your search."))
    return {"crop": crop, "category": category, "items": results,
            "status": "ok" if results else "no_matching_guidance"}
