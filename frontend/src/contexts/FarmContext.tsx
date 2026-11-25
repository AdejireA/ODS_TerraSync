import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "terrasync-farm-profile";

export interface FarmProfile {
  farmName: string;
  state: string;
  lga: string;
  crops: string[];
}

interface FarmContextValue {
  profile: FarmProfile | null;
  setProfile: (profile: FarmProfile) => void;
  clearProfile: () => void;
}

const FarmContext = createContext<FarmContextValue | null>(null);

function readStoredProfile(): FarmProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as FarmProfile) : null;
  } catch {
    return null;
  }
}

export function FarmProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FarmProfile | null>(readStoredProfile);

  const setProfile = (next: FarmProfile) => {
    setProfileState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage failures
    }
  };

  const clearProfile = () => {
    setProfileState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  };

  const value = useMemo(() => ({ profile, setProfile, clearProfile }), [profile]);

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}
