import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionState,
  Participant,
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
} from "livekit-client";
import { ApiError, createVoiceSession } from "../lib/api";

export type CallStatus =
  | "idle"
  | "connecting"
  | "waiting_agent"
  | "connected"
  | "reconnecting"
  | "ended"
  | "error";

export type AgentState = "initializing" | "listening" | "thinking" | "speaking" | null;

export type CallError = "mic_denied" | "unavailable" | "failed" | null;

export interface TranscriptLine {
  id: string;
  speaker: "user" | "assistant";
  text: string;
  final: boolean;
}

// Browser voice call: asks the backend for a short-lived LiveKit token, joins the
// room with the microphone only, and plays the agent's audio. The backend dispatches
// the TerraSync agent into the room; no LiveKit secret ever reaches the browser.
export function useVoiceCall() {
  const roomRef = useRef<Room | null>(null);
  const audioRef = useRef<HTMLDivElement | null>(null);
  const attemptRef = useRef(0);
  const activeRef = useRef(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [agentState, setAgentState] = useState<AgentState>(null);
  const [error, setError] = useState<CallError>(null);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [transcriptsStored, setTranscriptsStored] = useState(false);

  const upsertLine = useCallback((line: TranscriptLine) => {
    setTranscript((lines) => {
      const index = lines.findIndex((l) => l.id === line.id);
      if (index === -1) return [...lines, line];
      const next = lines.slice();
      next[index] = line;
      return next;
    });
  }, []);

  const cleanup = useCallback(() => {
    roomRef.current?.removeAllListeners();
    roomRef.current = null;
    activeRef.current = false;
    if (audioRef.current) audioRef.current.innerHTML = "";
  }, []);

  const start = useCallback(
    async (language: "en" | "yo", farmId?: string) => {
      if (activeRef.current) return;
      activeRef.current = true;
      const attempt = ++attemptRef.current;
      const cancelled = () => attempt !== attemptRef.current;
      setError(null);
      setTranscript([]);
      setAgentState(null);
      setMuted(false);
      setTranscriptsStored(false);
      setStatus("connecting");

      // Ask for the microphone first so a denial is reported clearly.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        if (cancelled()) return;
        activeRef.current = false;
        setError("mic_denied");
        setStatus("error");
        return;
      }
      if (cancelled()) return;

      let session;
      try {
        session = await createVoiceSession(language, farmId);
      } catch (err) {
        if (cancelled()) return;
        activeRef.current = false;
        setError(err instanceof ApiError && err.status === 503 ? "unavailable" : "failed");
        setStatus("error");
        return;
      }
      if (cancelled()) return;
      setTranscriptsStored(session.transcripts_stored);

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      const isAgent = (p: Participant) => p.identity !== room.localParticipant.identity;

      room
        .on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Audio && audioRef.current) {
            audioRef.current.appendChild(track.attach());
          }
        })
        .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach().forEach((el) => el.remove());
        })
        .on(RoomEvent.ParticipantConnected, (p) => {
          if (isAgent(p)) setStatus("connected");
        })
        .on(RoomEvent.ParticipantDisconnected, () => {
          if (!Array.from(room.remoteParticipants.values()).some(isAgent)) {
            setAgentState(null);
            setStatus("waiting_agent");
          }
        })
        .on(RoomEvent.ParticipantAttributesChanged, (_changed, p) => {
          const state = p.attributes["lk.agent.state"];
          if (state) setAgentState(state as AgentState);
        })
        .on(RoomEvent.Reconnecting, () => setStatus("reconnecting"))
        .on(RoomEvent.Reconnected, () => setStatus(
          Array.from(room.remoteParticipants.values()).some(isAgent) ? "connected" : "waiting_agent",
        ))
        .on(RoomEvent.Disconnected, () => {
          if (roomRef.current !== room) return;
          ++attemptRef.current;
          cleanup();
          setAgentState(null);
          setStatus((current) => (current === "error" ? current : "ended"));
        });

      // LiveKit Agents publish live transcriptions as text streams on this topic.
      room.registerTextStreamHandler("lk.transcription", async (reader, participantInfo) => {
        const id = reader.info.attributes?.["lk.segment_id"] ?? reader.info.id;
        const speaker = participantInfo.identity === room.localParticipant.identity ? "user" : "assistant";
        let text = "";
        for await (const chunk of reader) {
          if (cancelled()) return;
          text += chunk;
          upsertLine({ id, speaker, text, final: false });
        }
        if (!cancelled()) upsertLine({ id, speaker, text, final: true });
      });

      try {
        await room.connect(session.url, session.token);
        if (cancelled()) { await room.disconnect(); return; }
        await room.localParticipant.setMicrophoneEnabled(true);
        if (cancelled()) { await room.disconnect(); return; }
        await room.startAudio();
        if (cancelled()) { await room.disconnect(); return; }
        const agentPresent = Array.from(room.remoteParticipants.values()).some(isAgent);
        setStatus(agentPresent ? "connected" : "waiting_agent");
      } catch {
        if (cancelled()) return;
        cleanup();
        await room.disconnect();
        setError("failed");
        setStatus("error");
      }
    },
    [cleanup, upsertLine],
  );

  const end = useCallback(async () => {
    ++attemptRef.current;
    const room = roomRef.current;
    cleanup();
    setAgentState(null);
    setStatus("ended");
    if (room && room.state !== ConnectionState.Disconnected) await room.disconnect();
  }, [cleanup]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !muted;
    try {
      await room.localParticipant.setMicrophoneEnabled(!next);
      if (roomRef.current === room) setMuted(next);
    } catch {
      if (roomRef.current === room) setError("failed");
    }
  }, [muted]);

  useEffect(() => () => {
    ++attemptRef.current;
    const room = roomRef.current;
    cleanup();
    void room?.disconnect();
  }, [cleanup]);

  return { status, agentState, error, muted, transcript, transcriptsStored, start, end, toggleMute, audioRef };
}
