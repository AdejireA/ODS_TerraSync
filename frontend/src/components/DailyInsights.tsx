import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { createTask, getDailyInsights, type DailyInsightsResponse, type InsightItem } from "../lib/api";
import type { FarmCropRecord, FarmProfile } from "../types/farm";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { ErrorState, LoadingState, NotAvailableState } from "./ui/StatusStates";

type LoadState = "loading" | "ready" | "error";

function InsightCard({ item, farmId }: { item: InsightItem; farmId?: string }) {
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  async function addToTasks() {
    if (adding || added) return;
    setAdding(true);
    try {
      await createTask({ action: item.action, farmId, ruleId: item.rule_id });
      setAdded(true);
    } finally {
      setAdding(false);
    }
  }

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{item.title}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            item.urgency === "high"
              ? "bg-destructive-surface text-destructive"
              : item.urgency === "medium"
                ? "bg-warning-surface text-warning"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {item.urgency}
        </span>
      </div>
      <p className="text-sm text-reading">{item.reason}</p>
      <p className="text-sm text-reading font-medium">{item.action}</p>
      <p className="text-metadata">{item.rationale}</p>
      {item.review_status !== "reviewed" && (
        <p className="text-metadata text-warning">{t("insightsUnreviewedNotice")}</p>
      )}
      {item.uncertainty && <p className="text-metadata">{item.uncertainty}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-metadata">
          {t("insightsSource")}:{" "}
          {item.evidence.source_url ? (
            <a href={item.evidence.source_url} target="_blank" rel="noreferrer" className="underline">
              {item.evidence.source_title}
            </a>
          ) : (
            item.evidence.source_title
          )}
        </p>
        <Button variant="outline" size="sm" onClick={addToTasks} disabled={adding || added}>
          {added ? t("tasksMarkDone") : t("tasksAdd")}
        </Button>
      </div>
    </Card>
  );
}

interface DailyInsightsProps {
  profile: FarmProfile;
  crop: FarmCropRecord;
}

export function DailyInsights({ profile, crop }: DailyInsightsProps) {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<DailyInsightsResponse | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  function load() {
    setState("loading");
    const request = isAuthenticated && crop.backendFarmId
      ? getDailyInsights({ farmId: crop.backendFarmId, language })
      : getDailyInsights({
          crop: crop.cropId,
          state: profile.state,
          lga: profile.lga,
          plantingDate: crop.plantingDate,
          language,
        });
    request
      .then((result) => {
        setData(result);
        setState("ready");
      })
      .catch(() => setState("error"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.id, crop.backendFarmId, language, isAuthenticated]);

  if (state === "loading") return <LoadingState label={t("insightsLoading")} />;
  if (state === "error") {
    return (
      <div className="space-y-2">
        <ErrorState label={t("insightsError")} />
        <Button variant="outline" size="sm" onClick={load}>
          {t("voiceRetry")}
        </Button>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-2">
      {data.missing_context.length > 0 && (
        <NotAvailableState label={t("insightsMissingContext")}>
          <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
            {data.missing_context.map((m) => (
              <li key={m.field}>{m.message}</li>
            ))}
          </ul>
        </NotAvailableState>
      )}

      {data.items.length === 0 && (
        <NotAvailableState
          label={data.status === "no_applicable_rules" ? t("insightsNoRules") : t("insightsEmpty")}
        />
      )}

      {data.items.map((item) => (
        <InsightCard key={item.rule_id} item={item} farmId={crop.backendFarmId} />
      ))}

      {data.notes.map((note) => (
        <p key={note} className="text-metadata">{note}</p>
      ))}
    </div>
  );
}
