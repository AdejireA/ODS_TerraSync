import { useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { createHarvestReport } from "../lib/api";
import { CROP_PROFILES, cropName } from "../data/crops";
import { STATE_PROFILES, getLgasForState, isStateActive } from "../data/locations";
import { UNITS } from "../i18n/translations";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";

type Status = "idle" | "submitting" | "success" | "error";

export function ReportForm() {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [state, setState] = useState(STATE_PROFILES[0].name);
  const [lga, setLga] = useState("");
  const [availableDate, setAvailableDate] = useState("");
  const [contact, setContact] = useState("");

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
        contact,
      });
      setStatus("success");
      setCrop("");
      setQuantity("");
      setUnit("");
      setLga("");
      setAvailableDate("");
      setContact("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="shell-container py-section">
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-field">
      <PageHeader title={t("reportFormTitle")} />

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
            <option key={option.id} value={option.nameEn}>{cropName(option.id, language)}</option>
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
    </div>
  );
}
