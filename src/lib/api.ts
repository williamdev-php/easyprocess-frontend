const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (() => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    console.error("NEXT_PUBLIC_API_URL is not set — API requests will fail");
  }
  return "http://localhost:8000";
})();

// ---------------------------------------------------------------------------
// Case conversion helpers
// ---------------------------------------------------------------------------

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeys<T>(obj: unknown, converter: (key: string) => string): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeys(item, converter)) as T;
  }
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        converter(key),
        convertKeys(value, converter),
      ])
    ) as T;
  }
  return obj as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
  orgNumber?: string;
  phone?: string;
  locale?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  /** Token lifetime in seconds (if provided by the server). */
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  orgNumber?: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  locale: string;
  role: string;
  isSuperuser: boolean;
  isActive: boolean;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

const REQUEST_TIMEOUT_MS = 15_000;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const detail = body.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? detail.map((e: { msg?: string }) => (e.msg ?? "").replace(/^Value error, /i, "")).filter(Boolean).join(". ")
            : body.message || `Request failed: ${res.status}`;
      throw new Error(message);
    }

    if (res.status === 204) return {} as T;

    const data = await res.json();
    return convertKeys<T>(data, toCamelCase);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export function registerUser(payload: RegisterPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(convertKeys(payload, toSnakeCase)),
  });
}

export function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(convertKeys(payload, toSnakeCase)),
  });
}

export function forgotPassword(email: string): Promise<void> {
  return request<void>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string): Promise<void> {
  return request<void>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export function logoutUser(): Promise<void> {
  return request<void>("/api/auth/logout", {
    method: "POST",
  });
}

export function refreshToken(): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/refresh", {
    method: "POST",
  });
}

export function getMe(token: string): Promise<User> {
  return request<User>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function googleAuth(code: string, redirectUri: string, locale?: string): Promise<TokenResponse> {
  return request<TokenResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri: redirectUri, locale }),
  });
}

// ---------------------------------------------------------------------------
// Newsletter API
// ---------------------------------------------------------------------------

export interface NewsletterSubscribePayload {
  email: string;
  locale: string;
  source?: string;
}

export function subscribeNewsletter(
  payload: NewsletterSubscribePayload
): Promise<{ ok: boolean; message: string }> {
  return request<{ ok: boolean; message: string }>("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(convertKeys(payload, toSnakeCase)),
  });
}

// ---------------------------------------------------------------------------
// Google Search Console API
// ---------------------------------------------------------------------------

export interface GscConnectionResponse {
  connected: boolean;
  googleEmail?: string;
  indexedDomain?: string;
  indexedAt?: string;
  status?: string;
}

export interface GscIndexResponse {
  siteAdded: boolean;
  sitemapSubmitted: boolean;
  domain: string;
}

export function connectGsc(code: string, redirectUri: string, token: string): Promise<GscConnectionResponse> {
  return request<GscConnectionResponse>("/api/gsc/connect", {
    method: "POST",
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getGscStatus(token: string): Promise<GscConnectionResponse> {
  return request<GscConnectionResponse>("/api/gsc/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function disconnectGsc(token: string): Promise<{ disconnected: boolean }> {
  return request<{ disconnected: boolean }>("/api/gsc/disconnect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function triggerGscIndex(token: string): Promise<GscIndexResponse> {
  return request<GscIndexResponse>("/api/gsc/index", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
