import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { STATE_PROFILES, getLgasForState, isStateActive } from "../data/locations";
import { CROP_PROFILES, cropName } from "../data/crops";
import {
  AREA_UNITS,
  SOIL_TYPES,
  WATER_SOURCES,
  areaUnitKey,
  plantingStatusKey,
  soilTypeKey,
  waterSourceKey,
} from "../data/farmOptions";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { CropContextForm, emptyCropDraft, type CropDraft } from "../components/CropContextForm";
import { FARM_PROFILE_VERSION } from "../types/farm";
import type { AreaUnit, FarmCropRecord, SoilType, WaterSource } from "../types/farm";
import type { TranslationKey } from "../i18n/translations";

type Step = "location" | "characteristics" | "crops" | "cropContext" | "summary";
type GeoStatus = "idle" | "detecting" | "granted" | "denied" | "unsupported";

export function Onboarding() {
  const { t, language } = useLanguage();
  const { profile, setProfile } = useFarm();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(profile ? "summary" : "location");

  const [farmName, setFarmName] = useState(profile?.farmName ?? "");
  const [state, setState] = useState(profile?.state ?? STATE_PROFILES[0].name);
  const [lga, setLga] = useState(profile?.lga ?? "");
  const [community, setCommunity] = useState(profile?.community ?? "");
  const [latitude, setLatitude] = useState<number | undefined>(profile?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(profile?.longitude);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const [farmSize, setFarmSize] = useState<number | undefined>(profile?.farmSize);
  const [farmSizeUnit, setFarmSizeUnit] = useState<AreaUnit | undefined>(profile?.farmSizeUnit);
  const [soilType, setSoilType] = useState<SoilType | undefined>(profile?.soilType);
  const [waterSource, setWaterSource] = useState<WaterSource | undefined>(profile?.waterSource);

  const [selectedCropIds, setSelectedCropIds] = useState<string[]>(
    profile?.crops.map((c) => c.cropId) ?? [],
  );
  const [cropError, setCropError] = useState(false);
  const [cropDrafts, setCropDrafts] = useState<Record<string, CropDraft>>(() => {
    const initial: Record<string, CropDraft> = {};
    for (const crop of profile?.crops ?? []) {
      const { cropId, id, ...draft } = crop;
      void id;
      initial[cropId] = draft;
    }
    return initial;
  });
  const [cropContextIndex, setCropContextIndex] = useState(0);

  const lgas = useMemo(() => getLgasForState(state), [state]);

  function toggleCrop(id: string) {
    setSelectedCropIds((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
    setCropError(false);
  }

  function detectLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  function goToCropContext() {
    if (selectedCropIds.length === 0) {
      setCropError(true);
      return;
    }
    setCropDrafts((current) => {
      const next = { ...current };
      for (const id of selectedCropIds) {
        if (!next[id]) next[id] = emptyCropDraft();
      }
      return next;
    });
    setCropContextIndex(0);
    setStep("cropContext");
  }

  function updateCropDraft(cropId: string, patch: Partial<CropDraft>) {
    setCropDrafts((current) => ({ ...current, [cropId]: { ...current[cropId], ...patch } }));
  }

  function finish() {
    const crops: FarmCropRecord[] = selectedCropIds.map((cropId) => ({
      id: `${cropId}-${Math.random().toString(36).slice(2, 10)}`,
      cropId,
      ...(cropDrafts[cropId] ?? emptyCropDraft()),
    }));

    setProfile({
      version: FARM_PROFILE_VERSION,
      farmName: farmName || t("appTitle"),
      state,
      lga,
      community: community || undefined,
      latitude,
      longitude,
      farmSize,
      farmSizeUnit,
      soilType,
      waterSource,
      crops,
    });
    navigate("/dashboard");
  }

  const stepOrder: Step[] = ["location", "characteristics", "crops", "cropContext", "summary"];
  const stepLabelKey: Record<Step, TranslationKey> = {
    location: "onboardingStepLocation",
    characteristics: "onboardingStepCharacteristics",
    crops: "onboardingStepCrops",
    cropContext: "onboardingStepCropContext",
    summary: "onboardingStepSummary",
  };

  return (
    <div className="app-container space-y-section py-section">
      <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
        {stepOrder.map((s, i) => (
          <span key={s} className={step === s ? "text-primary" : ""}>
            {i + 1}. {t(stepLabelKey[s])}
            {i < stepOrder.length - 1 ? " →" : ""}
          </span>
        ))}
      </div>

      {step === "location" && (
        <div className="space-y-field">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted-foreground">
              {t("onboardingFarmName")}
            </span>
            <input
              type="text"
              placeholder={t("onboardingFarmNamePlaceholder")}
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full rounded-md border border-border bg-card p-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("state")}</span>
            <select
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
            <span className="mb-1 block text-sm font-medium text-muted-foreground">
              {t("onboardingCommunity")}
            </span>
            <input
              type="text"
              placeholder={t("onboardingCommunityPlaceholder")}
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full rounded-md border border-border bg-card p-2"
            />
          </label>

          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={geoStatus === "detecting"}
              onClick={detectLocation}
            >
              {geoStatus === "detecting" ? t("onboardingLocationDetecting") : t("onboardingUseMyLocation")}
            </Button>
            {geoStatus === "granted" && latitude != null && longitude != null && (
              <p className="text-metadata">
                {t("onboardingLocationDetected")}: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
            {geoStatus === "denied" && (
              <p className="text-metadata text-destructive">{t("onboardingLocationDenied")}</p>
            )}
            {geoStatus === "unsupported" && (
              <p className="text-metadata text-destructive">{t("onboardingLocationUnsupported")}</p>
            )}
          </div>

          <Button className="w-full" disabled={!lga} onClick={() => setStep("characteristics")}>
            {t("onboardingContinue")}
          </Button>
        </div>
      )}

      {step === "characteristics" && (
        <div className="space-y-field">
          <div>
            <span className="mb-1 block text-sm font-medium text-muted-foreground">
              {t("onboardingFarmSize")}
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                placeholder={t("onboardingFarmSizePlaceholder")}
                value={farmSize ?? ""}
                onChange={(e) => setFarmSize(e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 rounded-md border border-border bg-card p-2"
              />
              <select
                value={farmSizeUnit ?? ""}
                onChange={(e) => setFarmSizeUnit((e.target.value || undefined) as AreaUnit | undefined)}
                className="w-1/2 rounded-md border border-border bg-card p-2"
              >
                <option value="">{t("onboardingDontKnow")}</option>
                {AREA_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{t(areaUnitKey(unit))}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-muted-foreground">
              {t("onboardingSoilType")}
            </span>
            <select
              value={soilType ?? ""}
              onChange={(e) => setSoilType((e.target.value || undefined) as SoilType | undefined)}
              className="w-full rounded-md border border-border bg-card p-2"
            >
              <option value="">{t("onboardingSkipField")}</option>
              {SOIL_TYPES.map((soil) => (
                <option key={soil} value={soil}>{t(soilTypeKey(soil))}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-muted-foreground">
              {t("onboardingWaterSource")}
            </span>
            <select
              value={waterSource ?? ""}
              onChange={(e) => setWaterSource((e.target.value || undefined) as WaterSource | undefined)}
              className="w-full rounded-md border border-border bg-card p-2"
            >
              <option value="">{t("onboardingSkipField")}</option>
              {WATER_SOURCES.map((source) => (
                <option key={source} value={source}>{t(waterSourceKey(source))}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("location")}>
              {t("onboardingBack")}
            </Button>
            <Button className="flex-1" onClick={() => setStep("crops")}>
              {t("onboardingContinue")}
            </Button>
          </div>
        </div>
      )}

      {step === "crops" && (
        <div className="space-y-field">
          <p className="text-section-heading text-primary">{t("onboardingSelectCrops")}</p>

          <div className="grid grid-cols-2 gap-2">
            {CROP_PROFILES.map((option) => {
              const selected = selectedCropIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleCrop(option.id)}
                  className={`rounded-md border p-3 text-left ${
                    selected
                      ? "border-primary bg-primary-light"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-sm font-medium">{cropName(option.id, language)}</span>
                </button>
              );
            })}
          </div>

          {cropError && (
            <p className="text-sm text-destructive">{t("onboardingSelectAtLeastOneCrop")}</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(profile ? "summary" : "characteristics")}>
              {t("onboardingBack")}
            </Button>
            <Button className="flex-1" onClick={goToCropContext}>
              {t("onboardingContinue")}
            </Button>
          </div>
        </div>
      )}

      {step === "cropContext" && selectedCropIds[cropContextIndex] && (
        <div className="space-y-field">
          <p className="text-section-heading text-primary">
            {t("onboardingCropContextIntro")} {cropName(selectedCropIds[cropContextIndex], language)}
          </p>

          <CropContextForm
            draft={cropDrafts[selectedCropIds[cropContextIndex]] ?? emptyCropDraft()}
            onChange={(patch) => updateCropDraft(selectedCropIds[cropContextIndex], patch)}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                cropContextIndex === 0
                  ? setStep("crops")
                  : setCropContextIndex((i) => i - 1)
              }
            >
              {t("onboardingBack")}
            </Button>
            <Button
              className="flex-1"
              onClick={() =>
                cropContextIndex < selectedCropIds.length - 1
                  ? setCropContextIndex((i) => i + 1)
                  : setStep("summary")
              }
            >
              {cropContextIndex < selectedCropIds.length - 1
                ? t("onboardingNextCrop")
                : t("onboardingReviewFarm")}
            </Button>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div className="space-y-field">
          <p className="text-section-heading text-primary">{t("onboardingReviewFarm")}</p>

          <Card className="space-y-2">
            <p className="font-semibold">{farmName || t("appTitle")}</p>
            <p className="text-sm text-muted-foreground">
              {community ? `${community}, ` : ""}{lga}, {state}
            </p>
            <button
              type="button"
              className="text-sm font-medium text-primary underline"
              onClick={() => setStep("location")}
            >
              {t("onboardingEditFarm")}
            </button>
          </Card>

          <div className="space-y-2">
            {selectedCropIds.map((cropId, index) => {
              const draft = cropDrafts[cropId] ?? emptyCropDraft();
              return (
                <Card key={cropId} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{cropName(cropId, language)}</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-sm text-primary underline"
                        onClick={() => {
                          setCropContextIndex(index);
                          setStep("cropContext");
                        }}
                      >
                        {t("onboardingEditFarm")}
                      </button>
                      <button
                        type="button"
                        className="text-sm text-destructive underline"
                        onClick={() =>
                          setSelectedCropIds((current) => current.filter((id) => id !== cropId))
                        }
                      >
                        {t("onboardingRemoveCrop")}
                      </button>
                    </div>
                  </div>
                  <p className="text-metadata">{t(plantingStatusKey(draft.status))}</p>
                </Card>
              );
            })}
          </div>

          <Button variant="outline" className="w-full" onClick={() => setStep("crops")}>
            {t("onboardingAddCrop")}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("location")}>
              {t("onboardingEditFarm")}
            </Button>
            <Button className="flex-1" onClick={finish} disabled={selectedCropIds.length === 0}>
              {profile ? t("onboardingSaveChanges") : t("onboardingFinish")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
