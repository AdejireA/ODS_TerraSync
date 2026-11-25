from datetime import date

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field

from app.core.ratelimit import rate_limit
from app.core.security import User, current_user, optional_user, require_role
from app.services import harvest
from app.services.harvest import HarvestReport, ReportStatus

router = APIRouter(prefix="/harvest-reports", tags=["harvest"])

# Re-exported for older imports (`from app.api.harvest import HarvestReport`).
__all__ = ["router", "HarvestReport"]


class StatusUpdate(BaseModel):
    status: ReportStatus


class InterestInput(BaseModel):
    note: str | None = Field(default=None, max_length=300)


@router.post("", status_code=201, dependencies=[Depends(rate_limit("harvest-create", 20))])
def create_report(report: HarvestReport, user: User | None = Depends(optional_user)):
    """Public submission (rate-limited). Linked to the farmer when a token is sent.
    Clients must show the details and get the farmer's confirmation before calling."""
    return harvest.create_report(report, user.id if user else None)


@router.get("")
def list_reports(crop: str | None = None, state: str | None = None, lga: str | None = None,
                 status: ReportStatus | None = None, available_from: date | None = None,
                 available_to: date | None = None, include_expired: bool = False,
                 limit: int = Query(default=100, ge=1, le=500)):
    """Public produce board. Never includes contact details."""
    return harvest.list_reports(crop, state, lga, status, available_from, available_to, include_expired, limit=limit)


@router.get("/mine")
def my_reports(user: User = Depends(current_user)):
    return harvest.list_reports(user_id=user.id, include_expired=True, limit=500)


@router.get("/{report_id}")
def get_report(report_id: int):
    return harvest.get_report(report_id)


@router.patch("/{report_id}/status")
def update_status(report_id: int, body: StatusUpdate, user: User = Depends(current_user)):
    return harvest.update_status(report_id, body.status, user.id, user.role)


@router.post("/{report_id}/interest")
def mark_interest(report_id: int, body: InterestInput | None = None,
                  user: User = Depends(require_role("coordinator"))):
    return harvest.register_interest(report_id, user.id, body.note if body else None)


@router.get("/{report_id}/contact")
def get_contact(report_id: int, user: User = Depends(require_role("coordinator"))):
    """Coordinator-only, and only when the farmer consented to sharing contact details."""
    return harvest.get_contact(report_id)
