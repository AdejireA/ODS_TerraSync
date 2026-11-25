import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LanguageToggle } from "../components/LanguageToggle";

export function Landing() {
  const { t } = useLanguage();
  const { profile } = useFarm();
  const navigate = useNavigate();

  return (
    <div className="app-container flex min-h-dvh flex-col justify-center gap-section py-section">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          {t("appTitle")}
        </p>
        <h1 className="text-page-title text-primary">{t("landingHeadline")}</h1>
        <p className="text-reading text-muted-foreground">{t("landingSubheadline")}</p>
      </div>

      <div className="space-y-row">
        <Card>
          <p className="text-section-heading text-primary">{t("landingPillarFarmTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("landingPillarFarmBody")}</p>
        </Card>
        <Card>
          <p className="text-section-heading text-primary">{t("landingPillarVoiceTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("landingPillarVoiceBody")}</p>
        </Card>
        <Card>
          <p className="text-section-heading text-primary">{t("landingPillarSupplyTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("landingPillarSupplyBody")}</p>
        </Card>
      </div>

      <div className="space-y-2">
        <Button className="w-full" onClick={() => navigate("/onboarding")}>
          {t("landingCtaPrimary")}
        </Button>
        {profile && (
          <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
            {t("landingCtaSecondary")}
          </Button>
        )}
      </div>
    </div>
  );
}
