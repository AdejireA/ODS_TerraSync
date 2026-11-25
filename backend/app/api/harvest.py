from datetime import date
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.core.database import connection

router = APIRouter(prefix="/harvest-reports", tags=["harvest"])

class HarvestReport(BaseModel):
    crop: str = Field(min_length=1, max_length=100)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1, max_length=50)
    state: str = Field(min_length=1, max_length=100)
    lga: str = Field(min_length=1, max_length=100)
    available_date: date
    contact: str = Field(min_length=1, max_length=100)

@router.post("", status_code=201)
def create_report(report: HarvestReport):
    with connection() as db:
        result = db.execute(
            "INSERT INTO harvest_reports (crop, quantity, unit, state, lga, available_date, contact) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (report.crop, report.quantity, report.unit, report.state, report.lga, report.available_date.isoformat(), report.contact),
        )
        return {"id": result.lastrowid, "status": "created"}

@router.get("")
def list_reports():
    with connection() as db:
        rows = db.execute("SELECT h.id, h.crop, h.quantity, h.unit, h.state, h.lga, h.available_date, h.created_at, EXISTS(SELECT 1 FROM harvest_interest i WHERE i.report_id = h.id) AS interested FROM harvest_reports h ORDER BY h.id DESC").fetchall()
        return [dict(row) for row in rows]


@router.post("/{report_id}/interest")
def mark_interest(report_id: int):
    with connection() as db:
        if db.execute("SELECT 1 FROM harvest_reports WHERE id = ?", (report_id,)).fetchone() is None:
            raise HTTPException(status_code=404, detail="Harvest report not found")
        db.execute("INSERT OR IGNORE INTO harvest_interest (report_id) VALUES (?)", (report_id,))
    return {"id": report_id, "interested": True}
