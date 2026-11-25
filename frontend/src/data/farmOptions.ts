import type { AreaUnit, DatePrecision, PlantingStatus, SoilType, WaterSource } from "../types/farm";
import type { TranslationKey } from "../i18n/translations";

export const SOIL_TYPES: SoilType[] = ["clay", "sandy", "loamy", "silt", "unknown"];
export const WATER_SOURCES: WaterSource[] = ["rainfed", "irrigation", "borehole", "river", "unknown"];
export const AREA_UNITS: AreaUnit[] = ["acres", "hectares", "plots"];
export const PLANTING_STATUSES: PlantingStatus[] = ["planned", "planted", "harvested"];

export function soilTypeKey(value: SoilType): TranslationKey {
  return `soil${capitalize(value)}` as TranslationKey;
}

export function waterSourceKey(value: WaterSource): TranslationKey {
  return `water${capitalize(value)}` as TranslationKey;
}

export function areaUnitKey(value: AreaUnit): TranslationKey {
  return `unit${capitalize(value)}` as TranslationKey;
}

export function plantingStatusKey(value: PlantingStatus): TranslationKey {
  return `status${capitalize(value)}` as TranslationKey;
}

export function datePrecisionKey(value: DatePrecision): TranslationKey {
  return `precision${capitalize(value)}` as TranslationKey;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
