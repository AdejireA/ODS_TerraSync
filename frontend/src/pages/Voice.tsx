import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/Button";
import { NotAvailableState } from "../components/ui/StatusStates";

// Placeholder until Feranmi's LiveKit backend issues room credentials.
// No token or LiveKit secret is ever to be hardcoded here - this page only
// renders UI state and will call a backend endpoint for a room token.
export function Voice() {
  const { t } = useLanguage();
  const [spokenLanguage, setSpokenLanguage] = useState<"en" | "yo">("en");

  return (
    <div className="app-container space-y-section py-section text-center">
      <h2 className="text-page-title text-primary">{t("voiceTitle")}</h2>
      <p className="text-reading text-muted-foreground">{t("voiceSubtitle")}</p>

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
        🎙 {t("voiceStart")}
      </Button>

      <NotAvailableState label={t("voiceComingSoon")} />
    </div>
  );
}
