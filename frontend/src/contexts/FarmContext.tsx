import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FARM_PROFILE_VERSION,
  isLegacyFarmProfile,
  migrateLegacyFarmProfile,
  type FarmCropRecord,
  type FarmProfile,
} from "../types/farm";
import { useAuth } from "./AuthContext";
import { backendFarmsToProfile, listFarms, syncProfileToBackend } from "../lib/farmSync";

const STORAGE_KEY = "terrasync-farm-profile";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface FarmContextValue {
  profile: FarmProfile | null;
  setProfile: (profile: FarmProfile) => void;
  updateProfile: (patch: Partial<Omit<FarmProfile, "version" | "crops">>) => void;
  addCrop: (crop: Omit<FarmCropRecord, "id">) => void;
  updateCrop: (id: string, patch: Partial<Omit<FarmCropRecord, "id">>) => void;
  removeCrop: (id: string) => void;
  clearProfile: () => void;
  /** Push a profile (defaults to the current one) to the signed-in farmer's
   *  backend farm records. Pass the just-built profile explicitly right after
   *  calling setProfile, since React state updates aren't synchronous. */
  syncToBackend: (explicitProfile?: FarmProfile) => Promise<void>;
  syncStatus: SyncStatus;
  syncErrors: { cropId: string; message: string }[];
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncErrors, setSyncErrors] = useState<{ cropId: string; message: string }[]>([]);
  const { user, isAuthenticated } = useAuth();
  const hydratedForUser = useRef<string | null>(null);

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

  async function syncToBackend(explicitProfile?: FarmProfile) {
    const target = explicitProfile ?? profile;
    if (!isAuthenticated || !user || user.role !== "farmer" || !target) return;
    setSyncStatus("syncing");
    try {
      const { crops, errors } = await syncProfileToBackend(target);
      const next = { ...target, crops, syncedUserId: user.id };
      setProfileState(next);
      persist(next);
      setSyncErrors(errors);
      setSyncStatus(errors.length > 0 ? "error" : "synced");
    } catch {
      setSyncStatus("error");
    }
  }

  // A signed-in farmer's backend records are authoritative for their account.
  // On sign-in: if this profile was synced to a *different* account (shared
  // device), drop it rather than show one farmer's data to another. Then, if
  // there's no local profile at all, pull the farmer's saved records — this
  // only ever reads and replaces an *empty* local state, never a local draft
  // the farmer hasn't pushed yet.
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "farmer") return;
    if (hydratedForUser.current === user.id) return;
    hydratedForUser.current = user.id;

    if (profile?.syncedUserId && profile.syncedUserId !== user.id) {
      clearProfile();
    }

    if (!profile || profile.crops.length === 0) {
      listFarms()
        .then((farms) => {
          const hydrated = backendFarmsToProfile(farms, user.id);
          if (hydrated) setProfile(hydrated);
        })
        .catch(() => {
          // Backend unreachable or no saved farms; keep using local state.
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      updateProfile,
      addCrop,
      updateCrop,
      removeCrop,
      clearProfile,
      syncToBackend,
      syncStatus,
      syncErrors,
    }),
    [profile, syncStatus, syncErrors],
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}
