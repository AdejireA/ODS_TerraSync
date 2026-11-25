"""Deterministic Daily Insights, knowledge search and harvest readiness.

The same functions back the web dashboard and the voice agent, so both give the
same advice. No LLM is involved in selecting or ranking rules.
"""
from datetime import date, timedelta

from app.data.catalog import CROPS, normalize_crop, normalize_lga, normalize_state
from app.data.rules import CROP_PROFILES, CROPS_WITH_RULES, RULES
from app.services.weather import get_weather, max_rain_probability

LEVEL_RANK = {"lga": 0, "state": 1, "southwest": 2, "national": 3}
URGENCY = {1: "high", 2: "medium", 3: "low"}


def _region_applies(rule: dict, state: str | None, lga: str | None) -> bool:
    region = rule["region"]
    if region["level"] == "national":
        return True
    if state is None:
        return region["level"] in ("southwest", "state")
    if region["level"] == "lga":
        return lga in (region.get("lgas") or [])
    return state in (region.get("states") or [])


def _crop_applies(rule: dict, crop: str) -> bool:
    return rule["crop"] in (crop, "all")


def public_rule(rule: dict, reason: str) -> dict:
    return {
        "rule_id": rule["id"], "crop": rule["crop"], "category": rule["category"],
        "priority": rule["priority"], "urgency": URGENCY[rule["priority"]],
        "title": rule["title"], "reason": reason, "action": rule["action"], "rationale": rule["rationale"],
        "evidence": {"source_title": rule["source"]["title"], "source_url": rule["source"]["url"],
                     "source_verified": rule["source"]["verified"]},
        "review_status": rule["review_status"], "uncertainty": rule["uncertainty"],
        "contraindications": rule["contraindications"], "escalation": rule["escalation"],
        "region_level": rule["region"]["level"], "language": "en",
    }


def _in_window(trigger: dict, days: int | None) -> bool | None:
    """True/False when the trigger has a window; None when it has none."""
    window = trigger.get("window_days")
    if not window:
        return None
    return days is not None and window[0] <= days <= window[1]


def _match(rule: dict, days: int | None, rain: int | None, today: date) -> str | None:
    """Return the reason a rule fires, or None."""
    trigger = rule["trigger"]
    kind = trigger["type"]
    in_window = _in_window(trigger, days)
    if in_window is False:
        return None
    if kind == "always":
        return "General guidance for this crop."
    if kind == "stage":
        low, high = trigger["window_days"]
        return f"Your crop is about {days} days after planting (window {low}–{high} days)."
    if kind == "months":
        return f"It is {today.strftime('%B')}, which is in the usual window for this activity."
    if rain is None:
        return None
    if kind == "rain_forecast" and rain >= trigger["rain_probability"]:
        return f"The forecast shows up to {rain}% chance of rain in the next few days."
    if kind == "dry_forecast" and rain <= trigger["rain_probability"]:
        return f"The forecast shows at most {rain}% chance of rain in the next few days."
    return None


def matching_rules(crop: str, state: str | None, lga: str | None, days: int | None,
                   rain: int | None, today: date | None = None, category: str | None = None) -> list[tuple[dict, str]]:
    today = today or date.today()
    items = []
    for rule in RULES:
        if not _crop_applies(rule, crop) or not _region_applies(rule, state, lga):
            continue
        if category and rule["category"] != category:
            continue
        reason = _match(rule, days, rain, today)
        if reason:
            items.append((rule, reason))
    items.sort(key=lambda pair: (pair[0]["priority"], LEVEL_RANK[pair[0]["region"]["level"]], pair[0]["id"]))
    return items


def _context(crop: str, state: str | None, lga: str | None):
    crop = normalize_crop(crop)
    if state:
        state = normalize_state(state)
        lga = normalize_lga(state, lga) if lga else None
    return crop, state, lga


def daily_insights(crop: str, state: str | None = None, lga: str | None = None,
                   planting_date: date | None = None, include_weather: bool = True,
                   language: str = "en", farm_id: str | None = None) -> dict:
    crop, state, lga = _context(crop, state, lga)
    days = (date.today() - planting_date).days if planting_date else None
    missing = []
    if planting_date is None:
        missing.append({"field": "planting_date",
                        "message": "Add a planting date or approximate crop age for stage-specific advice."})
    if state is None:
        missing.append({"field": "state", "message": "Add your LGA for local advice and weather."})

    weather = None
    rain = None
    if include_weather and state:
        weather = get_weather(state, lga)
        rain = max_rain_probability(weather)
        if not weather.get("available"):
            missing.append({"field": "weather", "message": "Weather is unavailable, so weather-based advice is skipped."})

    items = matching_rules(crop, state, lga, days, rain)

    notes = []
    if crop not in CROPS_WITH_RULES:
        notes.append(f"TerraSync does not have rules for {CROPS[crop]['name_en']} yet.")
    elif not items:
        notes.append("No rule applies to this crop stage today.")
    if any(rule["review_status"] != "reviewed" for rule, _ in items):
        notes.append("This advice is pending expert review; treat it as general guidance.")
    if language != "en":
        notes.append("Yorùbá text for these insights is not available yet; showing English.")

    return {
        "date": date.today().isoformat(),
        "context": {"farm_id": farm_id, "crop": crop, "state": state, "lga": lga,
                    "planting_date": planting_date.isoformat() if planting_date else None,
                    "days_after_planting": days},
        "items": [public_rule(rule, reason) for rule, reason in items],
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
        if not _crop_applies(rule, crop) or (category and rule["category"] != category):
            continue
        if not _region_applies(rule, state, None):
            continue
        text = " ".join(str(rule[k]) for k in ("title", "action", "rationale", "category")).lower()
        if words and not any(w in text for w in words):
            continue
        results.append(public_rule(rule, "Matches your search."))
    results.sort(key=lambda item: (item["priority"], item["rule_id"]))
    return {"crop": crop, "category": category, "items": results,
            "status": "ok" if results else "no_matching_guidance"}


def harvest_readiness(crop: str, state: str | None = None, lga: str | None = None,
                      planting_date: date | None = None, include_weather: bool = True,
                      farm_id: str | None = None) -> dict:
    """Expected harvest window, current phase, readiness checks and post-harvest guidance."""
    crop, state, lga = _context(crop, state, lga)
    profile = CROP_PROFILES.get(crop)
    today = date.today()
    days = (today - planting_date).days if planting_date else None

    window = None
    phase = "unknown"
    days_to_window = None
    if profile and planting_date:
        start = planting_date + timedelta(days=profile["harvest_window_days"][0])
        end = planting_date + timedelta(days=profile["harvest_window_days"][1])
        window = {"start_date": start.isoformat(), "end_date": end.isoformat(),
                  "counted_from": profile["counted_from"], "uncertainty": profile["uncertainty"],
                  "source": profile["source"], "review_status": profile["review_status"]}
        days_to_window = (start - today).days
        if today > end:
            phase = "past_typical_window"
        elif today >= start:
            phase = "harvest_window"
        elif days_to_window <= 21:
            phase = "approaching_harvest"
        else:
            phase = "growing"

    rain = None
    weather = None
    if include_weather and state:
        weather = get_weather(state, lga)
        rain = max_rain_probability(weather)

    def items(category: str, stage_aware: bool) -> list[dict]:
        if stage_aware:
            return [public_rule(r, why) for r, why in matching_rules(crop, state, lga, days, rain, today, category)]
        return search_knowledge(crop, category, state)["items"]

    checks = items("harvest", stage_aware=days is not None)
    if days is not None and not checks:
        checks = search_knowledge(crop, "harvest", state)["items"]
    weather_alerts = [i for i in items("weather", stage_aware=True)] if weather else []

    suggested_report = None
    if window and state and lga and phase in ("growing", "approaching_harvest", "harvest_window"):
        available = max(date.fromisoformat(window["start_date"]), today)
        suggested_report = {"crop": crop, "state": state, "lga": lga, "available_date": available.isoformat(),
                            "status": "available" if phase == "harvest_window" else "expected",
                            "farm_id": farm_id}

    missing = []
    if planting_date is None:
        missing.append({"field": "planting_date", "message": "Add a planting date to estimate your harvest window."})
    if profile is None:
        missing.append({"field": "crop", "message": f"No harvest profile for {CROPS[crop]['name_en']} yet."})

    return {
        "date": today.isoformat(),
        "context": {"farm_id": farm_id, "crop": crop, "state": state, "lga": lga,
                    "planting_date": planting_date.isoformat() if planting_date else None,
                    "days_after_planting": days},
        "phase": phase,
        "days_to_window": days_to_window,
        "expected_window": window,
        "readiness_checks": checks,
        "post_harvest": search_knowledge(crop, "post_harvest", state)["items"],
        "market": search_knowledge(crop, "market", state)["items"],
        "weather_alerts": weather_alerts,
        "suggested_report": suggested_report,
        "missing_context": missing,
        "notes": ["Harvest windows are approximate and pending expert review; confirm readiness in the field."],
    }
