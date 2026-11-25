import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
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
  const [spokenLanguage, setSpokenLanguage] = useState<"en" | "yo">(language);
  const call = useVoiceCall();

  const inCall = ["connecting", "waiting_agent", "connected", "reconnecting"].includes(call.status);

  let statusLabel: string | null = null;
  if (call.status === "connecting") statusLabel = t("voiceConnecting");
  else if (call.status === "waiting_agent") statusLabel = t("voiceWaitingAgent");
  else if (call.status === "reconnecting") statusLabel = t("voiceReconnecting");
  else if (call.status === "ended") statusLabel = t("voiceEnded");
  else if (call.status === "connected" && call.agentState && AGENT_STATE_LABEL[call.agentState])
    statusLabel = t(AGENT_STATE_LABEL[call.agentState]);

  const errorLabel =
    call.error === "mic_denied" ? t("voiceMicDenied")
    : call.error === "unavailable" ? t("voiceUnavailable")
    : call.error === "failed" ? t("voiceError")
    : null;

  return (
    <div className="app-container space-y-section py-section text-center">
      <h2 className="text-page-title text-primary">{t("voiceTitle")}</h2>
      <p className="text-reading text-muted-foreground">{t("voiceSubtitle")}</p>

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

      <p className="text-sm text-muted-foreground">{t("voiceAutomatedNote")}</p>

      {statusLabel && (
        <p role="status" aria-live="polite" className="text-lg font-semibold text-primary">
          {call.status === "connected" && call.agentState === "speaking" ? "🔊 " : ""}
          {call.status === "connected" && call.agentState === "listening" && !call.muted ? "🎙 " : ""}
          {statusLabel}
        </p>
      )}

      {errorLabel && <ErrorState label={errorLabel} />}

      {inCall ? (
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => void call.toggleMute()}
                  disabled={call.status === "connecting"} aria-pressed={call.muted}>
            {call.muted ? `🔇 ${t("voiceUnmute")}` : `🎙 ${t("voiceMute")}`}
          </Button>
          <Button className="flex-1" onClick={() => void call.end()}>
            ⏹ {t("voiceEnd")}
          </Button>
        </div>
      ) : (
        <Button className="w-full" onClick={() => void call.start(spokenLanguage)}>
          🎙 {call.status === "error" || call.status === "ended" ? t("voiceRetry") : t("voiceStart")}
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
  );
}
