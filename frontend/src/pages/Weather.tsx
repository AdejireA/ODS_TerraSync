import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { PageHeader } from "../components/ui/PageHeader";
import { WeatherCard } from "../components/WeatherCard";
import { NotAvailableState } from "../components/ui/StatusStates";

export function Weather() {
  const { t } = useLanguage();
  const { profile } = useFarm();

  if (!profile) {
    return (
      <div className="shell-container space-y-section py-section">
        <PageHeader title={t("dashboardWeather")} />
        <NotAvailableState label={t("dashboardNoProfile")} />
      </div>
    );
  }

  return (
    <div className="shell-container space-y-section py-section">
      <PageHeader title={t("dashboardWeather")} subtitle={`${profile.lga}, ${profile.state}`} />
      <WeatherCard state={profile.state} lga={profile.lga} />
    </div>
  );
}
