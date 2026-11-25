import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ApiError,
  AUTH_EXPIRED_EVENT,
  getAuthToken,
  getCurrentUser,
  loginAccount,
  registerAccount,
  setAuthToken,
  type PublicUser,
  type Role,
} from "../lib/api";

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** Set once an in-session request was rejected for an expired/invalid token. */
  sessionExpired: boolean;
  register: (input: { phone: string; pin: string; name?: string; language?: "en" | "yo"; role?: Role; coordinatorCode?: string }) => Promise<void>;
  login: (input: { phone: string; pin: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  async function register(input: { phone: string; pin: string; name?: string; language?: "en" | "yo"; role?: Role; coordinatorCode?: string }) {
    setLoading(true);
    try {
      const session = await registerAccount({
        phone: input.phone,
        pin: input.pin,
        name: input.name,
        language: input.language,
        role: input.role,
        coordinator_code: input.coordinatorCode,
      });
      setAuthToken(session.access_token);
      setUser(session.user);
      setSessionExpired(false);
    } finally {
      setLoading(false);
    }
  }

  async function login(input: { phone: string; pin: string }) {
    setLoading(true);
    try {
      const session = await loginAccount(input);
      setAuthToken(session.access_token);
      setUser(session.user);
      setSessionExpired(false);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
    setSessionExpired(false);
  }

  async function refreshUser() {
    if (!getAuthToken()) {
      setUser(null);
      return;
    }
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthToken(null);
        setUser(null);
      }
    }
  }

  useEffect(() => {
    void refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onExpired() {
      setUser(null);
      setSessionExpired(true);
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, loading, sessionExpired, register, login, logout, refreshUser }),
    [user, loading, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
