import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { STATE_PROFILES, getLgasForState } from "../data/locations";
import { CROP_PROFILES, cropName } from "../data/crops";
import { Button } from "../components/ui/Button";

type Step = "location" | "crops";

export function Onboarding() {
  const { t, language } = useLanguage();
  const { setProfile } = useFarm();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("location");
  const [farmName, setFarmName] = useState("");
  const [state, setState] = useState(STATE_PROFILES[0].name);
  const [lga, setLga] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [cropError, setCropError] = useState(false);

  const lgas = useMemo(() => getLgasForState(state), [state]);

  function toggleCrop(id: string) {
    setCrops((current) =>
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    );
    setCropError(false);
  }

  function finish() {
    if (crops.length === 0) {
      setCropError(true);
      return;
    }
    setProfile({ farmName: farmName || t("appTitle"), state, lga, crops });
    navigate("/dashboard");
  }

  return (
    <div className="app-container space-y-section py-section">
      <div className="flex gap-2 text-xs font-medium text-muted-foreground">
        <span className={step === "location" ? "text-primary" : ""}>
          1. {t("onboardingStepLocation")}
        </span>
        <span>→</span>
        <span className={step === "crops" ? "text-primary" : ""}>
          2. {t("onboardingStepCrops")}
        </span>
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
                <option key={option.name} value={option.name}>{option.name}</option>
              ))}
            </select>
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

          <Button className="w-full" disabled={!lga} onClick={() => setStep("crops")}>
            {t("onboardingContinue")}
          </Button>
        </div>
      )}

      {step === "crops" && (
        <div className="space-y-field">
          <p className="text-section-heading text-primary">{t("onboardingSelectCrops")}</p>

          <div className="grid grid-cols-2 gap-2">
            {CROP_PROFILES.map((option) => {
              const selected = crops.includes(option.id);
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
                  <span className="mr-2 text-lg">{option.icon}</span>
                  <span className="text-sm font-medium">{cropName(option.id, language)}</span>
                </button>
              );
            })}
          </div>

          {cropError && (
            <p className="text-sm text-destructive">{t("onboardingSelectAtLeastOneCrop")}</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep("location")}>
              {t("onboardingBack")}
            </Button>
            <Button className="flex-1" onClick={finish}>
              {t("onboardingFinish")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
