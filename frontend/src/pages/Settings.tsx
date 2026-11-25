import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LanguageToggle } from "../components/LanguageToggle";

export function Settings() {
  const { t } = useLanguage();
  const { profile } = useFarm();
  const navigate = useNavigate();

  return (
    <div className="shell-container space-y-section py-section">
      <PageHeader title={t("settingsTitle")} />

      <section className="space-y-row">
        <SectionHeader title={t("settingsLanguage")} />
        <Card>
          <LanguageToggle />
        </Card>
      </section>

      <section className="space-y-row">
        <SectionHeader title={t("settingsFarm")} />
        <Card className="space-y-3">
          {profile ? (
            <>
              <p className="text-sm font-medium">{profile.farmName}</p>
              <p className="text-sm text-muted-foreground">{profile.lga}, {profile.state}</p>
              <p className="text-metadata">{t("settingsDataNotice")}</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>
                {t("settingsFarmEdit")}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/onboarding")}>
              {t("dashboardSetUpFarm")}
            </Button>
          )}
        </Card>
      </section>

      <section className="space-y-row">
        <SectionHeader title={t("settingsAbout")} />
        <Card>
          <p className="text-sm text-muted-foreground">{t("settingsAboutBody")}</p>
        </Card>
      </section>
    </div>
  );
}
