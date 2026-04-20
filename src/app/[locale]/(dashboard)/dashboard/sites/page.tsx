"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { GET_ALL_SITES } from "@/graphql/queries";
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
      <div className="flex gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border-light px-4 py-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="hidden h-5 w-32 sm:block" />
            <Skeleton className="hidden h-5 w-20 md:block" />
            <Skeleton className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Status config ──────────────── */

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  PURCHASED: "bg-blue-100 text-blue-700",
  ARCHIVED: "bg-gray-100 text-gray-600",
  PAUSED: "bg-orange-100 text-orange-700",
};

/* ──────────────── Main Page ──────────────── */

export default function AdminSitesPage() {
  const t = useTranslations("adminSites");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data, loading } = useQuery<any>(GET_ALL_SITES, {
    variables: {
      filter: {
        page,
        pageSize: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(typeFilter === "lead" ? { isLeadSite: true } : {}),
        ...(typeFilter === "user" ? { isLeadSite: false } : {}),
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const sites = data?.allSites?.items || [];
  const total = data?.allSites?.total || 0;
  const totalPages = Math.ceil(total / 20);

  if (loading && sites.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Stats summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{t("totalSites")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
              <svg className="h-[18px] w-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary-deep">
            {loading ? <Skeleton className="h-8 w-16" /> : total}
          </div>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{t("leadSites")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100/80">
              <svg className="h-[18px] w-[18px] text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary-deep">
            {loading ? <Skeleton className="h-8 w-16" /> : sites.filter((s: any) => s.isLeadSite).length}
          </div>
        </div>
        <div className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{t("userSites")}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/80">
              <svg className="h-[18px] w-[18px] text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-primary-deep">
            {loading ? <Skeleton className="h-8 w-16" /> : sites.filter((s: any) => !s.isLeadSite).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:w-72"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border-theme bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t("allTypes")}</option>
          <option value="lead">{t("leadSitesOnly")}</option>
          <option value="user">{t("userSitesOnly")}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border-theme bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t("allStatuses")}</option>
          {Object.keys(STATUS_COLORS).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light bg-primary-deep/[0.02]">
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("site")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep sm:table-cell">{t("owner")}</th>
              <th className="hidden px-4 py-3 text-center font-semibold text-primary-deep md:table-cell">{t("type")}</th>
              <th className="px-4 py-3 text-center font-semibold text-primary-deep">{t("status")}</th>
              <th className="hidden px-4 py-3 text-center font-semibold text-primary-deep md:table-cell">{t("views")}</th>
              <th className="hidden px-4 py-3 text-right font-semibold text-primary-deep lg:table-cell">{t("created")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && sites.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-40" /></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Skeleton className="h-5 w-32" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-16 mx-auto" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 mx-auto" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-12 mx-auto" /></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></td>
                </tr>
              ))
            ) : sites.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted">{t("noSites")}</td>
              </tr>
            ) : (
              sites.map((site: any) => (
                <tr key={site.id} className="border-b border-border-light transition-colors hover:bg-primary-deep/[0.02]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-deep">{site.businessName || site.subdomain || "—"}</p>
                    <p className="text-xs text-text-muted truncate max-w-[250px]">
                      {site.subdomain ? `${site.subdomain}.qvicko.com` : site.websiteUrl || "—"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="text-text-secondary">{site.ownerName || "—"}</p>
                    <p className="text-xs text-text-muted">{site.ownerEmail || "System"}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      site.isLeadSite
                        ? "bg-violet-100 text-violet-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {site.isLeadSite ? t("leadTag") : t("userTag")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[site.status] || "bg-gray-100"}`}>
                      {site.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <span className="font-medium text-primary-deep">{site.views}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-right text-text-muted lg:table-cell">
                    {new Date(site.createdAt).toLocaleDateString("sv-SE")}
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
