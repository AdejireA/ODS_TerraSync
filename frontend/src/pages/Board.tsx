import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { listHarvestReports, type HarvestReportSummary } from "../lib/api";
import { STATE_PROFILES, getLgasForState } from "../data/locations";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StatusStates";

type LoadState = "loading" | "ready" | "error";

export function Board() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<HarvestReportSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [stateFilter, setStateFilter] = useState("");
  const [lgaFilter, setLgaFilter] = useState("");
  const [cropFilter, setCropFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    listHarvestReports()
      .then((data) => {
        if (!cancelled) {
          setReports(data);
          setLoadState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const crops = useMemo(() => Array.from(new Set(reports.map((r) => r.crop))).sort(), [reports]);
  const lgaOptions = stateFilter ? getLgasForState(stateFilter) : [];

  const filteredReports = reports.filter(
    (report) =>
      (!stateFilter || report.state === stateFilter) &&
      (!lgaFilter || report.lga === lgaFilter) &&
      (!cropFilter || report.crop === cropFilter),
  );

  return (
    <div className="shell-container space-y-field py-section">
      <PageHeader title={t("boardTitle")} />

      <div className="flex gap-2 overflow-x-auto">
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setLgaFilter("");
          }}
          className="rounded-md border border-border bg-card p-2 text-sm"
        >
          <option value="">{t("state")}</option>
          {STATE_PROFILES.map((option) => (
            <option key={option.name} value={option.name}>{option.name}</option>
          ))}
        </select>

        <select
          value={lgaFilter}
          onChange={(e) => setLgaFilter(e.target.value)}
          disabled={!stateFilter}
          className="rounded-md border border-border bg-card p-2 text-sm disabled:opacity-50"
        >
          <option value="">{t("lga")}</option>
          {lgaOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="rounded-md border border-border bg-card p-2 text-sm"
        >
          <option value="">{t("crop")}</option>
          {crops.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {loadState === "loading" && <LoadingState label={t("boardLoading")} />}
      {loadState === "error" && <ErrorState label={t("boardError")} />}
      {loadState === "ready" && filteredReports.length === 0 && (
        <EmptyState label={t("boardEmpty")} />
      )}

      <ul className="grid gap-row sm:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <li key={report.id}>
            <Card>
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-primary">{report.crop}</span>
                <span className="text-sm text-muted-foreground">
                  {report.quantity} {report.unit}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("locationLabel")}: {report.lga}, {report.state}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("availableFromLabel")}: {report.available_date}
              </p>
              <p className="text-metadata text-muted-foreground">
                {t("reportedOn")} {new Date(report.created_at).toLocaleString()}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
