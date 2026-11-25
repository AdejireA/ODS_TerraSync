import { useEffect, useState, type FormEvent } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { createTask, listTasks, updateTask, type FarmTask } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState, EmptyState, NotAvailableState } from "../components/ui/StatusStates";

type LoadState = "loading" | "ready" | "error";

export function Tasks() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [action, setAction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reload() {
    setLoadState("loading");
    listTasks()
      .then((items) => {
        setTasks(items);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!action.trim()) return;
    setSubmitting(true);
    try {
      await createTask({ action: action.trim(), dueDate: dueDate || undefined });
      setAction("");
      setDueDate("");
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggle(task: FarmTask) {
    await updateTask(task.id, task.status === "done" ? "pending" : "done");
    reload();
  }

  if (!isAuthenticated) {
    return (
      <div className="shell-container space-y-section py-section">
        <PageHeader title={t("tasksTitle")} />
        <NotAvailableState label={t("tasksSignInNotice")} />
      </div>
    );
  }

  return (
    <div className="shell-container space-y-section py-section">
      <PageHeader title={t("tasksTitle")} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder={t("tasksActionPlaceholder")}
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="flex-1 rounded-md border border-border bg-card p-2"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-border bg-card p-2"
        />
        <Button type="submit" disabled={submitting}>
          {t("tasksAdd")}
        </Button>
      </form>

      {loadState === "loading" && <LoadingState label={t("tasksTitle")} />}
      {loadState === "error" && <ErrorState label={t("insightsError")} />}
      {loadState === "ready" && tasks.length === 0 && <EmptyState label={t("tasksEmpty")} />}

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {task.action}
              </p>
              {task.due_date && <p className="text-metadata">{task.due_date}</p>}
            </div>
            <Button variant="outline" size="sm" onClick={() => toggle(task)}>
              {t(task.status === "done" ? "tasksMarkPending" : "tasksMarkDone")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
