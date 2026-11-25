// Maps the frontend's multi-crop FarmProfile onto the backend's one-crop-per-
// farm-record contract (`backend/app/services/farms.py`: `FarmInput` has a
// single `crop` field, not a list). Each FarmCropRecord becomes one backend
// `farms` row, tracked locally via `crop.backendFarmId` so repeat syncs PUT
// the existing row instead of creating duplicates.
//
// Fields the backend doesn't support per-crop (variety, planted area/unit,
// community, water source) stay local-only and are never sent.
import { createFarm, updateFarm, listFarms, type BackendFarm, type FarmInput } from "./api";
import {
  FARM_PROFILE_VERSION,
  type DatePrecision,
  type FarmCropRecord,
  type FarmProfile,
  type SoilType,
} from "../types/farm";

const HECTARES_PER_ACRE = 0.404686;
const KNOWN_SOIL_TYPES: SoilType[] = ["clay", "sandy", "loamy", "silt", "unknown"];

function farmSizeHectares(profile: FarmProfile): number | null {
  if (profile.farmSize == null) return null;
  if (profile.farmSizeUnit === "hectares") return profile.farmSize;
  if (profile.farmSizeUnit === "acres") return Number((profile.farmSize * HECTARES_PER_ACRE).toFixed(2));
  // "plots" has no fixed, convertible area — omit rather than send a wrong number.
  return null;
}

function soilTypeForBackend(soil?: SoilType): string | null {
  if (!soil || soil === "unknown") return null;
  return soil;
}

function approximateAgeWeeksFor(crop: FarmCropRecord): number | null {
  if (crop.plantingDatePrecision !== "approximate" || !crop.plantingDate) return null;
  const planted = new Date(crop.plantingDate);
  if (Number.isNaN(planted.getTime())) return null;
  const days = Math.floor((Date.now() - planted.getTime()) / 86_400_000);
  return days >= 0 ? Math.floor(days / 7) : null;
}

export function cropToFarmInput(profile: FarmProfile, crop: FarmCropRecord): FarmInput {
  return {
    name: profile.farmName || null,
    state: profile.state,
    lga: profile.lga,
    crop: crop.cropId,
    planting_date: crop.plantingDatePrecision === "exact" && crop.plantingDate ? crop.plantingDate : null,
    approximate_age_weeks: approximateAgeWeeksFor(crop),
    soil_type: soilTypeForBackend(profile.soilType),
    farm_size_ha: farmSizeHectares(profile),
  };
}

export interface SyncOutcome {
  crops: FarmCropRecord[];
  errors: { cropId: string; message: string }[];
}

/**
 * Create or update one backend farm row per crop. Safe to call repeatedly —
 * crops that already have a `backendFarmId` are updated in place, never
 * duplicated. A crop whose sync fails keeps its previous state and is
 * reported in `errors`; it stays saved locally regardless.
 */
export async function syncProfileToBackend(profile: FarmProfile): Promise<SyncOutcome> {
  const errors: SyncOutcome["errors"] = [];
  const crops: FarmCropRecord[] = [];
  for (const crop of profile.crops) {
    const input = cropToFarmInput(profile, crop);
    try {
      const farm = crop.backendFarmId
        ? await updateFarm(crop.backendFarmId, input)
        : await createFarm(input);
      crops.push({ ...crop, backendFarmId: farm.id });
    } catch (err) {
      errors.push({ cropId: crop.cropId, message: err instanceof Error ? err.message : "Sync failed" });
      crops.push(crop);
    }
  }
  return { crops, errors };
}

function precisionFor(farm: BackendFarm): DatePrecision {
  if (farm.planting_date) return "exact";
  if (farm.approximate_age_weeks != null) return "approximate";
  return "unknown";
}

function plantingDateFor(farm: BackendFarm): string | undefined {
  if (farm.planting_date) return farm.planting_date;
  if (farm.approximate_age_weeks != null) {
    const estimated = new Date(Date.now() - farm.approximate_age_weeks * 7 * 86_400_000);
    return estimated.toISOString().slice(0, 10);
  }
  return undefined;
}

function farmToCropRecord(farm: BackendFarm): FarmCropRecord {
  return {
    id: farm.id,
    cropId: farm.crop,
    status: farm.planting_date || farm.approximate_age_weeks != null ? "planted" : "planned",
    plantingDate: plantingDateFor(farm),
    plantingDatePrecision: precisionFor(farm),
    backendFarmId: farm.id,
  };
}

/**
 * Rebuild a FarmProfile from the farmer's backend farm records — used when
 * signing in on a device with no local profile (a new device, or storage was
 * cleared). All of this farmer's farm rows are assumed to share one farm
 * name/state/lga (how this app writes them); the first row's values are used
 * for the shared fields.
 */
export function backendFarmsToProfile(farms: BackendFarm[], userId: string): FarmProfile | null {
  if (farms.length === 0) return null;
  const [first] = farms;
  return {
    version: FARM_PROFILE_VERSION,
    farmName: first.name || "",
    state: first.state,
    lga: first.lga,
    farmSize: first.farm_size_ha ?? undefined,
    farmSizeUnit: first.farm_size_ha != null ? "hectares" : undefined,
    soilType: KNOWN_SOIL_TYPES.includes(first.soil_type as SoilType) ? (first.soil_type as SoilType) : undefined,
    crops: farms.map(farmToCropRecord),
    syncedUserId: userId,
  };
}

export { listFarms };
