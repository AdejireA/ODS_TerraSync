"""Weather observations from Open-Meteo (no API key). Never fabricated.

The location is the state capital until LGA coordinates are added, and every
response says so. On any failure the service returns `available: false`.
"""
import json
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

from app.core.config import env_bool, env_int
from app.data.catalog import STATES, normalize_state

PROVIDER = "Open-Meteo"
_cache: dict[str, tuple[float, dict]] = {}
_lock = threading.Lock()


def _fetch(lat: float, lon: float) -> dict:
    query = urllib.parse.urlencode({
        "latitude": lat, "longitude": lon, "timezone": "Africa/Lagos", "forecast_days": 3,
        "current": "temperature_2m,relative_humidity_2m,precipitation",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    })
    request = urllib.request.Request(f"https://api.open-meteo.com/v1/forecast?{query}",
                                     headers={"User-Agent": "TerraSync/0.2"})
    with urllib.request.urlopen(request, timeout=env_int("TERRASYNC_WEATHER_TIMEOUT", 6)) as response:
        return json.loads(response.read())


def get_weather(state: str, lga: str | None = None) -> dict:
    state = normalize_state(state)
    info = STATES[state]
    base = {
        "provider": PROVIDER, "state": state, "lga": lga,
        "location": {"name": info["capital"], "lat": info["lat"], "lon": info["lon"],
                     "resolution": "state_capital",
                     "note": f"Approximate: forecast for {info['capital']}, not your exact farm."},
    }
    if not env_bool("TERRASYNC_WEATHER_ENABLED", True):
        return {**base, "available": False, "reason": "Weather is disabled on this server"}

    with _lock:
        cached = _cache.get(state)
    if cached and time.time() - cached[0] < env_int("TERRASYNC_WEATHER_CACHE_SECONDS", 1800):
        return {**base, **cached[1]}

    try:
        raw = _fetch(info["lat"], info["lon"])
        daily = raw["daily"]
        result = {
            "available": True,
            "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "current": {
                "time": raw["current"]["time"],
                "temperature_c": raw["current"]["temperature_2m"],
                "relative_humidity_pct": raw["current"]["relative_humidity_2m"],
                "precipitation_mm": raw["current"]["precipitation"],
            },
            "daily": [
                {"date": day, "temperature_max_c": daily["temperature_2m_max"][i],
                 "temperature_min_c": daily["temperature_2m_min"][i],
                 "precipitation_mm": daily["precipitation_sum"][i],
                 "precipitation_probability_pct": daily["precipitation_probability_max"][i]}
                for i, day in enumerate(daily["time"])
            ],
        }
    except Exception as exc:  # network, timeout or unexpected payload
        return {**base, "available": False, "reason": f"Weather provider unavailable ({type(exc).__name__})"}

    with _lock:
        _cache[state] = (time.time(), result)
    return {**base, **result}


def max_rain_probability(weather: dict) -> int | None:
    if not weather.get("available"):
        return None
    values = [d["precipitation_probability_pct"] for d in weather["daily"] if d["precipitation_probability_pct"] is not None]
    return max(values) if values else None


def clear_cache() -> None:
    with _lock:
        _cache.clear()
