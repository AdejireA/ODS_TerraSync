from fastapi import APIRouter, Depends

from app.core.ratelimit import rate_limit
from app.core.security import User, optional_user
from app.services import harvest
from app.services.harvest import HarvestReport

router = APIRouter(prefix="/harvest-drafts", tags=["harvest drafts"])


def _uid(user: User | None) -> str | None:
    return user.id if user else None


@router.post("", status_code=201, dependencies=[Depends(rate_limit("harvest-draft", 30))])
def create_draft(report: HarvestReport, user: User | None = Depends(optional_user)):
    return harvest.create_draft(report, _uid(user))


@router.get("/{draft_id}")
def get_draft(draft_id: str, user: User | None = Depends(optional_user)):
    return harvest.get_draft(draft_id, _uid(user))


@router.put("/{draft_id}")
def update_draft(draft_id: str, report: HarvestReport, user: User | None = Depends(optional_user)):
    return harvest.update_draft(draft_id, report, _uid(user))


@router.post("/{draft_id}/confirm")
def confirm_draft(draft_id: str, user: User | None = Depends(optional_user)):
    return harvest.confirm_draft(draft_id, _uid(user))
