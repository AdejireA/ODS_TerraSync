import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("TERRASYNC_DATABASE_PATH", str(tmp_path / "test.db"))
    monkeypatch.setenv("TERRASYNC_SECRET_KEY", "test-secret")
    monkeypatch.setenv("TERRASYNC_COORDINATOR_CODE", "coord-123")
    monkeypatch.setenv("TERRASYNC_WEATHER_ENABLED", "false")
    monkeypatch.setenv("TERRASYNC_RATE_LIMIT_MULTIPLIER", "100")
    for name in ("LIVEKIT_URL", "LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"):
        monkeypatch.delenv(name, raising=False)

    from app.core import ratelimit
    from app.main import app
    from app.services import weather
    ratelimit.reset()
    weather.clear_cache()
    with TestClient(app) as test_client:
        yield test_client


def register(client, phone="08011111111", role="farmer", **extra) -> dict:
    body = {"phone": phone, "pin": "1234", "role": role, **extra}
    response = client.post("/api/v1/auth/register", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def auth(session: dict) -> dict:
    return {"Authorization": f"Bearer {session['access_token']}"}
