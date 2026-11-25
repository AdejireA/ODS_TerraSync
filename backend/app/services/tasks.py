"""Farm tasks for signed-in farmers."""
from datetime import date
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field

from app.core.database import connection
from app.data.rules import RULES_BY_ID
from app.services.harvest import Forbidden, NotFound

TASK_COLUMNS = "id, farm_id, action, due_date, status, rule_id, source, created_at, completed_at"


class TaskInput(BaseModel):
    action: str = Field(min_length=1, max_length=300)
    farm_id: str | None = None
    due_date: date | None = None
    rule_id: str | None = None


class TaskUpdate(BaseModel):
    status: Literal["pending", "done", "skipped"]


def create_task(user_id: str, task: TaskInput, source: str = "web") -> dict:
    if task.rule_id and task.rule_id not in RULES_BY_ID:
        raise NotFound("Unknown rule")
    task_id = str(uuid4())
    with connection() as db:
        if task.farm_id:
            farm = db.execute("SELECT user_id FROM farms WHERE id = ?", (task.farm_id,)).fetchone()
            if farm is None or farm["user_id"] != user_id:
                raise Forbidden("Farm not found for this account")
        db.execute("INSERT INTO tasks (id, user_id, farm_id, action, due_date, rule_id, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
                   (task_id, user_id, task.farm_id, task.action,
                    task.due_date.isoformat() if task.due_date else None, task.rule_id, source))
        row = db.execute(f"SELECT {TASK_COLUMNS} FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return dict(row)


def list_tasks(user_id: str, farm_id: str | None = None, status: str | None = None) -> list[dict]:
    sql, params = f"SELECT {TASK_COLUMNS} FROM tasks WHERE user_id = ?", [user_id]
    if farm_id:
        sql += " AND farm_id = ?"; params.append(farm_id)
    if status:
        sql += " AND status = ?"; params.append(status)
    sql += " ORDER BY status = 'done', due_date IS NULL, due_date, created_at"
    with connection() as db:
        return [dict(row) for row in db.execute(sql, params).fetchall()]


def update_task(user_id: str, task_id: str, update: TaskUpdate) -> dict:
    with connection() as db:
        result = db.execute(
            "UPDATE tasks SET status = ?, completed_at = CASE WHEN ? = 'done' THEN CURRENT_TIMESTAMP END "
            "WHERE id = ? AND user_id = ?", (update.status, update.status, task_id, user_id))
        if not result.rowcount:
            raise NotFound("Task not found")
        return dict(db.execute(f"SELECT {TASK_COLUMNS} FROM tasks WHERE id = ?", (task_id,)).fetchone())
