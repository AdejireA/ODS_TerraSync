"""Small in-memory sliding-window rate limiter (single-process prototype)."""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from app.core.config import env_int

_hits: dict[str, deque] = defaultdict(deque)
_lock = threading.Lock()


def rate_limit(bucket: str, limit: int, window_seconds: int = 60):
    def dependency(request: Request) -> None:
        effective = env_int("TERRASYNC_RATE_LIMIT_MULTIPLIER", 1) * limit
        client = request.client.host if request.client else "unknown"
        key = f"{bucket}:{client}"
        now = time.monotonic()
        with _lock:
            hits = _hits[key]
            while hits and now - hits[0] > window_seconds:
                hits.popleft()
            if len(hits) >= effective:
                raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests, please try again shortly")
            hits.append(now)
    return dependency


def reset() -> None:
    with _lock:
        _hits.clear()
