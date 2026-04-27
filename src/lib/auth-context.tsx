"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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

  // Holds the cleanup function for the proactive refresh timer
  const refreshTimerCleanupRef = useRef<(() => void) | null>(null);

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

  // Schedule a proactive token refresh before expiry.  Call after every
  // successful token acquisition.  Returns a cleanup function.
  const scheduleProactiveRefresh = useCallback((expiresIn?: number) => {
    // Default to 15 minutes if the server didn't tell us.
    const ttlMs = (expiresIn ?? 900) * 1000;
    // Refresh 5 minutes before expiry (but at least 30 s from now).
    const refreshIn = Math.max(ttlMs - 5 * 60 * 1000, 30_000);
    const timer = setTimeout(async () => {
      try {
        const data = await refreshToken();
        setAccessToken(data.accessToken);
        await fetchUser(data.accessToken);
        // Re-schedule after a successful refresh
        scheduleProactiveRefresh(data.expiresIn);
      } catch {
        // Refresh failed — force logout so the user can re-authenticate.
        forceLogout();
      }
    }, refreshIn);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  // Try to refresh token on mount with retry logic for slow networks
  useEffect(() => {
    let cancelled = false;
    let cleanupRefreshTimer: (() => void) | undefined;

    async function attemptRefresh(): Promise<{ accessToken: string; expiresIn?: number }> {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth refresh timeout")), 30_000),
      );
      return Promise.race([refreshToken(), timeout]);
    }

    async function init() {
      const MAX_RETRIES = 2;
      let lastError: unknown;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          const data = await attemptRefresh();
          if (cancelled) return;
          setAccessToken(data.accessToken);
          await fetchUser(data.accessToken);
          cleanupRefreshTimer = scheduleProactiveRefresh(data.expiresIn);
          return; // success
        } catch (err) {
          lastError = err;
          // Only retry on timeout / network errors, not on auth rejection (4xx)
          const isTimeout = err instanceof Error && err.message === "Auth refresh timeout";
          const isNetworkError = err instanceof TypeError; // fetch network failure
          if ((isTimeout || isNetworkError) && attempt < MAX_RETRIES) {
            // Exponential back-off: 2s, 4s
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          break;
        }
      }

      // All attempts exhausted — clear auth state
      if (!cancelled) {
        setAccessToken(null);
        setUser(null);
      }
    }

    init().finally(() => {
      _authInitializing = false;
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      cleanupRefreshTimer?.();
    };
  }, [fetchUser, scheduleProactiveRefresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    refreshTimerCleanupRef.current?.();
    refreshTimerCleanupRef.current = scheduleProactiveRefresh(data.expiresIn);
    trackEvent("login");
    identifyUser(me.id);
  }, [scheduleProactiveRefresh]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    refreshTimerCleanupRef.current?.();
    refreshTimerCleanupRef.current = scheduleProactiveRefresh(data.expiresIn);
    trackEvent("signup");
    identifyUser(me.id);
  }, [scheduleProactiveRefresh]);

  const loginWithGoogle = useCallback(async (code: string, redirectUri: string, locale?: string) => {
    const data = await googleAuth(code, redirectUri, locale);
    setAccessToken(data.accessToken);
    const me = await getMe(data.accessToken);
    setUser(me);
    setSuperuserFlag(me.isSuperuser);
    refreshTimerCleanupRef.current?.();
    refreshTimerCleanupRef.current = scheduleProactiveRefresh(data.expiresIn);
    trackEvent("login");
    identifyUser(me.id);
  }, [scheduleProactiveRefresh]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      refreshTimerCleanupRef.current?.();
      refreshTimerCleanupRef.current = null;
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
