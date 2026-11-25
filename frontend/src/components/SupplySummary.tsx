import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { cropName } from "../data/crops";
import { getSupplySummary, type SupplySummaryResponse } from "../lib/api";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { ErrorState, LoadingState, EmptyState } from "./ui/StatusStates";

interface SupplySummaryProps {
  crop?: string;
  state?: string;
  lga?: string;
}

export function SupplySummary({ crop, state, lga }: SupplySummaryProps) {
  const { t, language } = useLanguage();
  const [data, setData] = useState<SupplySummaryResponse | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  function load() {
    setLoadState("loading");
    getSupplySummary({ crop, state, lga })
      .then((result) => {
        setData(result);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop, state, lga]);

  if (loadState === "loading") return <LoadingState label={t("supplyTitle")} />;
  if (loadState === "error") {
    return (
      <div className="space-y-2">
        <ErrorState label={t("insightsError")} />
        <Button variant="outline" size="sm" onClick={load}>{t("voiceRetry")}</Button>
      </div>
    );
  }
  if (!data) return null;
  if (data.totals.length === 0) return <EmptyState label={t("supplyEmpty")} />;

  return (
    <div className="space-y-3">
      <section className="space-y-2">
        <p className="text-sm font-semibold text-primary">{t("supplyTotalsTitle")}</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.totals.map((total) => (
            <Card key={`${total.crop}-${total.unit}`} className="space-y-1">
              <p className="font-medium">{cropName(total.crop, language)}</p>
              <p className="text-lg font-bold text-primary">{total.total_quantity} {total.unit}</p>
              <p className="text-metadata">
                {total.reports} · {total.with_interest} {t("supplyInterestLabel")}
              </p>
              <p className="text-metadata">
                {t("supplyLgasLabel")}: {total.lgas.join(", ")}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {data.weekly.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-semibold text-primary">{t("supplyWeeklyTitle")}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.weekly.slice(0, 6).map((week) => (
              <Card key={`${week.crop}-${week.lga}-${week.unit}-${week.week_start}`} className="space-y-1">
                <p className="text-sm font-medium">{cropName(week.crop, language)} · {week.lga}</p>
                <p className="text-metadata">{week.week_start}</p>
                <p className="text-sm">{week.total_quantity} {week.unit}</p>
                {week.available_now > 0 && (
                  <p className="text-metadata text-success">{week.available_now} {t("supplyAvailableNow")}</p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <p className="text-metadata">{data.disclaimer}</p>
    </div>
  );
}
