"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "@/i18n/routing";
import { GET_ALL_USERS, GET_ADMIN_USER_STATS } from "@/graphql/queries";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border-light px-4 py-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="hidden h-5 w-48 sm:block" />
            <Skeleton className="hidden h-5 w-20 md:block" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Stats Cards ──────────────── */

function UserStatsCards() {
  const t = useTranslations("adminUsers");
  const { data, loading } = useQuery<any>(GET_ADMIN_USER_STATS, {
    fetchPolicy: "cache-and-network",
  });
  const stats = data?.adminUserStats;

  const cards = [
    {
      label: t("totalUsers"),
      value: stats?.totalUsers ?? 0,
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.16V14.82",
    },
    {
      label: t("activeUsers"),
      value: stats?.activeUsers ?? 0,
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: t("verifiedUsers"),
      value: stats?.verifiedUsers ?? 0,
      icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
    },
    {
      label: t("newUsers30d"),
      value: stats?.newUsers30d ?? 0,
      icon: "M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{card.label}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
              <svg className="h-[18px] w-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary-deep">
            {loading ? <Skeleton className="h-8 w-16" /> : card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function UsersPage() {
  const t = useTranslations("adminUsers");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, loading } = useQuery<any>(GET_ALL_USERS, {
    variables: {
      filter: {
        page,
        pageSize: 20,
        ...(search ? { search } : {}),
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const users = data?.allUsers?.items || [];
  const total = data?.allUsers?.total || 0;
  const totalPages = Math.ceil(total / 20);

  if (loading && users.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="animate-page-enter space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      <UserStatsCards />

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:w-72"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-primary-deep/[0.02]">
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("user")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep sm:table-cell">{t("email")}</th>
              <th className="hidden px-4 py-3 text-center font-semibold text-primary-deep md:table-cell">{t("sites")}</th>
              <th className="hidden px-4 py-3 text-center font-semibold text-primary-deep md:table-cell">{t("subscription")}</th>
              <th className="px-4 py-3 text-center font-semibold text-primary-deep">{t("status")}</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-primary-deep lg:table-cell">{t("joined")}</th>
            </tr>
          </thead>
          <tbody className="animate-stagger">
            {loading && users.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Skeleton className="h-5 w-44" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-8 mx-auto" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 mx-auto" /></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted">{t("noUsers")}</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr
                  key={u.id}
                  className="border-b border-border-light transition-colors hover:bg-primary-deep/[0.02] cursor-pointer"
                  onClick={() => router.push(`/dashboard/users/${u.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-deep/10 text-sm font-semibold text-primary-deep">
                        {u.fullName?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-primary-deep">{u.fullName || "—"}</p>
                        <p className="text-xs text-text-muted sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="text-text-secondary">{u.email}</p>
                    {u.companyName && <p className="text-xs text-text-muted">{u.companyName}</p>}
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <span className="font-medium text-primary-deep">{u.sitesCount}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.hasSubscription
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {u.hasSubscription ? t("active") : t("free")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {u.isVerified && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                          {t("verified")}
                        </span>
                      )}
                      {u.isSuperuser && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
                          Admin
                        </span>
                      )}
                      {!u.isActive && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                          {t("inactive")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-text-muted lg:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("sv-SE")}
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
