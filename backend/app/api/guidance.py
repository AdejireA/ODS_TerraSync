from fastapi import APIRouter, Query
from app.core.database import connection

router = APIRouter(prefix="/guidance", tags=["guidance"])

@router.get("")
def find_guidance(crop: str = Query(min_length=1), language: str = Query(default="en", pattern="^(en|yo)$")):
    """Return reviewed guidance in the requested language, when available."""
    with connection() as db:
        rows = db.execute(
            "SELECT crop, language, title, content, source_url FROM guidance WHERE lower(crop) = lower(?) AND language = ? AND reviewed = 1",
            (crop, language),
        ).fetchall()
    return {"items": [dict(row) for row in rows]}
