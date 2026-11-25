import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  FARM_PROFILE_VERSION,
  isLegacyFarmProfile,
  migrateLegacyFarmProfile,
  type FarmCropRecord,
  type FarmProfile,
} from "../types/farm";

const STORAGE_KEY = "terrasync-farm-profile";

interface FarmContextValue {
  profile: FarmProfile | null;
  setProfile: (profile: FarmProfile) => void;
  updateProfile: (patch: Partial<Omit<FarmProfile, "version" | "crops">>) => void;
  addCrop: (crop: Omit<FarmCropRecord, "id">) => void;
  updateCrop: (id: string, patch: Partial<Omit<FarmCropRecord, "id">>) => void;
  removeCrop: (id: string) => void;
  clearProfile: () => void;
}

const FarmContext = createContext<FarmContextValue | null>(null);

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredProfile(): FarmProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as unknown;
    if (isLegacyFarmProfile(parsed)) {
      const migrated = migrateLegacyFarmProfile(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    const candidate = parsed as FarmProfile;
    if (candidate.version === FARM_PROFILE_VERSION) return candidate;
    return null;
  } catch {
    return null;
  }
}

function persist(profile: FarmProfile | null) {
  try {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FarmProfile | null>(readStoredProfile);

  const setProfile = (next: FarmProfile) => {
    setProfileState(next);
    persist(next);
  };

  const updateProfile = (patch: Partial<Omit<FarmProfile, "version" | "crops">>) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      persist(next);
      return next;
    });
  };

  const addCrop = (crop: Omit<FarmCropRecord, "id">) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, crops: [...current.crops, { ...crop, id: generateId(crop.cropId) }] };
      persist(next);
      return next;
    });
  };

  const updateCrop = (id: string, patch: Partial<Omit<FarmCropRecord, "id">>) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = {
        ...current,
        crops: current.crops.map((crop) => (crop.id === id ? { ...crop, ...patch } : crop)),
      };
      persist(next);
      return next;
    });
  };

  const removeCrop = (id: string) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, crops: current.crops.filter((crop) => crop.id !== id) };
      persist(next);
      return next;
    });
  };

  const clearProfile = () => {
    setProfileState(null);
    persist(null);
  };

  const value = useMemo(
    () => ({ profile, setProfile, updateProfile, addCrop, updateCrop, removeCrop, clearProfile }),
    [profile],
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}
