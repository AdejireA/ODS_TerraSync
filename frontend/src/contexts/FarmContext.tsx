import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getFarmProfile, putFarmProfile } from "../lib/api";
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
  /** Set when the most recent save to the account failed (profile is still kept locally). */
  saveError: string;
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

function persistLocal(profile: FarmProfile | null) {
  try {
    if (profile) localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

// A signed-in farmer's profile lives server-side as one JSON blob
// (GET/PUT /farms/profile) instead of localStorage. Remounting this
// component per user id (see FarmProvider below) is what keeps one
// farmer's data from leaking into another's session on a shared device —
// each sign-in starts a fresh provider instance with its own state.
function FarmProviderForUser({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [profile, setProfileState] = useState<FarmProfile | null>(() => (userId ? null : readStoredProfile()));
  const [ready, setReady] = useState(!userId);
  const [saveError, setSaveError] = useState("");
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (!userId) return;
    let active = true;
    getFarmProfile<FarmProfile>()
      .then((data) => {
        if (active) {
          setProfileState(data.profile);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setSaveError("Unable to load your farm profile. Please refresh and try again.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  function save(next: FarmProfile | null) {
    if (!userId) {
      persistLocal(next);
      return;
    }
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(async () => {
        await putFarmProfile(next);
        setSaveError("");
      })
      .catch(() => {
        setSaveError("Your farm changes could not be saved. Please try again.");
      });
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
    () => ({ profile, setProfile, updateProfile, addCrop, updateCrop, removeCrop, clearProfile, saveError }),
    [profile, saveError],
  );

  if (userId && !ready && !saveError) {
    return <div className="app-container py-section text-center text-sm text-muted-foreground">Loading your farm profile…</div>;
  }

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.role === "farmer" ? user.id : null;
  return (
    <FarmProviderForUser key={userId ?? "guest"} userId={userId}>
      {children}
    </FarmProviderForUser>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}
