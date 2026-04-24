"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  getMe,
  googleAuth,
  type User,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api";
import { trackEvent, identifyUser } from "@/lib/tracking";

// In-memory token store (not localStorage for security)
let accessToken: string | null = null;

// True while the initial token refresh is in progress — prevents the Apollo
// error link from force-logging out the user before auth has had a chance to
// complete.
let _authInitializing = true;

// Callback set by AuthProvider so the error link can trigger logout without
// importing React hooks (avoids circular dependency).
let _forceLogoutCb: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function isAuthInitializing(): boolean {
  return _authInitializing;
}

let _forceLogoutInProgress = false;

export function forceLogout(): void {
  // Don't force logout while the initial token refresh is still running —
  // queries that fire before the token is available are expected to fail.
  if (_authInitializing) return;
  // Prevent re-entry: resetStore → refetch → error → forceLogout loop
  if (_forceLogoutInProgress) return;
  _forceLogoutInProgress = true;
  if (_forceLogoutCb) _forceLogoutCb();
  // Allow future logouts after a short delay (e.g. new session)
  setTimeout(() => { _forceLogoutInProgress = false; }, 2000);
}

function setAccessToken(token: string | null) {
  accessToken = token;
  // Set a flag cookie so middleware can detect auth state (no secret data)
  if (token) {
    Cookies.set("auth_flag", "1", { sameSite: "lax" });
  } else {
    Cookies.remove("auth_flag");
    Cookies.remove("su_flag");
  }
}

function setSuperuserFlag(isSuperuser: boolean) {
  if (isSuperuser) {
    Cookies.set("su_flag", "1", { sameSite: "lax" });
  } else {
    Cookies.remove("su_flag");
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (code: string, redirectUri: string, locale?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Register the force-logout callback so the Apollo error link can trigger it
  useEffect(() => {
    _forceLogoutCb = () => {
      setAccessToken(null);
      setUser(null);
      // Use clearStore (not resetStore) to avoid refetching queries without a
      // token, which would trigger the error link → forceLogout loop.
      import("@/lib/apollo-client").then((m) => m.default.clearStore().catch(() => {}));
    };
    return () => { _forceLogoutCb = null; };
  }, []);

  // Fetch user profile after obtaining an access token
  const fetchUser = useCallback(async (token: string) => {
    const userData = await getMe(token);
    setUser(userData);
    setSuperuserFlag(userData.isSuperuser);
  }, []);

  // Try to refresh token on mount (with timeout to prevent indefinite hang)
  useEffect(() => {
    async function init() {
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Auth refresh timeout")), 10_000),
        );
        const data = await Promise.race([refreshToken(), timeout]);
        setAccessToken(data.accessToken);
        await fetchUser(data.accessToken);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        _authInitializing = false;
        setIsLoading(false);
      }
    }
    init();
  }, [fetchUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    trackEvent("login");
    identifyUser(me.id);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    trackEvent("signup");
    identifyUser(me.id);
  }, []);

  const loginWithGoogle = useCallback(async (code: string, redirectUri: string, locale?: string) => {
    const data = await googleAuth(code, redirectUri, locale);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    trackEvent("login");
    identifyUser(me.id);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
      // Clear Apollo cache to prevent stale authenticated data from leaking.
      // Use clearStore (not resetStore) to avoid refetching without a token.
      const { default: apolloClient } = await import("@/lib/apollo-client");
      await apolloClient.clearStore().catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, loginWithGoogle, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
