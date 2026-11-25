import { useState } from "react";
import { Mic } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { NotAvailableState } from "../components/ui/StatusStates";

// Placeholder until Feranmi's LiveKit backend issues room credentials.
// No token or LiveKit secret is ever to be hardcoded here - this page only
// renders UI state and will call a backend endpoint for a room token.
export function Voice() {
  const { t } = useLanguage();
  const [spokenLanguage, setSpokenLanguage] = useState<"en" | "yo">("en");

  return (
    <div className="shell-container space-y-section py-section">
      <div className="mx-auto max-w-xl space-y-field">
        <Card className="space-y-4 bg-primary text-center text-primary-foreground">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Mic className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-page-title">{t("voiceTitle")}</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">{t("voiceSubtitle")}</p>
          </div>
        </Card>

        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">
            {t("voiceLanguageLabel")}
          </span>
          <select
            value={spokenLanguage}
            onChange={(e) => setSpokenLanguage(e.target.value as "en" | "yo")}
            className="w-full rounded-md border border-border bg-card p-2"
          >
            <option value="en">English</option>
            <option value="yo">Yorùbá</option>
          </select>
        </label>

        <Button className="w-full" disabled>
          {t("voiceStart")}
        </Button>

        <NotAvailableState label={t("voiceComingSoon")} />
      </div>
    </div>
  );
}
