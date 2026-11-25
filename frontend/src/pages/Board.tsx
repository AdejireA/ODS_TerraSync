import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  getHarvestContact,
  listHarvestReports,
  registerHarvestInterest,
  type HarvestReportSummary,
} from "../lib/api";
import { cropName } from "../data/crops";
import { STATE_PROFILES, getLgasForState, isStateActive } from "../data/locations";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SupplySummary } from "../components/SupplySummary";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StatusStates";

type LoadState = "loading" | "ready" | "error";

function ReportCard({ report }: { report: HarvestReportSummary }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [interested, setInterested] = useState(report.interested);
  const [interestCount, setInterestCount] = useState(report.interest_count);
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState<string | null>(null);
  const [contactError, setContactError] = useState(false);

  const isCoordinator = user?.role === "coordinator";

  async function markInterested() {
    if (busy || interested) return;
    setBusy(true);
    try {
      const result = await registerHarvestInterest(report.id);
      setInterested(result.interested);
      setInterestCount(result.interest_count);
    } finally {
      setBusy(false);
    }
  }

  async function viewContact() {
    if (busy || contact) return;
    setBusy(true);
    setContactError(false);
    try {
      const result = await getHarvestContact(report.id);
      setContact(result.contact);
    } catch {
      setContactError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <span className="font-medium text-primary">{cropName(report.crop, language)}</span>
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

      {isCoordinator && (
        <div className="mt-2 space-y-1 border-t border-border pt-2">
          <Button variant="outline" size="sm" disabled={busy || interested} onClick={markInterested}>
            {interested ? t("boardInterestRecorded") : t("boardInterested")}
          </Button>
          {interestCount > 0 && <p className="text-metadata">{interestCount}</p>}
          {contact ? (
            <p className="text-sm font-medium">{contact}</p>
          ) : (
            <Button variant="outline" size="sm" className="ml-2" disabled={busy} onClick={viewContact}>
              {t("boardViewContact")}
            </Button>
          )}
          {contactError && <p className="text-metadata text-destructive">{t("boardContactHidden")}</p>}
        </div>
      )}
    </Card>
  );
}

export function Board() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
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
    <div className="shell-container space-y-section py-section">
      <PageHeader title={t("boardTitle")} />

      <section className="space-y-row">
        <SectionHeader title={t("supplyTitle")} />
        <SupplySummary crop={cropFilter || undefined} state={stateFilter || undefined} lga={lgaFilter || undefined} />
      </section>

      <section className="space-y-row">
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
              <option key={option.name} value={option.name} disabled={!isStateActive(option.name)}>
                {option.name}{!isStateActive(option.name) ? ` ${t("stateComingSoon")}` : ""}
              </option>
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

        {isAuthenticated && user?.role !== "coordinator" && (
          <p className="text-metadata">{t("boardCoordinatorOnly")}</p>
        )}

        {loadState === "loading" && <LoadingState label={t("boardLoading")} />}
        {loadState === "error" && <ErrorState label={t("boardError")} />}
        {loadState === "ready" && filteredReports.length === 0 && (
          <EmptyState label={t("boardEmpty")} />
        )}

        <ul className="grid gap-row sm:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
