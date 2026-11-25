import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useFarm } from "../contexts/FarmContext";
import { cropName } from "../data/crops";
import { createTask, listTasks, updateTask, type FarmTask } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ErrorState, LoadingState, EmptyState, NotAvailableState } from "../components/ui/StatusStates";

type LoadState = "loading" | "ready" | "error";
type StatusFilter = "all" | FarmTask["status"];

function isOverdue(task: FarmTask): boolean {
  return task.status === "pending" && !!task.due_date && task.due_date < new Date().toISOString().slice(0, 10);
}

export function Tasks() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { profile } = useFarm();
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [action, setAction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [farmFilter, setFarmFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [submitting, setSubmitting] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const cropsWithFarm = useMemo(
    () => (profile?.crops ?? []).filter((crop) => crop.backendFarmId),
    [profile],
  );

  function reload() {
    setLoadState("loading");
    listTasks({
      farmId: farmFilter || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    })
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
  }, [isAuthenticated, farmFilter, statusFilter]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!action.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createTask({ action: action.trim(), farmId: farmFilter || undefined, dueDate: dueDate || undefined });
      setAction("");
      setDueDate("");
      reload();
    } finally {
      setSubmitting(false);
    }
  }

  async function setStatus(task: FarmTask, status: FarmTask["status"]) {
    if (mutatingId) return;
    setMutatingId(task.id);
    try {
      await updateTask(task.id, status);
      reload();
    } finally {
      setMutatingId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="shell-container space-y-section py-section">
        <PageHeader title={t("tasksTitle")} />
        <NotAvailableState label={t("tasksSignInNotice")} />
      </div>
    );
  }

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const overdueCount = tasks.filter(isOverdue).length;

  return (
    <div className="shell-container space-y-section py-section">
      <PageHeader
        title={t("tasksTitle")}
        subtitle={`${pendingCount} pending · ${doneCount} done${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`}
      />

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

      <div className="flex flex-wrap gap-2">
        {cropsWithFarm.length > 0 && (
          <select
            value={farmFilter}
            onChange={(e) => setFarmFilter(e.target.value)}
            className="rounded-md border border-border bg-card p-2 text-sm"
          >
            <option value="">{t("tasksAllFarms")}</option>
            {cropsWithFarm.map((crop) => (
              <option key={crop.backendFarmId} value={crop.backendFarmId}>
                {cropName(crop.cropId, language)}
              </option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-border bg-card p-2 text-sm"
        >
          <option value="all">{t("boardStatusAll")}</option>
          <option value="pending">{t("tasksStatusPending")}</option>
          <option value="done">{t("tasksStatusDone")}</option>
          <option value="skipped">{t("tasksStatusSkipped")}</option>
        </select>
      </div>

      {loadState === "loading" && <LoadingState label={t("tasksTitle")} />}
      {loadState === "error" && <ErrorState label={t("insightsError")} />}
      {loadState === "ready" && tasks.length === 0 && <EmptyState label={t("tasksEmpty")} />}

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-medium ${task.status !== "pending" ? "text-muted-foreground line-through" : ""}`}>
                {task.action}
              </p>
              {task.due_date && (
                <p className={`text-metadata ${isOverdue(task) ? "text-destructive" : ""}`}>{task.due_date}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              {task.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={mutatingId === task.id}
                    onClick={() => setStatus(task, "skipped")}
                  >
                    {t("tasksMarkSkipped")}
                  </Button>
                  <Button
                    size="sm"
                    disabled={mutatingId === task.id}
                    onClick={() => setStatus(task, "done")}
                  >
                    {t("tasksMarkDone")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={mutatingId === task.id}
                  onClick={() => setStatus(task, "pending")}
                >
                  {t("tasksMarkPending")}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
