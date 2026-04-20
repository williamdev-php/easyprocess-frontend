"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import { GET_ADMIN_SUBSCRIPTIONS, GET_ADMIN_SUBSCRIPTION_STATS } from "@/graphql/queries";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────── Skeleton ──────────────── */

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
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border-light px-4 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="hidden h-5 w-20 sm:block" />
            <Skeleton className="hidden h-5 w-28 md:block" />
            <Skeleton className="ml-auto h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Status config ──────────────── */

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  TRIALING: "bg-violet-100 text-violet-700",
  PAST_DUE: "bg-amber-100 text-amber-700",
  CANCELED: "bg-red-100 text-red-700",
  INCOMPLETE: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS = ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED", "INCOMPLETE"];

/* ──────────────── Helpers ──────────────── */

function formatSek(ore: number): string {
  return `${(ore / 100).toLocaleString("sv-SE")} kr`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ──────────────── Stats Cards ──────────────── */

function StatsCards() {
  const t = useTranslations("adminSubscriptions");
  const { data, loading } = useQuery<any>(GET_ADMIN_SUBSCRIPTION_STATS, {
    fetchPolicy: "cache-and-network",
  });
  const stats = data?.adminSubscriptionStats;

  const cards = [
    { label: t("totalSubscriptions"), value: stats?.totalSubscriptions ?? 0, color: "text-primary" },
    { label: t("active"), value: stats?.active ?? 0, color: "text-emerald-600" },
    { label: t("trialing"), value: stats?.trialing ?? 0, color: "text-violet-600" },
    { label: t("pastDue"), value: stats?.pastDue ?? 0, color: "text-amber-600" },
    { label: t("canceled"), value: stats?.canceled ?? 0, color: "text-red-600" },
    { label: t("incomplete"), value: stats?.incomplete ?? 0, color: "text-gray-500" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
          <span className="text-sm font-medium text-text-muted">{card.label}</span>
          <div className={`mt-2 text-2xl font-bold text-primary-deep`}>
            {loading ? <Skeleton className="h-8 w-12" /> : <span className={card.color}>{card.value}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function SubscriptionsPage() {
  const t = useTranslations("adminSubscriptions");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Redirect non-superusers
  if (!authLoading && (!user || !user.isSuperuser)) {
    router.push("/dashboard");
    return null;
  }

  const { data, loading } = useQuery<any>(GET_ADMIN_SUBSCRIPTIONS, {
    variables: {
      filter: {
        page,
        pageSize: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
    },
    skip: !user?.isSuperuser,
    fetchPolicy: "cache-and-network",
  });

  const subs = data?.adminSubscriptions?.items || [];
  const total = data?.adminSubscriptions?.total || 0;
  const totalPages = Math.ceil(total / 20);

  if (authLoading || (loading && subs.length === 0)) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      <StatsCards />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border-light bg-white px-3 py-2 text-sm text-primary-deep focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{t("allStatuses")}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{t(s === "PAST_DUE" ? "pastDue" : s.toLowerCase() as any)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-primary-deep/[0.02]">
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("user")}</th>
              <th className="px-4 py-3 text-center font-semibold text-primary-deep">{t("status")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep md:table-cell">{t("period")}</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-primary-deep sm:table-cell">{t("totalPaid")}</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-primary-deep lg:table-cell">{t("created")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && subs.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 mx-auto" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-36" /></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">{t("noSubscriptions")}</td>
              </tr>
            ) : (
              subs.map((sub: any) => (
                <tr
                  key={sub.id}
                  className="border-b border-border-light transition-colors hover:bg-primary-deep/[0.02] cursor-pointer"
                  onClick={() => router.push(`/dashboard/subscriptions/${sub.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-deep/10 text-sm font-semibold text-primary-deep">
                        {(sub.userName?.[0] || sub.userEmail?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-primary-deep">{sub.userName || "—"}</p>
                        <p className="text-xs text-text-muted">{sub.userEmail || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[sub.status] || STATUS_COLORS.INCOMPLETE}`}>
                      {t(sub.status === "PAST_DUE" ? "pastDue" : sub.status.toLowerCase() as any)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-text-muted whitespace-nowrap md:table-cell">
                    {sub.currentPeriodStart && sub.currentPeriodEnd
                      ? `${formatDate(sub.currentPeriodStart)} — ${formatDate(sub.currentPeriodEnd)}`
                      : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-medium text-primary-deep whitespace-nowrap sm:table-cell">
                    {formatSek(sub.totalPaidSek)}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-text-muted lg:table-cell">
                    {formatDate(sub.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border-light px-4 py-3">
            <span className="text-xs text-text-muted">
              {t("showing", { from: (page - 1) * 20 + 1, to: Math.min(page * 20, total), total })}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg px-3 py-1 text-sm text-text-secondary hover:bg-primary-deep/5 disabled:opacity-40"
              >
                &laquo;
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-1 text-sm text-text-secondary hover:bg-primary-deep/5 disabled:opacity-40"
              >
                &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
