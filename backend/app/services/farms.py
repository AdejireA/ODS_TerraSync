"""Farm profiles owned by signed-in farmers."""
from datetime import date, timedelta
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.database import connection
from app.data.catalog import normalize_crop, normalize_lga, normalize_state
from app.services.harvest import NotFound

FARM_COLUMNS = ("id, name, state, lga, crop, planting_date, approximate_age_weeks, soil_type, "
                "farm_size_ha, created_at, updated_at")


class FarmInput(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    state: str
    lga: str
    crop: str
    planting_date: date | None = None
    approximate_age_weeks: int | None = Field(default=None, ge=0, le=156)
    soil_type: str | None = Field(default=None, max_length=50)
    farm_size_ha: float | None = Field(default=None, gt=0, le=10_000)

    @field_validator("crop")
    @classmethod
    def _crop(cls, value: str) -> str:
        return normalize_crop(value)

    @field_validator("state")
    @classmethod
    def _state(cls, value: str) -> str:
        return normalize_state(value)

    @field_validator("planting_date")
    @classmethod
    def _planting(cls, value: date | None) -> date | None:
        if value and value > date.today() + timedelta(days=180):
            raise ValueError("Planting date is too far in the future")
        return value

    @model_validator(mode="after")
    def _lga(self):
        self.lga = normalize_lga(self.state, self.lga)
        return self


def effective_planting_date(farm: dict) -> date | None:
    """Exact planting date, else one estimated from the approximate crop age."""
    if farm.get("planting_date"):
        return date.fromisoformat(str(farm["planting_date"]))
    if farm.get("approximate_age_weeks") is not None:
        return date.today() - timedelta(weeks=int(farm["approximate_age_weeks"]))
    return None


def create_farm(user_id: str, farm: FarmInput) -> dict:
    farm_id = str(uuid4())
    with connection() as db:
        db.execute(
            """INSERT INTO farms (id, user_id, name, state, lga, crop, planting_date, approximate_age_weeks,
               soil_type, farm_size_ha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (farm_id, user_id, farm.name, farm.state, farm.lga, farm.crop,
             farm.planting_date.isoformat() if farm.planting_date else None,
             farm.approximate_age_weeks, farm.soil_type, farm.farm_size_ha),
        )
    return get_farm(user_id, farm_id)


def update_farm(user_id: str, farm_id: str, farm: FarmInput) -> dict:
    with connection() as db:
        result = db.execute(
            """UPDATE farms SET name = ?, state = ?, lga = ?, crop = ?, planting_date = ?,
               approximate_age_weeks = ?, soil_type = ?, farm_size_ha = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ? AND user_id = ?""",
            (farm.name, farm.state, farm.lga, farm.crop,
             farm.planting_date.isoformat() if farm.planting_date else None,
             farm.approximate_age_weeks, farm.soil_type, farm.farm_size_ha, farm_id, user_id),
        )
        if not result.rowcount:
            raise NotFound("Farm not found")
    return get_farm(user_id, farm_id)


def get_farm(user_id: str, farm_id: str) -> dict:
    with connection() as db:
        row = db.execute(f"SELECT {FARM_COLUMNS} FROM farms WHERE id = ? AND user_id = ?", (farm_id, user_id)).fetchone()
    if row is None:
        raise NotFound("Farm not found")
    return dict(row)


def list_farms(user_id: str) -> list[dict]:
    with connection() as db:
        rows = db.execute(f"SELECT {FARM_COLUMNS} FROM farms WHERE user_id = ? ORDER BY created_at", (user_id,)).fetchall()
    return [dict(row) for row in rows]
