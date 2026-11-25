import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getAuthToken } from "../lib/api";
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
  const { user } = useAuth();
  return <FarmProviderForUser key={user?.id ?? "guest"} userId={user?.role === "farmer" ? user.id : null}>{children}</FarmProviderForUser>;
}

function FarmProviderForUser({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [profile, setProfileState] = useState<FarmProfile | null>(() => userId || getAuthToken() ? null : readStoredProfile());
  const [ready, setReady] = useState(!userId);
  const [error, setError] = useState("");
  const queue = useRef(Promise.resolve());

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const token = getAuthToken();
    fetch('/api/v1/farms/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => { if (!response.ok) throw new Error('Unable to load your farm profile.'); return response.json(); })
      .then((data) => { if (active) { setProfileState(data.profile); setReady(true); } })
      .catch(() => { if (active) setError('Unable to load your farm profile. Please refresh and try again.'); });
    return () => { active = false; };
  }, [userId]);

  function save(next: FarmProfile | null) {
    if (!userId) { persist(next); return; }
    const token = getAuthToken();
    queue.current = queue.current.catch(() => {}).then(async () => {
      const response = await fetch('/api/v1/farms/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ profile: next }) });
      if (!response.ok) throw new Error('Save failed');
      setError('');
    }).catch(() => { setError('Your farm changes could not be saved. Please try again.'); });
  }

  const setProfile = (next: FarmProfile) => {
    setProfileState(next);
    save(next);
  };

  const updateProfile = (patch: Partial<Omit<FarmProfile, "version" | "crops">>) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      save(next);
      return next;
    });
  };

  const addCrop = (crop: Omit<FarmCropRecord, "id">) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, crops: [...current.crops, { ...crop, id: generateId(crop.cropId) }] };
      save(next);
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
      save(next);
      return next;
    });
  };

  const removeCrop = (id: string) => {
    setProfileState((current) => {
      if (!current) return current;
      const next = { ...current, crops: current.crops.filter((crop) => crop.id !== id) };
      save(next);
      return next;
    });
  };

  const clearProfile = () => {
    setProfileState(null);
    save(null);
  };

  const value = useMemo(
    () => ({ profile, setProfile, updateProfile, addCrop, updateCrop, removeCrop, clearProfile }),
    [profile],
  );

  return <FarmContext.Provider value={value}>{error && <div role="alert">{error}</div>}{ready ? children : !error && <div>Loading your farm profile…</div>}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}
