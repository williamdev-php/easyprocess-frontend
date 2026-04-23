"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { useSiteContext } from "@/lib/site-context";
import { MY_DOMAINS, MY_GSC_CONNECTION } from "@/graphql/queries";
import { getAccessToken } from "@/lib/auth-context";
import { connectGsc, disconnectGsc, triggerGscIndex } from "@/lib/api";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export default function SeoPage() {
  const t = useTranslations("seoPage");
  const { siteId } = useSiteContext();
  const [loading, setLoading] = useState(false);

  const { data: domainsData } = useQuery<{
    myDomains: Array<{ id: string; domain: string; status: string; verifiedAt: string | null; siteId: string | null }>;
  }>(MY_DOMAINS, { fetchPolicy: "cache-and-network" });

  const { data: gscData, refetch: refetchGsc } = useQuery<{
    myGscConnection: {
      connected: boolean;
      googleEmail: string | null;
      indexedDomain: string | null;
      indexedAt: string | null;
      status: string | null;
    };
  }>(MY_GSC_CONNECTION, { fetchPolicy: "cache-and-network" });

  const gsc = gscData?.myGscConnection;
  const connected = !!gsc?.connected;

  // Find verified domain linked to this site, or any verified domain
  const siteVerifiedDomain = domainsData?.myDomains?.find(
    (d) => d.verifiedAt && d.siteId === siteId
  );
  const anyVerifiedDomain = domainsData?.myDomains?.find((d) => d.verifiedAt);
  const verifiedDomain = siteVerifiedDomain || anyVerifiedDomain;
  const hasVerifiedDomain = !!verifiedDomain;

  const domainName = verifiedDomain?.domain ?? gsc?.indexedDomain;

  const handleConnect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      "gsc-connect",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) return;
    setLoading(true);

    const interval = setInterval(async () => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          setLoading(false);
          return;
        }
        const url = popup.location.href;
        if (url && url.includes("code=")) {
          const searchParams = new URL(url).searchParams;
          const code = searchParams.get("code");
          popup.close();
          clearInterval(interval);
          if (code) {
            try {
              const token = getAccessToken();
              if (token) {
                await connectGsc(code, redirectUri, token);
                refetchGsc();
              }
            } catch (err) {
              console.error("GSC connect failed:", err);
            }
          }
          setLoading(false);
        }
      } catch {
        // Cross-origin — popup hasn't redirected back yet
      }
    }, 200);
  }, [refetchGsc]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (token) {
        await disconnectGsc(token);
        refetchGsc();
      }
    } catch (err) {
      console.error("GSC disconnect failed:", err);
    } finally {
      setLoading(false);
    }
  }, [refetchGsc]);

  const handleReindex = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (token) {
        await triggerGscIndex(token);
        refetchGsc();
      }
    } catch (err) {
      console.error("GSC re-index failed:", err);
    } finally {
      setLoading(false);
    }
  }, [refetchGsc]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-primary-deep">{t("title")}</h1>
        <p className="mt-1 text-sm text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Google Search Console */}
      <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-border-light">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-primary-deep">{t("gscSection")}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${connected ? "text-emerald-600" : "text-text-muted"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-gray-300"}`} />
                {connected ? t("connected") : t("notConnected")}
              </span>
            </div>
          </div>

          {connected && (
            <div className="flex gap-2">
              <button
                onClick={handleReindex}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-primary-deep transition hover:bg-primary-deep/5 disabled:opacity-50"
              >
                {loading ? t("reindexing") : t("reindex")}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {t("disconnect")}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-text-muted leading-relaxed">
          {t("gscDescription")}
        </p>

        {/* Connected state */}
        {connected && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 space-y-2">
            {gsc?.googleEmail && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("connectedAs", { email: "" })}</span>
                <span className="text-xs font-medium text-primary-deep">{gsc.googleEmail}</span>
              </div>
            )}
            {gsc?.indexedDomain && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("indexedDomain")}</span>
                <span className="text-xs font-medium text-primary-deep">{gsc.indexedDomain}</span>
              </div>
            )}
            {gsc?.indexedAt && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("indexedAt")}</span>
                <span className="text-xs font-medium text-text-secondary">
                  {new Date(gsc.indexedAt).toLocaleDateString("sv-SE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Not connected state */}
        {!connected && (
          <div className="mt-4">
            {hasVerifiedDomain ? (
              <>
                {/* What happens */}
                <div className="rounded-xl bg-primary-deep/[0.03] border border-border-light p-4 mb-4">
                  <p className="text-xs font-semibold text-primary-deep mb-2">{t("whatHappens")}</p>
                  <ol className="space-y-1.5 text-xs text-text-muted">
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-deep/10 text-[10px] font-bold text-primary-deep">1</span>
                      {t("step1")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-deep/10 text-[10px] font-bold text-primary-deep">2</span>
                      {t("step2")}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary-deep/10 text-[10px] font-bold text-primary-deep">3</span>
                      {t("step3")}
                    </li>
                  </ol>
                </div>

                <button
                  onClick={handleConnect}
                  disabled={loading || !GOOGLE_CLIENT_ID}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-primary-deep px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {loading ? t("connecting") : t("connect")}
                </button>
              </>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-700">{t("needsDomain")}</p>
                <Link
                  href="/dashboard/domain"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors"
                >
                  {t("goToDomains")}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sitemap info */}
      {domainName && (
        <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-primary-deep">{t("sitemapSection")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("sitemapDescription")}</p>
          <div className="mt-3 rounded-lg bg-gray-50 border border-border-light px-4 py-2.5">
            <code className="text-sm text-primary-deep">
              https://{domainName}/sitemap.xml
            </code>
          </div>
          <p className="mt-2 text-xs text-text-muted">{t("sitemapNote")}</p>
        </div>
      )}

      {/* Robots.txt info */}
      {domainName && (
        <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-primary-deep">{t("robotsSection")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("robotsDescription")}</p>
          <div className="mt-3 rounded-lg bg-gray-50 border border-border-light px-4 py-2.5">
            <code className="text-sm text-primary-deep">
              https://{domainName}/robots.txt
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
