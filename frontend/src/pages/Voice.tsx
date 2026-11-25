import { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { listFarms, type BackendFarm } from "../lib/api";
import { cropName } from "../data/crops";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/StatusStates";
import { useVoiceCall } from "../hooks/useVoiceCall";
import type { TranslationKey } from "../i18n/translations";

const AGENT_STATE_LABEL: Record<string, TranslationKey> = {
  listening: "voiceListening",
  thinking: "voiceThinking",
  speaking: "voiceSpeaking",
};

// Browser voice call to the TerraSync agent. The token comes from
// POST /api/v1/voice/session; no LiveKit secret is held in the frontend.
export function Voice() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [farmOptions, setFarmOptions] = useState<{ userId: string; farms: BackendFarm[] } | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [spokenLanguage, setSpokenLanguage] = useState<"en" | "yo">(language);
  const call = useVoiceCall();
  const farms = farmOptions?.userId === user?.id ? farmOptions?.farms ?? [] : [];
  const farmId = farms.find((farm) => farm.id === selectedFarmId)?.id;

  useEffect(() => {
    if (user?.role !== "farmer") return;
    let cancelled = false;
    listFarms().then((items) => {
      if (!cancelled) setFarmOptions({ userId: user.id, farms: items.filter((farm) => farm.state === "Ogun") });
    }).catch(() => {
      if (!cancelled) setFarmOptions(null);
    });
    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  const inCall = ["connecting", "waiting_agent", "connected", "reconnecting"].includes(call.status);

  let statusLabel: string | null = null;
  if (call.status === "connecting") statusLabel = t("voiceConnecting");
  else if (call.status === "waiting_agent") statusLabel = t("voiceWaitingAgent");
  else if (call.status === "reconnecting") statusLabel = t("voiceReconnecting");
  else if (call.status === "ended") statusLabel = t("voiceEnded");
  else if (call.status === "connected" && call.agentState && AGENT_STATE_LABEL[call.agentState])
    statusLabel = t(AGENT_STATE_LABEL[call.agentState]);
  else if (call.status === "connected") statusLabel = t("voiceConnected");

  const errorLabel =
    call.error === "mic_denied" ? t("voiceMicDenied")
    : call.error === "unavailable" ? t("voiceUnavailable")
    : call.error === "failed" ? t("voiceError")
    : null;

  return (
    <div className="shell-container space-y-section py-section">
      <div className="mx-auto max-w-xl space-y-field">
        <Card className="relative space-y-4 overflow-hidden text-center text-primary-foreground">
          <img src="/images/hero/voice.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <Mic className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="relative">
            <h2 className="text-page-title">{t("voiceTitle")}</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">{t("voiceSubtitle")}</p>
            <p className="mt-2 text-xs text-primary-foreground/70">{t("voiceOgunNotice")}</p>
          </div>
        </Card>

      <label className="block text-left">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("voiceLanguageLabel")}</span>
        <select
          value={spokenLanguage}
          disabled={inCall}
          onChange={(e) => setSpokenLanguage(e.target.value as "en" | "yo")}
          className="w-full rounded-md border border-border bg-card p-2"
        >
          <option value="en">English</option>
          <option value="yo">Yorùbá</option>
        </select>
      </label>

      {farms.length > 0 && (
        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-muted-foreground">{t("voiceFarmLabel")}</span>
          <select value={farmId ?? ""} disabled={inCall} onChange={(event) => setSelectedFarmId(event.target.value)}
                  className="w-full rounded-md border border-border bg-card p-2">
            <option value="">{t("voiceGeneralAdvice")}</option>
            {farms.map((farm) => <option key={farm.id} value={farm.id}>{farm.name || cropName(farm.crop, language)} — {farm.lga}</option>)}
          </select>
        </label>
      )}
      {!user && <p className="text-sm text-muted-foreground">{t("voiceGuestNotice")}</p>}

      <p className="text-sm text-muted-foreground">{t("voiceAutomatedNote")}</p>

      {statusLabel && (
        <p role="status" aria-live="polite" className="text-lg font-semibold text-primary">
          {statusLabel}
        </p>
      )}

      {errorLabel && <ErrorState label={errorLabel} />}

      {inCall ? (
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => void call.toggleMute()}
                  disabled={call.status === "connecting"} aria-pressed={call.muted}>
            {call.muted ? t("voiceUnmute") : t("voiceMute")}
          </Button>
          <Button className="flex-1" onClick={() => void call.end()}>
            {t("voiceEnd")}
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => void call.start(spokenLanguage, farmId)}>
          {call.status === "error" || call.status === "ended" ? t("voiceRetry") : t("voiceStart")}
        </Button>
      )}

      {call.transcript.length > 0 && (
        <Card className="space-y-2 text-left" aria-live="polite">
          <h3 className="font-semibold">{t("voiceTranscript")}</h3>
          {call.transcript.map((line) => (
            <p key={line.id} className={line.final ? "" : "opacity-70"}>
              <span className="font-medium">{line.speaker === "user" ? t("voiceYou") : t("voiceAssistant")}: </span>
              {line.text}
            </p>
          ))}
        </Card>
      )}

      {/* Remote audio elements are attached here. */}
      <div ref={call.audioRef} hidden />
      </div>
    </div>
  );
}
