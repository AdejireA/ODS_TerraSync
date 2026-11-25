import json
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from app.api.harvest import HarvestReport
from app.core.database import connection

router = APIRouter(prefix="/harvest-drafts", tags=["harvest drafts"])

@router.post("", status_code=201)
def create_draft(report: HarvestReport):
    draft_id = str(uuid4())
    with connection() as db:
        db.execute("INSERT INTO harvest_drafts (id, payload) VALUES (?, ?)", (draft_id, report.model_dump_json()))
    return {"id": draft_id, "report": report}

@router.put("/{draft_id}")
def update_draft(draft_id: str, report: HarvestReport):
    with connection() as db:
        result = db.execute("UPDATE harvest_drafts SET payload = ? WHERE id = ? AND report_id IS NULL", (report.model_dump_json(), draft_id))
        if not result.rowcount:
            raise HTTPException(status_code=404, detail="Draft not found or already confirmed")
    return {"id": draft_id, "report": report}

@router.post("/{draft_id}/confirm")
def confirm_draft(draft_id: str):
    with connection() as db:
        db.execute("BEGIN IMMEDIATE")
        draft = db.execute("SELECT payload, report_id FROM harvest_drafts WHERE id = ?", (draft_id,)).fetchone()
        if draft is None:
            raise HTTPException(status_code=404, detail="Draft not found")
        if draft["report_id"] is not None:
            return {"id": draft["report_id"], "status": "created"}
        report = HarvestReport.model_validate(json.loads(draft["payload"]))
        result = db.execute(
            "INSERT INTO harvest_reports (crop, quantity, unit, state, lga, available_date, contact) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (report.crop, report.quantity, report.unit, report.state, report.lga, report.available_date.isoformat(), report.contact),
        )
        db.execute("UPDATE harvest_drafts SET report_id = ? WHERE id = ?", (result.lastrowid, draft_id))
        return {"id": result.lastrowid, "status": "created"}
