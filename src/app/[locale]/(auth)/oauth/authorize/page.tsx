"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import Image from "next/image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface OAuthClient {
  client_id: string;
  name: string;
  allowed_scopes: string[];
}

interface QvickoSite {
  id: string;
  subdomain: string;
  business_name: string;
  status: string;
  domain: string | null;
  blog_app_installed: boolean;
}

type Step = "loading" | "login_required" | "select_site" | "error";

export default function OAuthAuthorizePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const t = useTranslations("oauth");
  const locale = useLocale();
  const router = useRouter();

  const clientId = searchParams.get("client_id") || "";
  const redirectUri = searchParams.get("redirect_uri") || "";
  const scope = searchParams.get("scope") || "";
  const state = searchParams.get("state") || "";

  const [step, setStep] = useState<Step>("loading");
  const [client, setClient] = useState<OAuthClient | null>(null);
  const [sites, setSites] = useState<QvickoSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [authorizing, setAuthorizing] = useState(false);
  const [error, setError] = useState("");

  // Fetch client info
  useEffect(() => {
    if (!clientId) {
      setError("Missing client_id parameter");
      setStep("error");
      return;
    }
    fetch(`${API_URL}/api/oauth/client/${clientId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unknown application");
        return r.json();
      })
      .then((data) => setClient(data))
      .catch((err) => {
        setError(err.message);
        setStep("error");
      });
  }, [clientId]);

  // After auth is resolved + client loaded, decide step
  useEffect(() => {
    if (!client || authLoading) return;
    if (!isAuthenticated) {
      setStep("login_required");
      return;
    }
    // Fetch sites
    const token = getAccessToken();
    if (!token) {
      setStep("login_required");
      return;
    }
    fetch(`${API_URL}/api/oauth/sites`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load sites");
        return r.json();
      })
      .then((data) => {
        setSites(data.sites || []);
        setStep("select_site");
      })
      .catch((err) => {
        setError(err.message);
        setStep("error");
      });
  }, [client, authLoading, isAuthenticated]);

  const handleAuthorize = useCallback(async () => {
    if (!selectedSite || authorizing) return;
    setAuthorizing(true);
    setError("");

    const token = getAccessToken();
    if (!token) {
      setStep("login_required");
      return;
    }

    try {
      const scopes = scope.split(/[+\s,]/).filter(Boolean);
      const res = await fetch(`${API_URL}/api/oauth/authorize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          client_id: clientId,
          site_id: selectedSite,
          scopes,
          redirect_uri: redirectUri,
          state: state || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Authorization failed");
      }

      const data = await res.json();
      // Redirect back to the app with the authorization code
      const sep = redirectUri.includes("?") ? "&" : "?";
      const params = new URLSearchParams({ code: data.code });
      if (data.state) params.set("state", data.state);
      window.location.href = `${redirectUri}${sep}${params.toString()}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authorization failed");
      setAuthorizing(false);
    }
  }, [selectedSite, authorizing, scope, clientId, redirectUri, state]);

  const handleDeny = () => {
    const sep = redirectUri.includes("?") ? "&" : "?";
    window.location.href = `${redirectUri}${sep}error=access_denied&state=${encodeURIComponent(state)}`;
  };

  const scopeLabels: Record<string, string> = {
    "blog:read": t("scopeBlogRead"),
    "blog:write": t("scopeBlogWrite"),
  };

  const requestedScopes = scope.split(/[+\s,]/).filter(Boolean);
  const selectedSiteObj = sites.find((s) => s.id === selectedSite);

  // ---------- Login Required ----------
  if (step === "login_required") {
    const returnUrl = `/oauth/authorize?${searchParams.toString()}`;
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t("loginRequired")}
        </h1>
        <p className="text-muted-foreground">
          {t("loginRequiredDescription", { app: client?.name || clientId })}
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          {t("loginButton")}
        </Link>
      </div>
    );
  }

  // ---------- Error ----------
  if (step === "error") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{t("errorTitle")}</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // ---------- Loading ----------
  if (step === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // ---------- Select Site & Authorize ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t("authorizeTitle", { app: client?.name || clientId })}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("authorizeDescription", { app: client?.name || clientId })}
        </p>
      </div>

      {/* Requested permissions */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">
          {t("requestedPermissions")}
        </p>
        <ul className="space-y-2">
          {requestedScopes.map((s) => (
            <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="h-4 w-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {scopeLabels[s] || s}
            </li>
          ))}
        </ul>
      </div>

      {/* Site selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          {t("selectSite")}
        </label>

        {sites.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center">
            <p className="text-sm text-muted-foreground">{t("noSites")}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sites.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => setSelectedSite(site.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selectedSite === site.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface hover:border-primary/40"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  selectedSite === site.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {site.business_name || site.subdomain}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {site.domain || site.subdomain}
                  </p>
                </div>
                {selectedSite === site.id && (
                  <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Blog app warning */}
      {selectedSiteObj && !selectedSiteObj.blog_app_installed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <svg className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {t("blogAppNotInstalled")}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {t("blogAppNotInstalledDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDeny}
          className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          {t("deny")}
        </button>
        <button
          type="button"
          onClick={handleAuthorize}
          disabled={!selectedSite || authorizing}
          className="flex-1 h-11 rounded-xl bg-primary text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authorizing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("authorizing")}
            </span>
          ) : (
            t("authorize")
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      {/* Logged in as */}
      {user && (
        <p className="text-xs text-muted-foreground text-center">
          {t("loggedInAs", { email: user.email })}
        </p>
      )}
    </div>
  );
}
