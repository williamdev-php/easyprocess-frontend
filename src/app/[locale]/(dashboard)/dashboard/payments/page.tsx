"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth, getAccessToken } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES, GET_SITE_APPS } from "@/graphql/queries";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SiteItem {
  id: string;
  siteData: Record<string, unknown>;
  businessName: string | null;
}

interface InstalledApp {
  appSlug: string;
  appName: string;
  siteId: string;
  requiresPayments: boolean;
}

type ConnectStatus = "not_connected" | "pending" | "connected";

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function startOnboarding(siteId: string): Promise<string | null> {
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/api/payments/connect/onboard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ site_id: siteId }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? data.onboarding_url ?? null;
}

// ---------------------------------------------------------------------------
// Payment method brand SVG icons
// ---------------------------------------------------------------------------
function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path
        d="M19.5 21h-3l1.9-11.5h3L19.5 21zm7.8-11.2c-.6-.2-1.5-.5-2.7-.5-3 0-5 1.5-5 3.7 0 1.6 1.5 2.5 2.6 3 1.1.6 1.5 1 1.5 1.5 0 .8-1 1.2-1.8 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2 .6 3.4.6 3.2 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.3-2.5-3.1-1-.5-1.7-.9-1.7-1.4 0-.5.5-1 1.7-1 1 0 1.7.2 2.2.4l.3.1.5-2.4zm7.8-.3h-2.3c-.7 0-1.3.2-1.6 1L27 21h3.2l.6-1.7h3.9l.4 1.7H38L35.1 9.5zm-3 7.5l1.2-3.2.4-1.1.2 1 .7 3.3h-2.5zM16 9.5l-2.8 7.8-.3-1.5c-.5-1.7-2.2-3.6-4-4.5l2.7 9.7h3.2L19.2 9.5H16z"
        fill="white"
      />
      <path
        d="M11.5 9.5H6.8l-.1.3c3.8.9 6.3 3.2 7.3 5.9l-1-5.2c-.2-.7-.7-1-1.5-1z"
        fill="#F9A533"
      />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="19" cy="16" r="8" fill="#EB001B" />
      <circle cx="29" cy="16" r="8" fill="#F79E1B" />
      <path
        d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text
        x="24"
        y="18"
        textAnchor="middle"
        fill="white"
        fontSize="7"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        AMEX
      </text>
    </svg>
  );
}

function MaestroIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1" />
      <circle cx="19" cy="16" r="8" fill="#0099DF" />
      <circle cx="29" cy="16" r="8" fill="#ED1C2E" />
      <path
        d="M24 10.3a8 8 0 0 1 0 11.4 8 8 0 0 1 0-11.4z"
        fill="#6C6BBD"
      />
    </svg>
  );
}

function KlarnaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#FFB3C7" />
      <text
        x="24"
        y="19"
        textAnchor="middle"
        fill="#0A0B09"
        fontSize="9"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Klarna
      </text>
    </svg>
  );
}

function SwishIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none">
      <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1" />
      <path
        d="M16 10c4-2 8 2 12 0s4 6 0 8-8-2-12 0-4-6 0-8z"
        fill="url(#swish-gradient)"
        opacity="0.9"
      />
      <path
        d="M16 14c4-2 8 2 12 0s4 6 0 8-8-2-12 0-4-6 0-8z"
        fill="url(#swish-gradient2)"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="swish-gradient" x1="14" y1="10" x2="34" y2="18">
          <stop stopColor="#52B5AA" />
          <stop offset="1" stopColor="#3E8EDE" />
        </linearGradient>
        <linearGradient id="swish-gradient2" x1="14" y1="14" x2="34" y2="22">
          <stop stopColor="#3E8EDE" />
          <stop offset="1" stopColor="#52B5AA" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function PaymentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations("payments");

  // Fetch user's sites
  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    fetchPolicy: "cache-first",
  });
  const sites = sitesData?.mySites ?? [];

  // We need to find a site that has a payment-requiring app
  const [paymentSiteId, setPaymentSiteId] = useState<string | null>(null);

  // Check each site for payment apps
  const firstSiteId = sites[0]?.id ?? null;
  const { data: appsData } = useQuery<{ siteApps: InstalledApp[] }>(GET_SITE_APPS, {
    variables: { siteId: firstSiteId },
    skip: !firstSiteId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });
  const installedApps = appsData?.siteApps ?? [];

  useEffect(() => {
    const payApp = installedApps.find((app) => app.requiresPayments);
    if (payApp) {
      setPaymentSiteId(payApp.siteId || firstSiteId);
    }
  }, [installedApps, firstSiteId]);

  // Stripe connect status (simulated - would come from API)
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("not_connected");
  const [isOnboarding, setIsOnboarding] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!paymentSiteId) return;
    setIsOnboarding(true);
    try {
      const url = await startOnboarding(paymentSiteId);
      if (url) {
        window.location.href = url;
      } else {
        setConnectStatus("pending");
      }
    } catch {
      // silent
    } finally {
      setIsOnboarding(false);
    }
  }, [paymentSiteId]);

  const isConnected = connectStatus === "connected";

  const paymentMethods = [
    { name: "Visa", icon: <VisaIcon /> },
    { name: "Mastercard", icon: <MastercardIcon /> },
    { name: "American Express", icon: <AmexIcon /> },
    { name: "Maestro", icon: <MaestroIcon /> },
    { name: "Klarna", icon: <KlarnaIcon /> },
    { name: "Swish", icon: <SwishIcon /> },
  ];

  // Loading skeleton
  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="h-8 w-48 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
          <div className="mt-2 h-4 w-64 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
        </div>
        {/* Balance / connect card */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <div className="flex items-start gap-6">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-48 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-64 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              <div className="h-10 w-32 rounded-xl bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        </div>
        {/* Payment methods grid */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <div className="h-5 w-48 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 rounded-xl border border-border-light p-4">
                <div className="h-8 w-12 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
                <div className="h-4 w-16 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
        {/* Transaction table */}
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <div className="h-5 w-36 rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-full rounded bg-gradient-to-r from-border-light via-surface to-border-light bg-[length:200%_100%] animate-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-enter space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Section 1: Stripe Connect Status */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        {connectStatus === "not_connected" && (
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-deep">{t("connectTitle")}</h3>
              <p className="mt-1 text-sm text-text-muted">{t("connectDescription")}</p>
              <Button
                onClick={handleConnect}
                disabled={isOnboarding || !paymentSiteId}
                className="mt-4"
              >
                {isOnboarding ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )}
                {t("connectButton")}
              </Button>
            </div>
          </div>
        )}

        {connectStatus === "pending" && (
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-deep">{t("connectPending")}</h3>
              <p className="mt-1 text-sm text-text-muted">{t("connectDescription")}</p>
              <button
                onClick={handleConnect}
                disabled={isOnboarding}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-50"
              >
                {isOnboarding && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {t("connectPending")}
              </button>
            </div>
          </div>
        )}

        {connectStatus === "connected" && (
          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-50">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-700">{t("connected")}</h3>
              <p className="mt-1 text-sm text-text-muted">{t("connectedDescription")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Available Payment Methods */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="text-lg font-semibold text-primary-deep">{t("availableMethods")}</h3>
        <p className="mt-1 text-sm text-text-muted">{t("availableMethodsDescription")}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex flex-col items-center gap-3 rounded-xl border border-border-light bg-white p-4 transition-shadow hover:shadow-sm"
            >
              {method.icon}
              <span className="text-sm font-medium text-primary-deep">{method.name}</span>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t("available")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  {t("requiresConnection")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Transaction History */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="text-lg font-semibold text-primary-deep">{t("transactions")}</h3>

        {/* Table header */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-border-light text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <th className="pb-3 pr-4">{t("date")}</th>
                <th className="pb-3 pr-4">{t("amount")}</th>
                <th className="pb-3 pr-4">{t("fee")}</th>
                <th className="pb-3 pr-4">{t("net")}</th>
                <th className="pb-3">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-10 w-10 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    <p className="text-sm text-text-muted">{t("noTransactions")}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Upcoming Payouts */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="text-lg font-semibold text-primary-deep">{t("upcomingPayouts")}</h3>

        <div className="mt-4 flex flex-col items-center gap-2 py-8">
          <svg className="h-10 w-10 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-sm text-text-muted">{t("noPayouts")}</p>
        </div>
      </div>

      {/* Section 5: Platform Fee Info */}
      <div className="rounded-2xl border border-border-light bg-blue-50/50 p-5">
        <div className="flex items-start gap-3">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-primary-deep">{t("platformFee")}</h4>
            <p className="mt-0.5 text-sm text-text-muted">{t("platformFeeDescription")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
