import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Mic, Pencil, Sprout, Wheat } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { useAuth } from "../contexts/AuthContext";
import { cropImage, cropName } from "../data/crops";
import { plantingStatusKey } from "../data/farmOptions";
import { listTasks, type FarmTask } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { FeatureCard } from "../components/ui/FeatureCard";
import { DailyInsights } from "../components/DailyInsights";
import { WeatherCard } from "../components/WeatherCard";
import { NotAvailableState } from "../components/ui/StatusStates";

export function Dashboard() {
  const { t, language } = useLanguage();
  const { profile } = useFarm();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<FarmTask[] | null>(null);

  const activeCrop = useMemo(() => {
    if (!profile) return null;
    if (selectedCropId) {
      const match = profile.crops.find((c) => c.id === selectedCropId);
      if (match) return match;
    }
    return profile.crops.find((c) => c.status !== "harvested") ?? profile.crops[0] ?? null;
  }, [profile, selectedCropId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setTasks(null);
      return;
    }
    listTasks({ status: "pending" })
      .then(setTasks)
      .catch(() => setTasks(null));
  }, [isAuthenticated]);

  if (!profile) {
    return (
      <div className="app-container space-y-field py-section text-center">
        <p className="text-muted-foreground">{t("dashboardNoProfile")}</p>
        <Button onClick={() => navigate("/onboarding")}>{t("dashboardSetUpFarm")}</Button>
      </div>
    );
  }

  const overdueTasks = tasks?.filter((task) => task.due_date && task.due_date < new Date().toISOString().slice(0, 10)).length ?? 0;

  return (
    <div className="shell-container space-y-section py-section">
      {/* Farm overview */}
      <PageHeader
        title={`${t("dashboardGreeting")}, ${user?.name || profile.farmName}`}
        subtitle={`${profile.lga}, ${profile.state} · ${isAuthenticated ? t("farmSyncSynced") : t("deviceLocalNotice")}`}
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
          </div>
        </Card>

        {/* Farm summary */}
        <div className="col-span-1 grid grid-cols-2 gap-3 lg:grid-cols-1">
          <StatCard icon={Sprout} label={t("dashboardMyCrops")} value={profile.crops.length} />
          <StatCard
            icon={ListChecks}
            label={t("tasksTitle")}
            value={isAuthenticated ? (tasks?.length ?? "…") : "—"}
          />
        </div>
      </div>

      <div className="grid gap-section lg:grid-cols-2">
        {/* Today's Insights */}
        <section className="space-y-row">
          <SectionHeader
            title={activeCrop ? `${t("insightsSelectCrop")} ${cropName(activeCrop.cropId, language)}` : t("dashboardTodayInsights")}
            action={
              profile.crops.length > 1 ? (
                <select
                  value={activeCrop?.id ?? ""}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="rounded-md border border-border bg-card p-1 text-xs"
                >
                  {profile.crops.map((crop) => (
                    <option key={crop.id} value={crop.id}>{cropName(crop.cropId, language)}</option>
                  ))}
                </select>
              ) : undefined
            }
          />
          {activeCrop ? (
            <DailyInsights profile={profile} crop={activeCrop} />
          ) : (
            <NotAvailableState label={t("notAvailableInsights")} />
          )}
        </section>

        {/* Weather Intelligence */}
        <section className="space-y-row">
          <SectionHeader title={t("dashboardWeather")} />
          <WeatherCard state={profile.state} lga={profile.lga} compact />
        </section>
      </div>

      {/* Tasks summary */}
      <section className="space-y-row">
        <SectionHeader
          title={t("tasksTitle")}
          action={
            <button type="button" className="text-sm font-medium text-primary underline" onClick={() => navigate("/tasks")}>
              {t("tasksTitle")}
            </button>
          }
        />
        {!isAuthenticated ? (
          <NotAvailableState label={t("tasksSignInNotice")} />
        ) : tasks == null ? (
          <NotAvailableState label={t("insightsError")} />
        ) : tasks.length === 0 ? (
          <Card><p className="text-sm text-muted-foreground">{t("tasksEmpty")}</p></Card>
        ) : (
          <Card className="flex items-center gap-4">
            <p className="text-sm">
              <span className="font-bold text-primary">{tasks.length}</span> {t("tasksStatusPending")}
            </p>
            {overdueTasks > 0 && (
              <p className="text-sm text-destructive">{overdueTasks} overdue</p>
            )}
          </Card>
        )}
      </section>

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
        </div>
      </section>
    </div>
  );
}
