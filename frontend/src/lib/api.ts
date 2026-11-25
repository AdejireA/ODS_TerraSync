// Client for the FastAPI backend (codex/backend-ci-cd @ 02489f2). Endpoints and
// shapes here are inspected from that branch's actual source, not guessed.
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
  if (response.status === 204) return undefined as T;
  return response.json();
}

// ---------------------------------------------------------------- auth

export type Role = "farmer" | "coordinator";

export interface PublicUser {
  id: string;
  phone: string;
  name: string | null;
  role: Role;
  language: "en" | "yo";
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  expires_at: number;
  user: PublicUser;
}

export function registerAccount(input: {
  phone: string;
  pin: string;
  name?: string;
  language?: "en" | "yo";
  role?: Role;
  coordinator_code?: string;
}) {
  return request<AuthSession>("/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export function loginAccount(input: { phone: string; pin: string }) {
  return request<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function getCurrentUser() {
  return request<PublicUser>("/auth/me");
}

// ---------------------------------------------------------------- reference

export interface StateInfo {
  name: string;
  capital: string;
  pilot: boolean;
  lgas: string[];
}

export function getLocations() {
  return request<{ states: StateInfo[] }>("/locations");
}

export interface CropInfo {
  id: string;
  name_en: string;
  name_yo: string;
  has_rules: boolean;
}

export function getCropsReference() {
  return request<{ crops: CropInfo[]; units: string[] }>("/crops");
}

export interface WeatherDay {
  date: string;
  temperature_max_c: number;
  temperature_min_c: number;
  precipitation_mm: number;
  precipitation_probability_pct: number;
}

export interface WeatherResponse {
  provider: string;
  state: string;
  lga: string | null;
  location: { name: string; lat: number; lon: number; resolution: string; note: string };
  available: boolean;
  reason?: string;
  fetched_at?: string;
  current?: { time: string; temperature_c: number; relative_humidity_pct: number; precipitation_mm: number };
  daily?: WeatherDay[];
}

export function getWeather(state: string, lga?: string | null) {
  const query = new URLSearchParams({ state });
  if (lga) query.set("lga", lga);
  return request<WeatherResponse>(`/weather?${query.toString()}`);
}

// ---------------------------------------------------------------- farms

export interface FarmInput {
  name?: string | null;
  state: string;
  lga: string;
  crop: string;
  planting_date?: string | null;
  approximate_age_weeks?: number | null;
  soil_type?: string | null;
  farm_size_ha?: number | null;
}

export interface BackendFarm extends FarmInput {
  id: string;
  created_at: string;
  updated_at: string | null;
}

export function listFarms() {
  return request<BackendFarm[]>("/farms");
}

export function createFarm(input: FarmInput) {
  return request<BackendFarm>("/farms", { method: "POST", body: JSON.stringify(input) });
}

export function updateFarm(farmId: string, input: FarmInput) {
  return request<BackendFarm>(`/farms/${farmId}`, { method: "PUT", body: JSON.stringify(input) });
}

export function getFarm(farmId: string) {
  return request<BackendFarm>(`/farms/${farmId}`);
}

// ---------------------------------------------------------------- insights

export interface InsightItem {
  rule_id: string;
  crop: string;
  category: "crop_care" | "harvest" | "post_harvest" | "weather";
  priority: number;
  urgency: "high" | "medium" | "low";
  title: string;
  reason: string;
  action: string;
  rationale: string;
  evidence: { source_title: string; source_url: string; source_verified: boolean };
  review_status: string;
  uncertainty: string;
  contraindications: string;
  escalation: string;
  region_level: string;
  language: string;
}

export interface DailyInsightsResponse {
  date: string;
  context: {
    farm_id: string | null;
    crop: string;
    state: string | null;
    lga: string | null;
    planting_date: string | null;
    days_after_planting: number | null;
  };
  items: InsightItem[];
  missing_context: { field: string; message: string }[];
  notes: string[];
  weather: WeatherResponse | null;
  status: string;
}

export function getDailyInsights(params: {
  farmId?: string;
  crop?: string;
  state?: string;
  lga?: string;
  plantingDate?: string;
  language?: "en" | "yo";
  includeWeather?: boolean;
}) {
  const query = new URLSearchParams();
  if (params.farmId) query.set("farm_id", params.farmId);
  if (params.crop) query.set("crop", params.crop);
  if (params.state) query.set("state", params.state);
  if (params.lga) query.set("lga", params.lga);
  if (params.plantingDate) query.set("planting_date", params.plantingDate);
  if (params.language) query.set("language", params.language);
  if (params.includeWeather === false) query.set("include_weather", "false");
  return request<DailyInsightsResponse>(`/insights/today?${query.toString()}`);
}

export function searchKnowledge(params: { crop: string; category?: string; state?: string; q?: string }) {
  const query = new URLSearchParams({ crop: params.crop });
  if (params.category) query.set("category", params.category);
  if (params.state) query.set("state", params.state);
  if (params.q) query.set("q", params.q);
  return request<{ crop: string; category: string | null; items: InsightItem[]; status: string }>(
    `/knowledge?${query.toString()}`,
  );
}

// ---------------------------------------------------------------- tasks

export interface FarmTask {
  id: string;
  farm_id: string | null;
  action: string;
  due_date: string | null;
  status: "pending" | "done" | "skipped";
  rule_id: string | null;
  source: string;
  created_at: string;
  completed_at: string | null;
}

export function listTasks(params?: { farmId?: string; status?: FarmTask["status"] }) {
  const query = new URLSearchParams();
  if (params?.farmId) query.set("farm_id", params.farmId);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return request<FarmTask[]>(`/tasks${qs ? `?${qs}` : ""}`);
}

export function createTask(input: { action: string; farmId?: string; dueDate?: string; ruleId?: string }) {
  return request<FarmTask>("/tasks", {
    method: "POST",
    body: JSON.stringify({ action: input.action, farm_id: input.farmId, due_date: input.dueDate, rule_id: input.ruleId }),
  });
}

export function updateTask(taskId: string, status: FarmTask["status"]) {
  return request<FarmTask>(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

// ---------------------------------------------------------------- harvest

export type ReportStatus = "expected" | "available" | "sold" | "withdrawn";

export interface HarvestReportInput {
  crop: string;
  quantity: number;
  unit: string;
  state: string;
  lga: string;
  available_date: string;
  contact: string;
  contact_consent?: boolean;
  status?: "expected" | "available";
  farm_id?: string | null;
}

export interface HarvestReportSummary {
  id: number;
  crop: string;
  quantity: number;
  unit: string;
  state: string;
  lga: string;
  available_date: string;
  status: ReportStatus;
  effective_status: ReportStatus | "expired";
  source: string;
  created_at: string;
  updated_at: string | null;
  interested: boolean;
  interest_count: number;
}

export function createHarvestReport(report: HarvestReportInput) {
  return request<{ id: number; status: string }>("/harvest-reports", {
    method: "POST",
    body: JSON.stringify(report),
  });
}

export function listHarvestReports(filters?: {
  crop?: string;
  state?: string;
  lga?: string;
  status?: ReportStatus;
}) {
  const query = new URLSearchParams();
  if (filters?.crop) query.set("crop", filters.crop);
  if (filters?.state) query.set("state", filters.state);
  if (filters?.lga) query.set("lga", filters.lga);
  if (filters?.status) query.set("status", filters.status);
  const qs = query.toString();
  return request<HarvestReportSummary[]>(`/harvest-reports${qs ? `?${qs}` : ""}`);
}

export function myHarvestReports() {
  return request<HarvestReportSummary[]>("/harvest-reports/mine");
}

export function updateHarvestStatus(reportId: number, status: ReportStatus) {
  return request<HarvestReportSummary>(`/harvest-reports/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function registerHarvestInterest(reportId: number, note?: string) {
  return request<{ id: number; interested: boolean; interest_count: number }>(
    `/harvest-reports/${reportId}/interest`,
    { method: "POST", body: note ? JSON.stringify({ note }) : undefined },
  );
}

export function getHarvestContact(reportId: number) {
  return request<{ id: number; contact: string }>(`/harvest-reports/${reportId}/contact`);
}

export interface GuidanceItem {
  crop: string;
  language: string;
  title: string;
  content: string;
  source_url: string | null;
}

export function getGuidance(crop: string, language: "en" | "yo") {
  return request<{ items: GuidanceItem[] }>(
    `/guidance?crop=${encodeURIComponent(crop)}&language=${language}`,
  );
}

// ---------------------------------------------------------------- voice

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

export function createVoiceSession(language: "en" | "yo", farmId?: string | null) {
  return request<VoiceSession>("/voice/session", {
    method: "POST",
    body: JSON.stringify({ language, farm_id: farmId ?? null }),
  });
}

export interface VoiceSessionSummary {
  session_id: string;
  language: string;
  farm_id: string | null;
  created_at: string;
  ended_at: string | null;
  turns: number;
}

export function listVoiceSessions() {
  return request<VoiceSessionSummary[]>("/voice/sessions");
}

export interface VoiceTranscript {
  session_id: string;
  language: string;
  created_at: string;
  ended_at: string | null;
  items: { role: string; text: string; created_at: string }[];
}

export function getVoiceTranscript(sessionId: string) {
  return request<VoiceTranscript>(`/voice/sessions/${sessionId}/transcript`);
}
