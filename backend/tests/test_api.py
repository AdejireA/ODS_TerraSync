from datetime import date, timedelta

from tests.conftest import auth, register

SOON = (date.today() + timedelta(days=7)).isoformat()
REPORT = {"crop": "Maize", "quantity": 20, "unit": "bags", "state": "Ogun", "lga": "Odeda",
          "available_date": SOON, "contact": "08012345678"}


def test_health(client):
    body = client.get("/health").json()
    assert body["status"] == "ok" and body["database"] == "ok" and body["voice_configured"] is False


# ------------------------------------------------------------------ auth

def test_register_login_me(client):
    session = register(client, phone="0801 111 1111")
    assert session["user"]["phone"] == "+2348011111111"
    login = client.post("/api/v1/auth/login", json={"phone": "+2348011111111", "pin": "1234"})
    assert login.status_code == 200
    me = client.get("/api/v1/auth/me", headers=auth(login.json()))
    assert me.json()["role"] == "farmer"


def test_wrong_pin_duplicate_and_bad_token(client):
    register(client)
    assert client.post("/api/v1/auth/login", json={"phone": "08011111111", "pin": "9999"}).status_code == 401
    assert client.post("/api/v1/auth/register", json={"phone": "08011111111", "pin": "1234"}).status_code == 409
    assert client.get("/api/v1/auth/me", headers={"Authorization": "Bearer nope.nope"}).status_code == 401
    assert client.get("/api/v1/auth/me").status_code == 401


def test_coordinator_requires_code(client):
    bad = client.post("/api/v1/auth/register", json={"phone": "08022222222", "pin": "1234", "role": "coordinator"})
    assert bad.status_code == 403
    good = register(client, phone="08022222222", role="coordinator", coordinator_code="coord-123")
    assert good["user"]["role"] == "coordinator"


# --------------------------------------------------------------- harvest

def test_anonymous_report_is_normalised_and_hides_contact(client):
    created = client.post("/api/v1/harvest-reports", json={**REPORT, "unit": "Bag", "lga": "odeda"})
    assert created.status_code == 201
    board = client.get("/api/v1/harvest-reports").json()
    assert len(board) == 1
    item = board[0]
    assert (item["crop"], item["unit"], item["lga"], item["status"]) == ("maize", "bags", "Odeda", "expected")
    assert "contact" not in item and item["interested"] is False


def test_report_validation(client):
    for field, value in [("crop", "banana"), ("unit", "lorries"), ("state", "Kano"), ("lga", "Ikeja"),
                         ("quantity", 0), ("available_date", "2001-01-01")]:
        response = client.post("/api/v1/harvest-reports", json={**REPORT, field: value})
        assert response.status_code == 422, (field, response.text)


def test_board_filters_and_expiry(client):
    client.post("/api/v1/harvest-reports", json=REPORT)
    client.post("/api/v1/harvest-reports", json={**REPORT, "crop": "cassava", "lga": "Ifo"})
    old = (date.today() - timedelta(days=20)).isoformat()
    client.post("/api/v1/harvest-reports", json={**REPORT, "available_date": old})
    assert len(client.get("/api/v1/harvest-reports", params={"crop": "cassava"}).json()) == 1
    assert len(client.get("/api/v1/harvest-reports", params={"state": "Ogun", "lga": "Odeda"}).json()) == 1
    everything = client.get("/api/v1/harvest-reports", params={"include_expired": True}).json()
    assert len(everything) == 3
    assert {r["effective_status"] for r in everything} == {"expected", "expired"}
    assert client.get("/api/v1/harvest-reports", params={"crop": "banana"}).status_code == 422


def test_interest_and_contact_are_coordinator_only(client):
    farmer = register(client)
    coordinator = register(client, phone="08022222222", role="coordinator", coordinator_code="coord-123")
    with_consent = client.post("/api/v1/harvest-reports", json={**REPORT, "contact_consent": True},
                               headers=auth(farmer)).json()["id"]
    without = client.post("/api/v1/harvest-reports", json=REPORT).json()["id"]

    assert client.post(f"/api/v1/harvest-reports/{with_consent}/interest").status_code == 401
    assert client.post(f"/api/v1/harvest-reports/{with_consent}/interest", headers=auth(farmer)).status_code == 403
    marked = client.post(f"/api/v1/harvest-reports/{with_consent}/interest", headers=auth(coordinator))
    assert marked.json() == {"id": with_consent, "interested": True, "interest_count": 1}

    assert client.get(f"/api/v1/harvest-reports/{with_consent}/contact", headers=auth(farmer)).status_code == 403
    contact = client.get(f"/api/v1/harvest-reports/{with_consent}/contact", headers=auth(coordinator))
    assert contact.json()["contact"] == "08012345678"
    assert client.get(f"/api/v1/harvest-reports/{without}/contact", headers=auth(coordinator)).status_code == 403


def test_status_change_owner_only(client):
    owner = register(client)
    other = register(client, phone="08033333333")
    report_id = client.post("/api/v1/harvest-reports", json=REPORT, headers=auth(owner)).json()["id"]
    assert client.patch(f"/api/v1/harvest-reports/{report_id}/status", json={"status": "sold"},
                        headers=auth(other)).status_code == 403
    sold = client.patch(f"/api/v1/harvest-reports/{report_id}/status", json={"status": "sold"}, headers=auth(owner))
    assert sold.json()["status"] == "sold"
    assert client.get("/api/v1/harvest-reports").json() == []  # sold items leave the live board
    assert len(client.get("/api/v1/harvest-reports/mine", headers=auth(owner)).json()) == 1


def test_draft_confirm_is_idempotent_and_owned(client):
    owner = register(client)
    other = register(client, phone="08033333333")
    draft = client.post("/api/v1/harvest-drafts", json={**REPORT, "quantity": 12}, headers=auth(owner)).json()
    assert client.put(f"/api/v1/harvest-drafts/{draft['id']}", json=REPORT, headers=auth(other)).status_code == 403
    client.put(f"/api/v1/harvest-drafts/{draft['id']}", json=REPORT, headers=auth(owner))
    assert client.get("/api/v1/harvest-reports").json() == []
    first = client.post(f"/api/v1/harvest-drafts/{draft['id']}/confirm", headers=auth(owner)).json()
    second = client.post(f"/api/v1/harvest-drafts/{draft['id']}/confirm", headers=auth(owner)).json()
    assert first == second
    board = client.get("/api/v1/harvest-reports").json()
    assert len(board) == 1 and board[0]["quantity"] == 20


# ------------------------------------------------------- farms & insights

def test_farms_are_private(client):
    farmer = register(client)
    other = register(client, phone="08033333333")
    assert client.post("/api/v1/farms", json={"state": "Ogun", "lga": "Odeda", "crop": "maize"}).status_code == 401
    farm = client.post("/api/v1/farms", json={"state": "ogun", "lga": "Odeda", "crop": "Maize",
                                              "approximate_age_weeks": 2}, headers=auth(farmer))
    assert farm.status_code == 201
    farm_id = farm.json()["id"]
    assert client.get(f"/api/v1/farms/{farm_id}", headers=auth(other)).status_code == 404
    assert len(client.get("/api/v1/farms", headers=auth(farmer)).json()) == 1
    bad = client.post("/api/v1/farms", json={"state": "Ogun", "lga": "Ikeja", "crop": "maize"}, headers=auth(farmer))
    assert bad.status_code == 422


def test_guest_insights_by_stage(client):
    planted = (date.today() - timedelta(days=20)).isoformat()
    body = client.get("/api/v1/insights/today", params={"crop": "maize", "state": "Ogun", "lga": "Odeda",
                                                        "planting_date": planted}).json()
    ids = [item["rule_id"] for item in body["items"]]
    # Same priority: the more local (southwest) rule ranks before the national one.
    assert ids == ["maize-weed-early", "maize-faw-scouting"]
    assert body["context"]["days_after_planting"] == 20
    assert all(item["review_status"] == "unreviewed" and item["evidence"]["source_url"] for item in body["items"])
    assert any("pending expert review" in note for note in body["notes"])


def test_insights_missing_context_and_unsupported_crop(client):
    body = client.get("/api/v1/insights/today", params={"crop": "maize"}).json()
    assert {m["field"] for m in body["missing_context"]} >= {"planting_date", "state"}
    tomato = client.get("/api/v1/insights/today", params={"crop": "tomato", "state": "Ogun"}).json()
    assert tomato["items"] == [] and tomato["status"] == "no_applicable_rules"
    assert any("does not have rules" in note for note in tomato["notes"])
    assert client.get("/api/v1/insights/today").status_code == 422


def test_insights_from_saved_farm(client):
    farmer = register(client)
    farm_id = client.post("/api/v1/farms", json={"state": "Ogun", "lga": "Odeda", "crop": "cassava",
                                                 "planting_date": (date.today() - timedelta(days=30)).isoformat()},
                          headers=auth(farmer)).json()["id"]
    assert client.get("/api/v1/insights/today", params={"farm_id": farm_id}).status_code == 401
    body = client.get("/api/v1/insights/today", params={"farm_id": farm_id}, headers=auth(farmer)).json()
    assert body["context"]["farm_id"] == farm_id
    assert "cassava-weed-early" in [item["rule_id"] for item in body["items"]]


def test_rain_rule_uses_weather(client, monkeypatch):
    from app.services import weather
    monkeypatch.setenv("TERRASYNC_WEATHER_ENABLED", "true")
    monkeypatch.setattr(weather, "_fetch", lambda lat, lon: {
        "current": {"time": "now", "temperature_2m": 28, "relative_humidity_2m": 80, "precipitation": 0},
        "daily": {"time": ["d1"], "temperature_2m_max": [31], "temperature_2m_min": [23],
                  "precipitation_sum": [12], "precipitation_probability_max": [85]}})
    planted = (date.today() - timedelta(days=100)).isoformat()
    body = client.get("/api/v1/insights/today", params={"crop": "maize", "state": "Ogun",
                                                        "planting_date": planted}).json()
    assert body["items"][0]["rule_id"] == "maize-rain-at-harvest"
    assert body["weather"]["available"] is True


def test_weather_unavailable_is_honest(client, monkeypatch):
    from app.services import weather
    monkeypatch.setenv("TERRASYNC_WEATHER_ENABLED", "true")

    def boom(lat, lon):
        raise TimeoutError()
    monkeypatch.setattr(weather, "_fetch", boom)
    body = client.get("/api/v1/weather", params={"state": "Ogun"}).json()
    assert body["available"] is False and "unavailable" in body["reason"]
    assert body["location"]["resolution"] == "state_capital"


def test_reference_and_knowledge(client):
    states = client.get("/api/v1/locations").json()["states"]
    assert [s["name"] for s in states] == ["Ogun", "Ondo", "Osun", "Lagos"]
    assert len(states[0]["lgas"]) == 20
    assert "bags" in client.get("/api/v1/crops").json()["units"]
    post = client.get("/api/v1/knowledge", params={"crop": "maize", "category": "post_harvest"}).json()
    assert [i["rule_id"] for i in post["items"]] == ["maize-dry-before-storage"]


# ------------------------------------------------------------- tasks/voice

def test_tasks(client):
    farmer = register(client)
    assert client.get("/api/v1/tasks").status_code == 401
    task = client.post("/api/v1/tasks", json={"action": "Weed the maize", "rule_id": "maize-weed-early"},
                       headers=auth(farmer)).json()
    done = client.patch(f"/api/v1/tasks/{task['id']}", json={"status": "done"}, headers=auth(farmer)).json()
    assert done["status"] == "done" and done["completed_at"]


def test_voice_session_unconfigured_returns_503(client):
    response = client.post("/api/v1/voice/session", json={"language": "yo"})
    assert response.status_code == 503
    assert client.post("/api/v1/voice/session", json={"farm_id": "x"}).status_code == 401


def test_voice_session_token(client, monkeypatch):
    import pytest
    api = pytest.importorskip("livekit.api")
    monkeypatch.setenv("LIVEKIT_URL", "wss://example.livekit.cloud")
    monkeypatch.setenv("LIVEKIT_API_KEY", "key")
    monkeypatch.setenv("LIVEKIT_API_SECRET", "secret-secret-secret-secret-secret")
    farmer = register(client)
    session = client.post("/api/v1/voice/session", json={"language": "yo"}, headers=auth(farmer))
    assert session.status_code == 201, session.text
    body = session.json()
    claims = api.TokenVerifier("key", "secret-secret-secret-secret-secret").verify(body["token"])
    assert claims.video.room == body["room"]
    assert claims.room_config.agents[0].agent_name == "terrasync-farmer-assistant"
    assert body["transcripts_stored"] is True

    from app.services import voice
    voice.add_transcript(body["session_id"], "user", "Hello")
    transcript = client.get(f"/api/v1/voice/sessions/{body['session_id']}/transcript", headers=auth(farmer)).json()
    assert transcript["items"][0]["text"] == "Hello"
    other = register(client, phone="08033333333")
    assert client.get(f"/api/v1/voice/sessions/{body['session_id']}/transcript",
                      headers=auth(other)).status_code == 404
