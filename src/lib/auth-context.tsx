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
  type User,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api";

// In-memory token store (not localStorage for security)
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

function setAccessToken(token: string | null) {
  accessToken = token;
  // Set a flag cookie so middleware can detect auth state (no secret data)
  if (token) {
    Cookies.set("auth_flag", "1", { sameSite: "lax" });
  } else {
    Cookies.remove("auth_flag");
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Fetch user profile after obtaining an access token
  const fetchUser = useCallback(async (token: string) => {
    const userData = await getMe(token);
    setUser(userData);
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
        setIsLoading(false);
      }
    }
    init();
  }, [fetchUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    setAccessToken(data.accessToken);
    await fetchUser(data.accessToken);
  }, [fetchUser]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    setAccessToken(data.accessToken);
    await fetchUser(data.accessToken);
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setAccessToken(null);
      setUser(null);
      // Clear Apollo cache to prevent stale authenticated data from leaking
      const { default: apolloClient } = await import("@/lib/apollo-client");
      await apolloClient.resetStore().catch(() => {});
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout }}
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
