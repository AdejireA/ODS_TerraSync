import { useLanguage } from "../contexts/LanguageContext";
import { AREA_UNITS, PLANTING_STATUSES, areaUnitKey, plantingStatusKey } from "../data/farmOptions";
import type { AreaUnit, DatePrecision, FarmCropRecord, PlantingStatus } from "../types/farm";

export type CropDraft = Omit<FarmCropRecord, "id" | "cropId">;

interface CropContextFormProps {
  draft: CropDraft;
  onChange: (patch: Partial<CropDraft>) => void;
}

export function CropContextForm({ draft, onChange }: CropContextFormProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-field">
      <div>
        <span className="mb-1 block text-sm font-medium text-muted-foreground">
          {t("onboardingPlantingStatus")}
        </span>
        <div className="flex gap-2">
          {PLANTING_STATUSES.map((status: PlantingStatus) => (
            <button
              key={status}
              type="button"
              onClick={() => onChange({ status })}
              className={`flex-1 rounded-md border px-2 py-2 text-sm font-medium ${
                draft.status === status ? "border-primary bg-primary-light" : "border-border bg-card"
              }`}
            >
              {t(plantingStatusKey(status))}
            </button>
          ))}
        </div>
      </div>

      {draft.status !== "planned" && (
        <div>
          <span className="mb-1 block text-sm font-medium text-muted-foreground">
            {t("onboardingPlantingDate")}
          </span>
          <div className="space-y-2">
            {draft.plantingDatePrecision !== "unknown" && (
              <input
                type="date"
                value={draft.plantingDate ?? ""}
                onChange={(e) => onChange({ plantingDate: e.target.value })}
                className="w-full rounded-md border border-border bg-card p-2"
              />
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.plantingDatePrecision === "approximate"}
                onChange={(e) =>
                  onChange({
                    plantingDatePrecision: e.target.checked
                      ? "approximate"
                      : ("exact" as DatePrecision),
                  })
                }
              />
              {t("onboardingPlantingDateApprox")}
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={draft.plantingDatePrecision === "unknown"}
                onChange={(e) =>
                  onChange({
                    plantingDatePrecision: e.target.checked ? "unknown" : ("exact" as DatePrecision),
                    plantingDate: e.target.checked ? undefined : draft.plantingDate,
                  })
                }
              />
              {t("onboardingPlantingDateUnknown")}
            </label>
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">
          {t("onboardingVariety")}
        </span>
        <input
          type="text"
          placeholder={t("onboardingVarietyPlaceholder")}
          value={draft.variety ?? ""}
          onChange={(e) => onChange({ variety: e.target.value || undefined })}
          className="w-full rounded-md border border-border bg-card p-2"
        />
      </label>

      <div>
        <span className="mb-1 block text-sm font-medium text-muted-foreground">
          {t("onboardingPlantedArea")}
        </span>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={draft.plantedArea ?? ""}
            onChange={(e) =>
              onChange({ plantedArea: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-1/2 rounded-md border border-border bg-card p-2"
          />
          <select
            value={draft.plantedAreaUnit ?? ""}
            onChange={(e) => onChange({ plantedAreaUnit: (e.target.value || undefined) as AreaUnit | undefined })}
            className="w-1/2 rounded-md border border-border bg-card p-2"
          >
            <option value="">{t("onboardingDontKnow")}</option>
            {AREA_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {t(areaUnitKey(unit))}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function emptyCropDraft(): CropDraft {
  return { status: "planted", plantingDatePrecision: "unknown" };
}
