import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getHarvestReadiness,
  type HarvestPhase,
  type HarvestReadinessResponse,
  type InsightItem,
} from "../lib/api";
import type { FarmCropRecord, FarmProfile } from "../types/farm";
import type { TranslationKey } from "../i18n/translations";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { ErrorState, LoadingState, NotAvailableState } from "./ui/StatusStates";

const PHASE_KEY: Record<HarvestPhase, TranslationKey> = {
  growing: "harvestPhaseGrowing",
  approaching_harvest: "harvestPhaseApproaching",
  harvest_window: "harvestPhaseHarvestWindow",
  past_typical_window: "harvestPhasePastWindow",
  unknown: "harvestPhaseUnknown",
};

function ItemList({ items }: { items: InsightItem[] }) {
  const { t } = useLanguage();
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card key={item.rule_id} className="space-y-1">
          <p className="font-medium">{item.title}</p>
          <p className="text-sm text-reading">{item.action}</p>
          {item.review_status !== "reviewed" && (
            <p className="text-metadata text-warning">{t("insightsUnreviewedNotice")}</p>
          )}
        </Card>
      ))}
    </div>
  );
}

interface HarvestReadinessProps {
  profile: FarmProfile;
  crop: FarmCropRecord;
}

export function HarvestReadiness({ profile, crop }: HarvestReadinessProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState<HarvestReadinessResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setStatus("loading");
    getHarvestReadiness({
      crop: crop.cropId,
      state: profile.state,
      lga: profile.lga,
      plantingDate: crop.plantingDate,
      includeWeather: true,
    })
      .then((result) => {
        setData(result);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.id, crop.plantingDate, profile.state, profile.lga]);

  function reportHarvest() {
    const prefill = data?.suggested_report
      ? data.suggested_report
      : { crop: crop.cropId, state: profile.state, lga: profile.lga, status: "expected" as const };
    navigate("/harvest/report", { state: { prefill, fromReadiness: true } });
  }

  if (status === "loading") return <LoadingState label={t("insightsLoading")} />;
  if (status === "error") {
    return (
      <div className="space-y-2">
        <ErrorState label={t("insightsError")} />
        <Button variant="outline" size="sm" onClick={load}>{t("voiceRetry")}</Button>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
          {t(PHASE_KEY[data.phase])}
        </span>
        <Button size="sm" onClick={reportHarvest}>{t("harvestReportAction")}</Button>
      </div>

      {data.expected_window ? (
        <Card className="space-y-1">
          <p className="text-metadata font-medium">{t("harvestWindowEstimated")}</p>
          <p className="text-sm">
            {data.expected_window.start_date} – {data.expected_window.end_date}
          </p>
          {data.days_to_window != null && data.days_to_window > 0 && (
            <p className="text-sm text-muted-foreground">
              {data.days_to_window} {t("harvestDaysToWindow")}
            </p>
          )}
          <p className="text-metadata">
            {t("harvestCountedFrom")}: {data.expected_window.counted_from}
          </p>
          <p className="text-metadata">{data.expected_window.uncertainty}</p>
        </Card>
      ) : (
        <NotAvailableState label={t("harvestNoWindowYet")} />
      )}

      {data.missing_context.length > 0 && (
        <NotAvailableState label={t("insightsMissingContext")}>
          <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
            {data.missing_context.map((m) => (
              <li key={m.field}>{m.message}</li>
            ))}
          </ul>
        </NotAvailableState>
      )}

      {data.readiness_checks.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-primary">{t("harvestReadinessChecks")}</p>
          <ItemList items={data.readiness_checks} />
        </section>
      )}

      {data.weather_alerts.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-primary">{t("harvestWeatherAlerts")}</p>
          <ItemList items={data.weather_alerts} />
        </section>
      )}

      {data.post_harvest.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-primary">{t("harvestPostHarvestGuidance")}</p>
          <ItemList items={data.post_harvest} />
        </section>
      )}

      {data.market.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-primary">{t("harvestMarketInfo")}</p>
          <ItemList items={data.market} />
        </section>
      )}

      {data.notes.map((note) => (
        <p key={note} className="text-metadata">{note}</p>
      ))}
    </div>
  );
}
