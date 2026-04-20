"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import { GET_REVENUE_STATS } from "@/graphql/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Charge {
  id: string;
  amountSek: number;
  currency: string;
  status: string;
  description: string | null;
  customerEmail: string | null;
  customerName: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  createdAt: string;
}

interface RevenueStats {
  mrrSek: number;
  totalRevenueSek: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  chargesCount: number;
  refundedSek: number;
  recentCharges: Charge[];
}

// ---------------------------------------------------------------------------
// Skeleton (shimmer)
// ---------------------------------------------------------------------------

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <div className="border-b border-border-light bg-primary-deep/[0.02] px-4 py-3 flex gap-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-36 hidden sm:block" />
          <Skeleton className="h-5 w-28 hidden md:block" />
          <Skeleton className="h-5 w-20 ml-auto" />
          <Skeleton className="h-5 w-20" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border-light px-4 py-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-36 hidden sm:block" />
            <Skeleton className="h-5 w-28 hidden md:block" />
            <Skeleton className="ml-auto h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  succeeded: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-600",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSek(ore: number): string {
  return `${(ore / 100).toLocaleString("sv-SE")} kr`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RevenuePage() {
  const t = useTranslations("revenue");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect non-superusers
  if (!authLoading && (!user || !user.isSuperuser)) {
    router.push("/dashboard");
    return null;
  }

  const { data, loading } = useQuery<any>(GET_REVENUE_STATS, {
    variables: { limit: 30 },
    skip: !user?.isSuperuser,
  });

  const stats: RevenueStats | null = data?.revenueStats ?? null;

  if (authLoading || (loading && !stats)) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label={t("mrr")}
          value={stats ? formatSek(stats.mrrSek) : "—"}
          loading={loading}
          icon={
            <svg className="h-[18px] w-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <MetricCard
          label={t("totalRevenue")}
          value={stats ? formatSek(stats.totalRevenueSek) : "—"}
          loading={loading}
          icon={
            <svg className="h-[18px] w-[18px] text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t("activeSubscriptions")}
          value={stats ? String(stats.activeSubscriptions) : "—"}
          loading={loading}
          icon={
            <svg className="h-[18px] w-[18px] text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t("trialingSubs")}
          value={stats ? String(stats.trialingSubscriptions) : "—"}
          loading={loading}
          icon={
            <svg className="h-[18px] w-[18px] text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label={t("refunded")}
          value={stats ? formatSek(stats.refundedSek) : "—"}
          loading={loading}
          icon={
            <svg className="h-[18px] w-[18px] text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          }
        />
      </div>

      {/* Charges Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-primary-deep/[0.02]">
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("date")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep sm:table-cell">{t("customer")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep md:table-cell">{t("card")}</th>
              <th className="px-4 py-3 text-right font-semibold text-primary-deep">{t("amount")}</th>
              <th className="px-4 py-3 text-center font-semibold text-primary-deep">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (!stats || stats.recentCharges.length === 0) ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-28" /></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Skeleton className="h-5 w-36" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-28" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 mx-auto" /></td>
                </tr>
              ))
            ) : !stats || stats.recentCharges.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">{t("noCharges")}</td>
              </tr>
            ) : (
              stats.recentCharges.map((ch) => (
                <tr key={ch.id} className="border-b border-border-light transition-colors hover:bg-primary-deep/[0.02]">
                  <td className="px-4 py-3 whitespace-nowrap text-text-muted">
                    {formatDate(ch.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="font-medium text-primary-deep">{ch.customerName || "—"}</p>
                    <p className="text-xs text-text-muted">{ch.customerEmail || "—"}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-text-muted whitespace-nowrap md:table-cell">
                    {ch.cardBrand && ch.cardLast4
                      ? `${ch.cardBrand.charAt(0).toUpperCase() + ch.cardBrand.slice(1)} •••• ${ch.cardLast4}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-primary-deep whitespace-nowrap">
                    {formatSek(ch.amountSek)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[ch.status] || STATUS_COLORS.pending}`}>
                      {t(ch.status === "succeeded" ? "succeeded" : ch.status === "failed" ? "failed" : ch.status === "refunded" ? "refundedStatus" : "pending")}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
  loading,
  icon,
}: {
  label: string;
  value: string;
  loading: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold text-primary-deep">
        {loading ? <Skeleton className="h-8 w-20" /> : value}
      </div>
    </div>
  );
}
