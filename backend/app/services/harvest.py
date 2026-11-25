"""Harvest reports, drafts and coordinator interest — shared by API and voice."""
import json
from datetime import date, timedelta
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator, model_validator

from app.core.config import env_int
from app.core.database import connection
from app.data.catalog import normalize_crop, normalize_lga, normalize_state, normalize_unit

ReportStatus = Literal["expected", "available", "sold", "withdrawn"]
PUBLIC_FIELDS = ("id, crop, quantity, unit, state, lga, available_date, status, source, created_at, updated_at")


class NotFound(Exception):
    pass


class Forbidden(Exception):
    pass


class HarvestReport(BaseModel):
    crop: str = Field(min_length=1, max_length=100)
    quantity: float = Field(gt=0, le=1_000_000)
    unit: str = Field(min_length=1, max_length=50)
    state: str = Field(min_length=1, max_length=100)
    lga: str = Field(min_length=1, max_length=100)
    available_date: date
    contact: str = Field(min_length=1, max_length=100)
    contact_consent: bool = False
    status: Literal["expected", "available"] = "expected"
    farm_id: str | None = None

    @field_validator("crop")
    @classmethod
    def _crop(cls, value: str) -> str:
        return normalize_crop(value)

    @field_validator("unit")
    @classmethod
    def _unit(cls, value: str) -> str:
        return normalize_unit(value)

    @field_validator("state")
    @classmethod
    def _state(cls, value: str) -> str:
        return normalize_state(value)

    @field_validator("available_date")
    @classmethod
    def _date(cls, value: date) -> date:
        today = date.today()
        if value < today - timedelta(days=30):
            raise ValueError("Available date is too far in the past")
        if value > today + timedelta(days=730):
            raise ValueError("Available date must be within two years")
        return value

    @model_validator(mode="after")
    def _lga(self):
        self.lga = normalize_lga(self.state, self.lga)
        return self


def _expiry_cutoff() -> str:
    return (date.today() - timedelta(days=env_int("TERRASYNC_REPORT_EXPIRY_DAYS", 14))).isoformat()


def _public(row) -> dict:
    item = dict(row)
    item["interested"] = bool(item.pop("interest_count", 0))
    item["interest_count"] = row["interest_count"]
    if item["status"] in ("expected", "available") and item["available_date"] < _expiry_cutoff():
        item["effective_status"] = "expired"
    else:
        item["effective_status"] = item["status"]
    return item


def _insert(db, report: HarvestReport, user_id: str | None, source: str) -> int:
    if report.farm_id:
        farm = db.execute("SELECT user_id FROM farms WHERE id = ?", (report.farm_id,)).fetchone()
        if farm is None or farm["user_id"] != user_id:
            raise Forbidden("Farm not found for this account")
    result = db.execute(
        """INSERT INTO harvest_reports (crop, quantity, unit, state, lga, available_date, contact,
           contact_consent, status, user_id, farm_id, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (report.crop, report.quantity, report.unit, report.state, report.lga,
         report.available_date.isoformat(), report.contact, int(report.contact_consent),
         report.status, user_id, report.farm_id, source),
    )
    return result.lastrowid


def create_report(report: HarvestReport, user_id: str | None = None, source: str = "web") -> dict:
    with connection() as db:
        return {"id": _insert(db, report, user_id, source), "status": "created"}


def list_reports(crop: str | None = None, state: str | None = None, lga: str | None = None,
                 status: str | None = None, available_from: date | None = None,
                 available_to: date | None = None, include_expired: bool = False,
                 user_id: str | None = None, limit: int = 100) -> list[dict]:
    clauses, params = [], []
    if crop:
        clauses.append("h.crop = ?"); params.append(normalize_crop(crop))
    if state:
        state = normalize_state(state)
        clauses.append("h.state = ?"); params.append(state)
        if lga:
            clauses.append("h.lga = ?"); params.append(normalize_lga(state, lga))
    elif lga:
        clauses.append("lower(h.lga) = lower(?)"); params.append(lga)
    if status:
        clauses.append("h.status = ?"); params.append(status)
    elif user_id is None:
        clauses.append("h.status IN ('expected', 'available')")
    if available_from:
        clauses.append("h.available_date >= ?"); params.append(available_from.isoformat())
    if available_to:
        clauses.append("h.available_date <= ?"); params.append(available_to.isoformat())
    if not include_expired and user_id is None:
        clauses.append("(h.available_date >= ? OR h.status NOT IN ('expected', 'available'))")
        params.append(_expiry_cutoff())
    if user_id is not None:
        clauses.append("h.user_id = ?"); params.append(user_id)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    columns = ", ".join(f"h.{c.strip()}" for c in PUBLIC_FIELDS.split(","))
    sql = (f"SELECT {columns}, (SELECT COUNT(*) FROM harvest_interests i WHERE i.report_id = h.id) AS interest_count "
           f"FROM harvest_reports h {where} ORDER BY h.available_date ASC, h.id DESC LIMIT ?")
    with connection() as db:
        rows = db.execute(sql, (*params, max(1, min(limit, 500)))).fetchall()
    return [_public(row) for row in rows]


def get_report(report_id: int) -> dict:
    with connection() as db:
        row = db.execute(
            f"SELECT {PUBLIC_FIELDS}, (SELECT COUNT(*) FROM harvest_interests i WHERE i.report_id = harvest_reports.id) "
            "AS interest_count FROM harvest_reports WHERE id = ?", (report_id,)).fetchone()
    if row is None:
        raise NotFound("Harvest report not found")
    return _public(row)


def update_status(report_id: int, status: ReportStatus, user_id: str, role: str) -> dict:
    with connection() as db:
        row = db.execute("SELECT user_id FROM harvest_reports WHERE id = ?", (report_id,)).fetchone()
        if row is None:
            raise NotFound("Harvest report not found")
        if role != "coordinator" and row["user_id"] != user_id:
            raise Forbidden("Only the reporting farmer or a coordinator can change this report")
        db.execute("UPDATE harvest_reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                   (status, report_id))
    return get_report(report_id)


def register_interest(report_id: int, user_id: str, note: str | None = None) -> dict:
    with connection() as db:
        if db.execute("SELECT 1 FROM harvest_reports WHERE id = ?", (report_id,)).fetchone() is None:
            raise NotFound("Harvest report not found")
        db.execute("INSERT OR IGNORE INTO harvest_interests (report_id, user_id, note) VALUES (?, ?, ?)",
                   (report_id, user_id, note))
        count = db.execute("SELECT COUNT(*) FROM harvest_interests WHERE report_id = ?", (report_id,)).fetchone()[0]
    return {"id": report_id, "interested": True, "interest_count": count}


def get_contact(report_id: int) -> dict:
    with connection() as db:
        row = db.execute("SELECT contact, contact_consent FROM harvest_reports WHERE id = ?", (report_id,)).fetchone()
    if row is None:
        raise NotFound("Harvest report not found")
    if not row["contact_consent"]:
        raise Forbidden("The farmer did not consent to sharing contact details")
    return {"id": report_id, "contact": row["contact"]}


# ---------------------------------------------------------------- drafts

def _draft_row(db, draft_id: str):
    row = db.execute("SELECT payload, report_id, user_id, source FROM harvest_drafts WHERE id = ?", (draft_id,)).fetchone()
    if row is None:
        raise NotFound("Draft not found")
    return row


def _check_owner(row, user_id: str | None) -> None:
    if row["user_id"] is not None and row["user_id"] != user_id:
        raise Forbidden("This draft belongs to another account")


def create_draft(report: HarvestReport, user_id: str | None = None, source: str = "web") -> dict:
    draft_id = str(uuid4())
    with connection() as db:
        db.execute("INSERT INTO harvest_drafts (id, payload, user_id, source) VALUES (?, ?, ?, ?)",
                   (draft_id, report.model_dump_json(), user_id, source))
    return {"id": draft_id, "report": report.model_dump(mode="json"), "confirmed": False}


def update_draft(draft_id: str, report: HarvestReport, user_id: str | None = None) -> dict:
    with connection() as db:
        row = _draft_row(db, draft_id)
        _check_owner(row, user_id)
        if row["report_id"] is not None:
            raise Forbidden("Draft already confirmed")
        db.execute("UPDATE harvest_drafts SET payload = ? WHERE id = ?", (report.model_dump_json(), draft_id))
    return {"id": draft_id, "report": report.model_dump(mode="json"), "confirmed": False}


def get_draft(draft_id: str, user_id: str | None = None) -> dict:
    with connection() as db:
        row = _draft_row(db, draft_id)
    _check_owner(row, user_id)
    return {"id": draft_id, "report": json.loads(row["payload"]), "confirmed": row["report_id"] is not None,
            "report_id": row["report_id"]}


def confirm_draft(draft_id: str, user_id: str | None = None) -> dict:
    with connection() as db:
        db.execute("BEGIN IMMEDIATE")
        row = _draft_row(db, draft_id)
        _check_owner(row, user_id)
        if row["report_id"] is not None:
            return {"id": row["report_id"], "status": "created"}
        report = HarvestReport.model_validate(json.loads(row["payload"]))
        report_id = _insert(db, report, row["user_id"], row["source"])
        db.execute("UPDATE harvest_drafts SET report_id = ? WHERE id = ?", (report_id, draft_id))
        return {"id": report_id, "status": "created"}
