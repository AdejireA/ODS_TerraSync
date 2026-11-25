import { useNavigate } from "react-router-dom";
import { BookOpen, CloudSun, ListChecks, Settings as SettingsIcon } from "lucide-react";
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
          icon={CloudSun}
          title={t("navWeather")}
          description={t("dashboardWeather")}
          onClick={() => navigate("/weather")}
        />
        <FeatureCard
          icon={ListChecks}
          title={t("navFarmTasks")}
          description={t("tasksTitle")}
          onClick={() => navigate("/tasks")}
        />
        <FeatureCard
          icon={BookOpen}
          title={t("navKnowledge")}
          description={t("knowledgeTitle")}
          onClick={() => navigate("/knowledge")}
        />
        <FeatureCard
          icon={SettingsIcon}
          title={t("navSettings")}
          description={t("settingsTitle")}
          onClick={() => navigate("/settings")}
        />
      </div>
    </div>
  );
}
