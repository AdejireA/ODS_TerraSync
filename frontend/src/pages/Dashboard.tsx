import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { cropName } from "../data/crops";
import { plantingStatusKey } from "../data/farmOptions";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { NotAvailableState } from "../components/ui/StatusStates";

export function Dashboard() {
  const { t, language } = useLanguage();
  const { profile } = useFarm();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <div className="app-container space-y-field py-section text-center">
        <p className="text-muted-foreground">{t("dashboardNoProfile")}</p>
        <Button onClick={() => navigate("/onboarding")}>{t("dashboardSetUpFarm")}</Button>
      </div>
    );
  }

  return (
    <div className="app-container space-y-section py-section">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{t("dashboardGreeting")},</p>
          <h2 className="text-page-title text-primary">{profile.farmName}</h2>
          <p className="text-sm text-muted-foreground">{profile.lga}, {profile.state}</p>
          <p className="text-metadata italic">{t("deviceLocalNotice")}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/onboarding")}
          className="shrink-0 text-sm font-medium text-primary underline"
        >
          {t("onboardingEditFarm")}
        </button>
      </div>

      <Button className="w-full" onClick={() => navigate("/voice")}>
        {t("dashboardTalkToTerraSync")}
      </Button>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardTodayInsights")}</h3>
        <NotAvailableState label={t("notAvailableInsights")} />
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardWeather")}</h3>
        <NotAvailableState label={t("notAvailableWeather")} />
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardMyCrops")}</h3>
        <div className="grid grid-cols-2 gap-2">
          {profile.crops.map((crop) => (
            <button
              key={crop.id}
              type="button"
              onClick={() => navigate(`/crops/${crop.cropId}`)}
              className="text-left"
            >
              <Card>
                <p className="text-sm font-medium">{cropName(crop.cropId, language)}</p>
                <p className="text-metadata">{t(plantingStatusKey(crop.status))}</p>
              </Card>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardUpcomingHarvests")}</h3>
        <Button variant="outline" className="w-full" onClick={() => navigate("/harvest/report")}>
          {t("navReport")}
        </Button>
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardFarmTasks")}</h3>
        <NotAvailableState label={t("notAvailableTasks")} />
      </section>

      <section className="space-y-row">
        <h3 className="text-section-heading text-primary">{t("dashboardProduceAvailability")}</h3>
        <Button variant="outline" className="w-full" onClick={() => navigate("/harvest/board")}>
          {t("navBoard")}
        </Button>
      </section>
    </div>
  );
}
