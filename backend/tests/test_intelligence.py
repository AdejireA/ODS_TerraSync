"""Knowledge base, harvest intelligence and supply intelligence."""
from datetime import date, timedelta

import pytest

from tests.conftest import auth, register


def _weather(monkeypatch, rain_probability: int):
    from app.services import weather
    monkeypatch.setenv("TERRASYNC_WEATHER_ENABLED", "true")
    monkeypatch.setattr(weather, "_fetch", lambda lat, lon: {
        "current": {"time": "now", "temperature_2m": 30, "relative_humidity_2m": 60, "precipitation": 0},
        "daily": {"time": ["d1", "d2"], "temperature_2m_max": [33, 33], "temperature_2m_min": [23, 23],
                  "precipitation_sum": [0, 0], "precipitation_probability_max": [rain_probability, 5]}})


# --------------------------------------------------------------- knowledge

def test_knowledge_base_is_valid_and_honest():
    from app.data.rules import CROP_PROFILES, RULES
    assert len(RULES) >= 30
    assert set(CROP_PROFILES) == {"maize", "cassava", "yam", "tomato", "pepper", "groundnut"}
    for rule in RULES:
        assert rule["source"]["url"].startswith("https://")
        # Nothing is presented as reviewed or verified until an expert signs it off.
        assert rule["review_status"] == "unreviewed" and rule["source"]["verified"] is False
        text = (rule["action"] + rule["rationale"]).lower()
        assert "ml" not in text.split() and "kg/ha" not in text  # no doses or rates


def test_invalid_rule_is_rejected():
    from pydantic import ValidationError
    from app.data.rules import Rule
    base = {"id": "x-rule", "crop": "maize", "category": "crop_care", "region": {"level": "national"},
            "priority": 1, "title": "Title", "action": "Act", "rationale": "Why", "uncertainty": "Some",
            "source": {"title": "S", "url": "https://example.org"}}
    with pytest.raises(ValidationError):
        Rule.model_validate({**base, "trigger": {"type": "stage"}})  # stage without window
    with pytest.raises(ValidationError):
        Rule.model_validate({**base, "crop": "banana", "trigger": {"type": "always"}})
    with pytest.raises(ValidationError):
        Rule.model_validate({**base, "region": {"level": "lga", "lgas": ["Nowhere"]}, "trigger": {"type": "always"}})


def test_month_rules_follow_the_calendar():
    from app.services.insights import matching_rules
    april = [r["id"] for r, _ in matching_rules("maize", "Ogun", None, None, None, date(2027, 4, 10))]
    december = [r["id"] for r, _ in matching_rules("maize", "Ogun", None, None, None, date(2027, 12, 10))]
    assert "maize-early-season-planting" in april and "maize-early-season-planting" not in december


def test_dry_spell_rule_for_young_crop(client, monkeypatch):
    _weather(monkeypatch, rain_probability=10)
    planted = (date.today() - timedelta(days=10)).isoformat()
    body = client.get("/api/v1/insights/today", params={"crop": "cassava", "state": "Ogun", "lga": "Ifo",
                                                        "planting_date": planted}).json()
    assert "all-dry-spell-young-crop" in [i["rule_id"] for i in body["items"]]


def test_knowledge_search_and_categories(client):
    body = client.get("/api/v1/knowledge", params={"crop": "Ẹgẹ́", "q": "cuttings"}).json()
    assert body["crop"] == "cassava" and "cassava-healthy-cuttings" in [i["rule_id"] for i in body["items"]]
    market = client.get("/api/v1/knowledge", params={"crop": "tomato", "category": "market"}).json()
    assert [i["rule_id"] for i in market["items"]] == ["tomato-report-expected-harvest"]
    assert client.get("/api/v1/knowledge", params={"crop": "maize", "category": "bogus"}).status_code == 422


# ----------------------------------------------------------- harvest intel

def test_harvest_readiness_phases(client):
    today = date.today()
    growing = client.get("/api/v1/harvest-readiness", params={
        "crop": "maize", "state": "Ogun", "lga": "Odeda", "planting_date": (today - timedelta(days=30)).isoformat(),
        "include_weather": False}).json()
    assert growing["phase"] == "growing" and growing["days_to_window"] == 60
    assert growing["expected_window"]["start_date"] == (today + timedelta(days=60)).isoformat()
    assert growing["suggested_report"]["available_date"] == growing["expected_window"]["start_date"]
    assert growing["suggested_report"]["status"] == "expected"
    assert {i["rule_id"] for i in growing["post_harvest"]} == {"maize-dry-before-storage", "maize-sort-mouldy-cobs"}

    ready = client.get("/api/v1/harvest-readiness", params={
        "crop": "maize", "state": "Ogun", "lga": "Odeda", "planting_date": (today - timedelta(days=100)).isoformat(),
        "include_weather": False}).json()
    assert ready["phase"] == "harvest_window"
    assert "maize-harvest-readiness" in [i["rule_id"] for i in ready["readiness_checks"]]
    assert ready["suggested_report"] == {"crop": "maize", "state": "Ogun", "lga": "Odeda",
                                         "available_date": today.isoformat(), "status": "available", "farm_id": None}

    late = client.get("/api/v1/harvest-readiness", params={
        "crop": "maize", "planting_date": (today - timedelta(days=200)).isoformat(), "include_weather": False}).json()
    assert late["phase"] == "past_typical_window" and late["suggested_report"] is None


def test_harvest_readiness_without_planting_date(client):
    body = client.get("/api/v1/harvest-readiness", params={"crop": "yam", "include_weather": False}).json()
    assert body["phase"] == "unknown" and body["expected_window"] is None
    assert body["missing_context"][0]["field"] == "planting_date"
    assert body["readiness_checks"] and body["post_harvest"]  # general guidance still returned


def test_harvest_readiness_from_saved_farm(client):
    farmer = register(client)
    farm_id = client.post("/api/v1/farms", json={"state": "Ogun", "lga": "Ijebu Ode", "crop": "cassava",
                                                 "approximate_age_weeks": 40}, headers=auth(farmer)).json()["id"]
    assert client.get("/api/v1/harvest-readiness", params={"farm_id": farm_id}).status_code == 401
    body = client.get("/api/v1/harvest-readiness", params={"farm_id": farm_id, "include_weather": False},
                      headers=auth(farmer)).json()
    assert body["phase"] == "harvest_window" and body["suggested_report"]["farm_id"] == farm_id


# ------------------------------------------------------------ supply intel

def test_supply_summary_never_mixes_units(client):
    soon = (date.today() + timedelta(days=10)).isoformat()
    base = {"crop": "maize", "state": "Ogun", "lga": "Odeda", "available_date": soon, "contact": "0801"}
    client.post("/api/v1/harvest-reports", json={**base, "quantity": 20, "unit": "bags"})
    client.post("/api/v1/harvest-reports", json={**base, "quantity": 5, "unit": "bags"})
    client.post("/api/v1/harvest-reports", json={**base, "quantity": 2, "unit": "tons"})
    client.post("/api/v1/harvest-reports", json={**base, "crop": "cassava", "lga": "Ifo", "quantity": 3, "unit": "tons",
                                                 "available_date": (date.today() + timedelta(days=200)).isoformat()})
    body = client.get("/api/v1/supply/summary", params={"days": 60}).json()
    totals = {(t["crop"], t["unit"]): t for t in body["totals"]}
    assert set(totals) == {("maize", "bags"), ("maize", "tons")}  # cassava is beyond the horizon
    assert totals[("maize", "bags")]["total_quantity"] == 25 and totals[("maize", "bags")]["reports"] == 2
    assert totals[("maize", "tons")]["total_quantity"] == 2
    assert all(w["week_start"] for w in body["weekly"])
    assert "maize" in body["post_harvest_guidance"]
    assert "not total production" in body["disclaimer"]
    only_cassava = client.get("/api/v1/supply/summary", params={"crop": "cassava", "days": 365}).json()
    assert [t["crop"] for t in only_cassava["totals"]] == ["cassava"]


# --------------------------------------------------------------- ogun only

def test_backend_is_ogun_only_by_default(client, monkeypatch):
    report = {"crop": "maize", "quantity": 1, "unit": "bags", "state": "Lagos", "lga": "Ikeja",
              "available_date": (date.today() + timedelta(days=5)).isoformat(), "contact": "0801"}
    rejected = client.post("/api/v1/harvest-reports", json=report)
    assert rejected.status_code == 422 and "Ogun" in rejected.text
    monkeypatch.setenv("TERRASYNC_ACTIVE_STATES", "Ogun,Lagos")
    assert client.post("/api/v1/harvest-reports", json=report).status_code == 201
