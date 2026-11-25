import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ExternalLink, Lightbulb } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { cropName } from "../../data/crops";
import { getDailyInsights, type InsightItem } from "../../lib/api";
import type { FarmProfile } from "../../types/farm";
import { Card } from "../ui/Card";
import { EmptyState, ErrorState, LoadingState } from "../ui/StatusStates";
import type { TranslationKey } from "../../i18n/translations";

const URGENCY: Record<InsightItem["urgency"], { key: TranslationKey; className: string }> = {
  high: { key: "urgencyHigh", className: "bg-destructive-surface text-destructive" },
  medium: { key: "urgencyMedium", className: "bg-warning-surface text-warning-foreground" },
  low: { key: "urgencyLow", className: "bg-muted text-muted-foreground" },
};
const VISIBLE = 4;

// Today's insights for every crop on the (device-local) farm profile. Each crop is
// sent to GET /insights/today as guest context; results are merged, de-duplicated
// (farm-wide rules appear once) and ranked by priority.
export function InsightsPanel({ profile }: { profile: FarmProfile }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState<InsightItem[]>([]);
  const [missingPlantingDate, setMissingPlantingDate] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [expanded, setExpanded] = useState(false);

  const crops = profile.crops.filter((c) => c.status !== "harvested");
  const cropKey = crops.map((c) => `${c.cropId}:${c.plantingDate ?? ""}`).join(",");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    Promise.all(
      crops.map((crop) =>
        getDailyInsights({
          crop: crop.cropId,
          state: profile.state,
          lga: profile.lga,
          plantingDate: crop.status === "planted" ? crop.plantingDate : undefined,
          language,
        }),
      ),
    )
      .then((responses) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const merged: InsightItem[] = [];
        for (const response of responses) {
          for (const item of response.items) {
            if (seen.has(item.rule_id)) continue;
            seen.add(item.rule_id);
            merged.push(item);
          }
        }
        merged.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));
        setItems(merged);
        setMissingPlantingDate(
          responses.some((r) => r.missing_context.some((m) => m.field === "planting_date")),
        );
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
    // cropKey captures the crop list; profile location and language trigger refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropKey, profile.state, profile.lga, language]);

  if (crops.length === 0) return <EmptyState label={t("insightsEmpty")} />;
  if (status === "loading") return <LoadingState label={t("insightsLoading")} />;
  if (status === "error") return <ErrorState label={t("insightsError")} />;

  const visible = expanded ? items : items.slice(0, VISIBLE);

  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyState label={t("insightsEmpty")} />}

      {visible.map((item) => {
        const urgency = URGENCY[item.urgency];
        return (
          <Card key={item.rule_id} className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgency.className}`}>
                {t(urgency.key)}
              </span>
              {item.crop !== "all" && (
                <span className="text-xs font-medium text-muted-foreground">{cropName(item.crop, language)}</span>
              )}
              {item.review_status !== "reviewed" && (
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {t("insightsPendingReview")}
                </span>
              )}
            </div>
            <p className="flex items-start gap-2 font-semibold">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {item.title}
            </p>
            <p className="text-sm">{item.action}</p>
            <p className="text-xs text-muted-foreground">{item.reason}</p>
            {item.escalation && (
              <p className="flex items-start gap-1.5 text-xs text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {item.escalation}
              </p>
            )}
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none">{t("insightsWhy")}</summary>
              <div className="mt-1 space-y-1">
                <p>{item.rationale}</p>
                <p className="italic">{item.uncertainty}</p>
                {item.contraindications && <p>{item.contraindications}</p>}
                <a
                  href={item.evidence.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  {t("insightsSource")}: {item.evidence.source_title}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            </details>
          </Card>
        );
      })}

      {items.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-medium text-primary underline"
        >
          {expanded ? t("insightsShowLess") : `${t("insightsShowAll")} (${items.length})`}
        </button>
      )}

      {missingPlantingDate && (
        <button
          type="button"
          onClick={() => navigate("/onboarding")}
          className="block text-sm text-primary underline"
        >
          {t("insightsAddPlantingDate")}
        </button>
      )}
      <p className="text-xs text-muted-foreground">{t("insightsGeneralNote")}</p>
    </div>
  );
}
