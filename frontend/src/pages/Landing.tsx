import { useNavigate } from "react-router-dom";
import { Leaf, Mic, Sprout, Truck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useFarm } from "../contexts/FarmContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { LanguageToggle } from "../components/LanguageToggle";

const pillars = [
  { icon: Sprout, titleKey: "landingPillarFarmTitle", bodyKey: "landingPillarFarmBody" } as const,
  { icon: Mic, titleKey: "landingPillarVoiceTitle", bodyKey: "landingPillarVoiceBody" } as const,
  { icon: Truck, titleKey: "landingPillarSupplyTitle", bodyKey: "landingPillarSupplyBody" } as const,
];

export function Landing() {
  const { t } = useLanguage();
  const { profile } = useFarm();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-8 px-page py-section">
      <div className="flex justify-end">
        <LanguageToggle />
      </div>

      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-xl font-extrabold tracking-tight text-primary">{t("appTitle")}</p>
        </div>
        <h1 className="text-4xl font-bold leading-tight text-primary sm:text-5xl">{t("landingHeadline")}</h1>
        <p className="text-reading text-muted-foreground">{t("landingSubheadline")}</p>
      </div>

      <div className="grid gap-row sm:grid-cols-3">
        {pillars.map(({ icon: Icon, titleKey, bodyKey }) => (
          <Card key={titleKey} className="space-y-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-light text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-section-heading text-primary">{t(titleKey)}</p>
            <p className="text-sm text-muted-foreground">{t(bodyKey)}</p>
          </Card>
        ))}
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
