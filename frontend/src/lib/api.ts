export interface HarvestReportInput {
  crop: string;
  quantity: number;
  unit: string;
  state: string;
  lga: string;
  available_date: string;
  contact: string;
}

export interface HarvestReportSummary {
  id: number;
  crop: string;
  quantity: number;
  unit: string;
  state: string;
  lga: string;
  available_date: string;
  created_at: string;
}

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const TOKEN_STORAGE_KEY = "terrasync-token";

// Bearer token from POST /auth/login or /auth/register, if the user signed in.
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode); the session simply won't persist.
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text();
    let message = body || `Request failed with status ${response.status}`;
    try {
      const detail = JSON.parse(body).detail;
      if (typeof detail === "string") message = detail;
    } catch {
      // Non-JSON error body; keep the raw text.
    }
    throw new ApiError(response.status, message);
  }
  return response.json();
}

export function createHarvestReport(report: HarvestReportInput) {
  return request<{ id: number; status: string }>("/harvest-reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
}

export function listHarvestReports() {
  return request<HarvestReportSummary[]>("/harvest-reports");
}

export interface VoiceSession {
  session_id: string;
  room: string;
  url: string;
  token: string;
  identity: string;
  language: "en" | "yo";
  farm_id: string | null;
  expires_at: string;
  transcripts_stored: boolean;
}

export function createVoiceSession(language: "en" | "yo", farmId?: string) {
  return request<VoiceSession>("/voice/session", {
    method: "POST",
    body: JSON.stringify({ language, farm_id: farmId ?? null }),
  });
}
