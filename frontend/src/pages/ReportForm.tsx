import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  createHarvestReport,
  myHarvestReports,
  updateHarvestStatus,
  type HarvestReportSummary,
  type ReportStatus,
} from "../lib/api";
import { CROP_PROFILES, cropName } from "../data/crops";
import { STATE_PROFILES, getLgasForState, isStateActive } from "../data/locations";
import { UNITS } from "../i18n/translations";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ErrorState, LoadingState, EmptyState } from "../components/ui/StatusStates";
import type { TranslationKey } from "../i18n/translations";

type Status = "idle" | "submitting" | "success" | "error";

const REPORT_STATUS_KEY: Record<ReportStatus | "expired", TranslationKey> = {
  expected: "reportStatusExpected",
  available: "reportStatusAvailable",
  sold: "reportStatusSold",
  withdrawn: "reportStatusWithdrawn",
  expired: "reportStatusExpired",
};

interface ReportPrefill {
  crop?: string;
  state?: string;
  lga?: string;
  available_date?: string;
  status?: "expected" | "available";
  farm_id?: string | null;
}

const NEXT_STATUS: Record<ReportStatus, ReportStatus[]> = {
  expected: ["available", "withdrawn"],
  available: ["sold", "withdrawn"],
  sold: [],
  withdrawn: [],
};

function MyReports() {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HarvestReportSummary[] | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState(false);

  function load() {
    setLoadState("loading");
    myHarvestReports()
      .then((items) => {
        setReports(items);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(reportId: number, status: ReportStatus) {
    setUpdatingId(reportId);
    setUpdateError(false);
    try {
      await updateHarvestStatus(reportId, status);
      load();
    } catch {
      setUpdateError(true);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-row">
      <SectionHeader title={t("myReportsTitle")} />
      {loadState === "loading" && <LoadingState label={t("myReportsTitle")} />}
      {loadState === "error" && <ErrorState label={t("insightsError")} />}
      {loadState === "ready" && reports && reports.length === 0 && <EmptyState label={t("myReportsEmpty")} />}
      {updateError && <ErrorState label={t("myReportsUpdateError")} />}
      {reports && reports.length > 0 && (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-primary">{cropName(report.crop, language)}</span>
                <span className="text-sm text-muted-foreground">{report.quantity} {report.unit}</span>
              </div>
              <p className="text-sm text-muted-foreground">{report.lga}, {report.state}</p>
              <p className="text-metadata">
                {t("availableFromLabel")}: {report.available_date} · {t(REPORT_STATUS_KEY[report.effective_status])}
              </p>
              {NEXT_STATUS[report.status].length > 0 && (
                <div className="flex gap-2 pt-1">
                  {NEXT_STATUS[report.status].map((next) => (
                    <Button
                      key={next}
                      variant="outline"
                      size="sm"
                      disabled={updatingId === report.id}
                      onClick={() => setStatus(report.id, next)}
                    >
                      {t(REPORT_STATUS_KEY[next])}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export function ReportForm() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const prefill = (location.state as { prefill?: ReportPrefill } | null)?.prefill;

  const [status, setStatus] = useState<Status>("idle");
  const [crop, setCrop] = useState(prefill?.crop ?? "");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [state, setState] = useState(prefill?.state ?? STATE_PROFILES[0].name);
  const [lga, setLga] = useState(prefill?.lga ?? "");
  const [availableDate, setAvailableDate] = useState(prefill?.available_date ?? "");
  const [reportStatus, setReportStatus] = useState<"expected" | "available">(prefill?.status ?? "expected");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);

  const lgas = useMemo(() => getLgasForState(state), [state]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    try {
      await createHarvestReport({
        crop,
        quantity: Number(quantity),
        unit,
        state,
        lga,
        available_date: availableDate,
        status: reportStatus,
        contact,
        contact_consent: consent,
        farm_id: prefill?.farm_id ?? undefined,
      });
      setStatus("success");
      setCrop("");
      setQuantity("");
      setUnit("");
      setLga("");
      setAvailableDate("");
      setReportStatus("expected");
      setContact("");
      setConsent(false);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="shell-container space-y-section py-section">
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-field">
      <PageHeader title={t("reportFormTitle")} />

      {prefill && (
        <p className="rounded-md bg-primary-light p-3 text-sm text-primary">{t("reportPrefillNotice")}</p>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("crop")}</span>
        <select
          required
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="w-full rounded-md border border-border bg-card p-2"
        >
          <option value="" disabled>{t("selectCrop")}</option>
          {CROP_PROFILES.map((option) => (
            <option key={option.id} value={option.id}>{cropName(option.id, language)}</option>
          ))}
        </select>
      </label>

      <div className="flex gap-3">
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("quantity")}</span>
          <input
            required
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-border bg-card p-2"
          />
        </label>

        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("unit")}</span>
          <select
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full rounded-md border border-border bg-card p-2"
          >
            <option value="" disabled>{t("selectUnit")}</option>
            {UNITS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("state")}</span>
        <select
          required
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setLga("");
          }}
          className="w-full rounded-md border border-border bg-card p-2"
        >
          {STATE_PROFILES.map((option) => (
            <option key={option.name} value={option.name} disabled={!isStateActive(option.name)}>
              {option.name}{!isStateActive(option.name) ? ` ${t("stateComingSoon")}` : ""}
            </option>
          ))}
        </select>
        <p className="mt-1 text-metadata">{t("activeStateNotice")}</p>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("lga")}</span>
        <select
          required
          value={lga}
          onChange={(e) => setLga(e.target.value)}
          className="w-full rounded-md border border-border bg-card p-2"
        >
          <option value="" disabled>{t("selectLga")}</option>
          {lgas.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("availableDate")}</span>
        <input
          required
          type="date"
          value={availableDate}
          onChange={(e) => setAvailableDate(e.target.value)}
          className="w-full rounded-md border border-border bg-card p-2"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("reportStatus")}</span>
        <select
          value={reportStatus}
          onChange={(e) => setReportStatus(e.target.value as "expected" | "available")}
          className="w-full rounded-md border border-border bg-card p-2"
        >
          <option value="expected">{t("reportStatusExpected")}</option>
          <option value="available">{t("reportStatusAvailable")}</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("contact")}</span>
        <input
          required
          type="text"
          placeholder={t("contactPlaceholder")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full rounded-md border border-border bg-card p-2"
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        {t("reportConsent")}
      </label>

      <p className="text-metadata">{t("reportConfirmNotice")}</p>

      <Button type="submit" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? t("submitting") : t("submit")}
      </Button>

      {status === "success" && (
        <p className="rounded-md bg-success-surface p-3 text-sm text-success">{t("submitSuccess")}</p>
      )}
      {status === "error" && (
        <p className="rounded-md bg-destructive-surface p-3 text-sm text-destructive">{t("submitError")}</p>
      )}
    </form>

    {isAuthenticated && <MyReports />}
    </div>
  );
}
