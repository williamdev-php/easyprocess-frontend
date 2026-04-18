"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const VIEWER_URL =
  process.env.NEXT_PUBLIC_VIEWER_URL ?? "http://localhost:3001";
const DRAFT_LIFETIME_DAYS = 45;

interface ClaimInfo {
  siteId: string;
  subdomain: string | null;
  logoUrl: string | null;
  businessName: string;
  tagline: string;
  industry: string | null;
  headline: string;
  description: string;
  createdAt: string | null;
  colors: { primary?: string; secondary?: string; accent?: string };
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-deep" />
        </div>
      }
    >
      <ClaimPageInner />
    </Suspense>
  );
}

function ClaimPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("claim");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t("invalidLink"));
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/sites/claim/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || t("invalidLink"));
        }
        return res.json();
      })
      .then((data) => {
        setClaimInfo({
          siteId: data.site_id,
          subdomain: data.subdomain,
          logoUrl: data.logo_url,
          businessName: data.business_name,
          tagline: data.tagline,
          industry: data.industry,
          headline: data.headline,
          description: data.description,
          createdAt: data.created_at,
          colors: data.colors || {},
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, t]);

  const daysRemaining = useMemo(() => {
    if (!claimInfo?.createdAt) return DRAFT_LIFETIME_DAYS;
    const created = new Date(claimInfo.createdAt);
    const expires = new Date(
      created.getTime() + DRAFT_LIFETIME_DAYS * 24 * 60 * 60 * 1000
    );
    return Math.max(
      0,
      Math.ceil((expires.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );
  }, [claimInfo?.createdAt]);

  async function handleClaim() {
    if (!token) return;
    setClaiming(true);
    try {
      const { getAccessToken } = await import("@/lib/auth-context");
      const accessToken = getAccessToken();
      const res = await fetch(`${API_URL}/api/sites/claim/${token}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || t("claimFailed"));
      }
      setClaimed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("claimFailed"));
    } finally {
      setClaiming(false);
    }
  }

  const previewUrl = claimInfo?.subdomain
    ? `${VIEWER_URL}/preview/${claimInfo.siteId}`
    : null;

  const primaryColor = claimInfo?.colors?.primary || "#2563eb";

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary-deep" />
      </div>
    );
  }

  if (error && !claimInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t("linkExpired")}</h1>
          <p className="mt-2 text-gray-500">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-primary-deep px-6 py-3 font-semibold text-white transition hover:bg-primary-deep/90"
          >
            {t("goHome")}
          </Link>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{t("claimedTitle")}</h1>
          <p className="mt-2 text-gray-500">{t("claimedMessage")}</p>
          <Link
            href="/dashboard/pages"
            className="mt-6 inline-block rounded-xl bg-primary-deep px-6 py-3 font-semibold text-white transition hover:bg-primary-deep/90"
          >
            {t("goToDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <Image
              src="/logo-petrol-blue.png"
              alt="Qvicko"
              width={120}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="hidden sm:inline">{t("builtBy")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: Site info */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 space-y-6">
              {/* Site card */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div
                  className="px-6 py-8 text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
                >
                  {claimInfo?.logoUrl && (
                    <div className="mb-4">
                      <Image
                        src={claimInfo.logoUrl}
                        alt={claimInfo.businessName}
                        width={160}
                        height={50}
                        className="h-12 w-auto object-contain brightness-0 invert"
                        unoptimized
                      />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold">
                    {claimInfo?.businessName}
                  </h1>
                  {claimInfo?.tagline && (
                    <p className="mt-1 text-sm opacity-80">{claimInfo.tagline}</p>
                  )}
                </div>

                <div className="space-y-4 px-6 py-6">
                  {claimInfo?.industry && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18h16.5V3H3.75z" />
                      </svg>
                      {claimInfo.industry}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    {t("builtBy")}
                  </div>

                  {/* Timer */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t("expiresIn", { days: daysRemaining })}
                    </div>
                    <p className="mt-1 text-xs text-amber-600">
                      {t("expiresNote")}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <button
                    onClick={handleClaim}
                    disabled={claiming}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-deep px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-primary-deep/90 hover:shadow-xl disabled:opacity-60"
                  >
                    {claiming ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("claiming")}
                      </>
                    ) : (
                      <>
                        {t("claimButton")}
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <Link
                      href={`/register?claim=${token}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-deep px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-primary-deep/90 hover:shadow-xl"
                    >
                      {t("createAccount")}
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                    <Link
                      href={`/login?redirect=/claim?token=${token}`}
                      className="flex w-full items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary-deep"
                    >
                      {t("loginExisting")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded-lg bg-gray-100 px-3 py-1 text-center text-xs text-gray-400">
                  {claimInfo?.subdomain
                    ? `${claimInfo.subdomain}.qvickosite.com`
                    : "preview"}
                </div>
              </div>
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="h-[600px] w-full sm:h-[700px] lg:h-[800px]"
                  title={t("preview")}
                />
              ) : (
                <div className="flex h-[600px] items-center justify-center text-gray-400">
                  {t("previewUnavailable")}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
