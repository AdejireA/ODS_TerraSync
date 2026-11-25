import { useNavigate } from "react-router-dom";
import { CloudSun, HeartPulse, ListChecks, Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { PageHeader } from "../components/ui/PageHeader";
import { FeatureCard } from "../components/ui/FeatureCard";

export function More() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="app-container space-y-section py-section">
      <PageHeader title={t("moreTitle")} />

      <div className="grid grid-cols-2 gap-3">
        <FeatureCard
          icon={ListChecks}
          title={t("navProduceBoard")}
          description={t("dashboardProduceAvailability")}
          onClick={() => navigate("/harvest/board")}
        />
        <FeatureCard
          icon={SettingsIcon}
          title={t("navSettings")}
          description={t("settingsTitle")}
          onClick={() => navigate("/settings")}
        />
      </div>

      <section className="space-y-row">
        <p className="text-metadata">{t("moreUnavailableSection")}</p>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={CloudSun}
            title={t("navWeather")}
            description={t("notAvailableWeather")}
            disabled
            badge={t("comingSoon")}
          />
          <FeatureCard
            icon={ListChecks}
            title={t("navFarmTasks")}
            description={t("notAvailableTasks")}
            disabled
            badge={t("comingSoon")}
          />
          <FeatureCard
            icon={HeartPulse}
            title={t("navCropHealth")}
            description={t("notAvailableCropAdvisory")}
            disabled
            badge={t("comingSoon")}
          />
        </div>
      </section>
    </div>
  );
}
