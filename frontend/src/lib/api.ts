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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
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
