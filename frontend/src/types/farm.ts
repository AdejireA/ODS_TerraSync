export type PlantingStatus = "planned" | "planted" | "harvested";
export type DatePrecision = "exact" | "approximate" | "unknown";
export type AreaUnit = "acres" | "hectares" | "plots";
export type SoilType = "clay" | "sandy" | "loamy" | "silt" | "unknown";
export type WaterSource = "rainfed" | "irrigation" | "borehole" | "river" | "unknown";

export interface FarmCropRecord {
  id: string;
  cropId: string;
  status: PlantingStatus;
  plantingDate?: string;
  plantingDatePrecision: DatePrecision;
  variety?: string;
  plantedArea?: number;
  plantedAreaUnit?: AreaUnit;
}

export const FARM_PROFILE_VERSION = 2 as const;

export interface FarmProfile {
  version: typeof FARM_PROFILE_VERSION;
  farmName: string;
  state: string;
  lga: string;
  community?: string;
  latitude?: number;
  longitude?: number;
  farmSize?: number;
  farmSizeUnit?: AreaUnit;
  soilType?: SoilType;
  waterSource?: WaterSource;
  crops: FarmCropRecord[];
}

/** Shape persisted by the first onboarding flow, kept only for migration. */
export interface LegacyFarmProfileV1 {
  farmName: string;
  state: string;
  lga: string;
  crops: string[];
}

export function isLegacyFarmProfile(value: unknown): value is LegacyFarmProfileV1 {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    !("version" in candidate) &&
    Array.isArray(candidate.crops) &&
    (candidate.crops.length === 0 || typeof candidate.crops[0] === "string")
  );
}

export function migrateLegacyFarmProfile(legacy: LegacyFarmProfileV1): FarmProfile {
  return {
    version: FARM_PROFILE_VERSION,
    farmName: legacy.farmName,
    state: legacy.state,
    lga: legacy.lga,
    crops: legacy.crops.map((cropId) => ({
      id: `${cropId}-${Math.random().toString(36).slice(2, 8)}`,
      cropId,
      status: "planted",
      plantingDatePrecision: "unknown",
    })),
  };
}
