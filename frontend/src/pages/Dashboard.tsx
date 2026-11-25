import { useNavigate } from "react-router-dom";
import { CloudSun, Lightbulb, ListChecks, Mic, Pencil, Sprout, Truck, Wheat } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { cropImage, cropName } from "../data/crops";
import { plantingStatusKey } from "../data/farmOptions";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { FeatureCard } from "../components/ui/FeatureCard";
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

  const plantedOrGrowing = profile.crops.filter((c) => c.status !== "harvested").length;

  return (
    <div className="shell-container space-y-section py-section">
      {/* Farm overview */}
      <PageHeader
        title={profile.farmName}
        subtitle={`${profile.lga}, ${profile.state} · ${t("deviceLocalNotice")}`}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            {t("onboardingEditFarm")}
          </Button>
        }
      />

      <div className="grid gap-section lg:grid-cols-3">
        {/* Voice Intelligence hero */}
        <Card
          className="relative col-span-1 flex flex-col justify-between gap-4 overflow-hidden text-primary-foreground lg:col-span-2"
        >
          <img
            src="/images/hero/voice.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/85" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Mic className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              EN · Yorùbá
            </span>
          </div>
          <div className="relative">
            <p className="text-lg font-bold">{t("dashboardTalkToTerraSync")}</p>
            <p className="mt-1 text-sm text-primary-foreground/80">{t("voiceSubtitle")}</p>
          </div>
          <div className="relative flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => navigate("/voice")}>
              {t("voiceStart")}
            </Button>
            <span className="text-xs text-primary-foreground/70">{t("voiceComingSoon")}</span>
          </div>
        </Card>

        {/* Farm summary */}
        <div className="col-span-1 grid grid-cols-2 gap-3 lg:grid-cols-1">
          <StatCard icon={Sprout} label={t("dashboardMyCrops")} value={profile.crops.length} />
          <StatCard icon={Wheat} label={t("dashboardUpcomingHarvests")} value={plantedOrGrowing} />
        </div>
      </div>

      <div className="grid gap-section lg:grid-cols-2">
        {/* Today's Insights */}
        <section className="space-y-row">
          <SectionHeader title={t("dashboardTodayInsights")} />
          <NotAvailableState label={t("notAvailableInsights")}>
            <Lightbulb className="mt-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </NotAvailableState>
        </section>

        {/* Weather Intelligence */}
        <section className="space-y-row">
          <SectionHeader title={t("dashboardWeather")} />
          <NotAvailableState label={t("notAvailableWeather")}>
            <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CloudSun className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.lga}, {profile.state}
            </span>
          </NotAvailableState>
        </section>
      </div>

      {/* My Crops */}
      <section className="space-y-row">
        <SectionHeader title={t("dashboardMyCrops")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {profile.crops.map((crop) => (
            <button
              key={crop.id}
              type="button"
              onClick={() => navigate(`/crops/${crop.cropId}`)}
              className="text-left"
            >
              <Card className="flex h-full flex-col gap-2 overflow-hidden !p-0">
                <img
                  src={cropImage(crop.cropId)}
                  alt=""
                  className="h-24 w-full object-cover"
                  loading="lazy"
                />
                <div className="space-y-1 p-3 pt-0">
                  <p className="text-sm font-medium">{cropName(crop.cropId, language)}</p>
                  <p className="text-metadata">{t(plantingStatusKey(crop.status))}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>

      {/* Food Supply Intelligence */}
      <section className="space-y-row">
        <SectionHeader title={t("dashboardFoodSupply")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <FeatureCard
            icon={Wheat}
            title={t("navHarvest")}
            description={t("reportFormTitle")}
            onClick={() => navigate("/harvest/report")}
          />
          <FeatureCard
            icon={ListChecks}
            title={t("navProduceBoard")}
            description={t("boardTitle")}
            onClick={() => navigate("/harvest/board")}
          />
          <FeatureCard
            icon={Truck}
            title={t("dashboardUpcomingHarvests")}
            description={t("notAvailableTasks")}
            disabled
            badge={t("comingSoon")}
          />
          <FeatureCard
            icon={Lightbulb}
            title={t("dashboardFarmTasks")}
            description={t("notAvailableTasks")}
            disabled
            badge={t("comingSoon")}
          />
        </div>
      </section>
    </div>
  );
}
