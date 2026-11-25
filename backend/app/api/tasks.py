from typing import Literal

from fastapi import APIRouter, Depends

from app.core.security import User, require_role
from app.services import tasks
from app.services.tasks import TaskInput, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])
farmer = require_role("farmer")


@router.get("")
def list_tasks(farm_id: str | None = None, status: Literal["pending", "done", "skipped"] | None = None,
               user: User = Depends(farmer)):
    return tasks.list_tasks(user.id, farm_id, status)


@router.post("", status_code=201)
def create_task(body: TaskInput, user: User = Depends(farmer)):
    return tasks.create_task(user.id, body)


@router.patch("/{task_id}")
def update_task(task_id: str, body: TaskUpdate, user: User = Depends(farmer)):
    return tasks.update_task(user.id, task_id, body)
