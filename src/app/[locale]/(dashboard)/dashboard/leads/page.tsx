"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "@/i18n/routing";
import { GET_LEADS, GET_DASHBOARD_STATS } from "@/graphql/queries";
import { CREATE_LEAD, DELETE_LEAD } from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────── Status config ──────────────── */

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  SCRAPING: "bg-yellow-100 text-yellow-700",
  SCRAPED: "bg-indigo-100 text-indigo-700",
  GENERATING: "bg-purple-100 text-purple-700",
  GENERATED: "bg-emerald-100 text-emerald-700",
  EMAIL_SENT: "bg-cyan-100 text-cyan-700",
  OPENED: "bg-teal-100 text-teal-700",
  CONVERTED: "bg-green-100 text-green-800",
  REJECTED: "bg-gray-100 text-gray-600",
  FAILED: "bg-red-100 text-red-700",
};

/* ──────────────── Skeleton ──────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

/* ──────────────── Stats Cards ──────────────── */

function StatsCards() {
  const t = useTranslations("leads");
  const { data, loading } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: "cache-and-network",
  });
  const stats = (data as any)?.dashboardStats;

  const cards = [
    { label: t("statsTotal"), value: stats?.totalLeads ?? 0, icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584" },
    { label: t("statsGenerated"), value: stats?.leadsGenerated ?? 0, icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: t("statsEmailed"), value: stats?.totalEmailsSent ?? 0, icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
    { label: t("statsCost"), value: `$${(stats?.totalAiCostUsd ?? 0).toFixed(2)}`, icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
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

export default function LeadsPage() {
  const t = useTranslations("leads");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create lead state
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  const { data, loading, refetch } = useQuery(GET_LEADS, {
    variables: {
      filter: {
        page,
        pageSize: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
    },
    fetchPolicy: "cache-and-network",
  });

  const [createLead, { loading: creating }] = useMutation(CREATE_LEAD);
  const [deleteLead] = useMutation(DELETE_LEAD);

  const leads = (data as any)?.leads?.items || [];
  const total = (data as any)?.leads?.total || 0;
  const totalPages = Math.ceil(total / 20);

  async function handleCreate() {
    if (!newUrl.trim()) return;
    try {
      await createLead({
        variables: {
          input: {
            websiteUrl: newUrl.trim(),
            ...(newName ? { businessName: newName } : {}),
            ...(newIndustry ? { industry: newIndustry } : {}),
          },
        },
      });
      setNewUrl("");
      setNewName("");
      setNewIndustry("");
      setShowCreate(false);
      refetch();
    } catch {
      // Error handled by Apollo
    }
  }

  async function handleDelete(id: string) {
    await deleteLead({ variables: { leadId: id } });
    refetch();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
          <p className="mt-1 text-text-muted">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{t("addLead")}</Button>
      </div>

      <StatsCards />

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-border-light bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("newLead")}</h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder={t("urlPlaceholder")}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={t("namePlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:w-48"
            />
            <Input
              placeholder={t("industryPlaceholder")}
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              className="sm:w-36"
            />
            <Button onClick={handleCreate} disabled={creating || !newUrl.trim()}>
              {creating ? t("processing") : t("create")}
            </Button>
          </div>
        </div>
      )}

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
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("business")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep sm:table-cell">{t("contact")}</th>
              <th className="px-4 py-3 text-left font-semibold text-primary-deep">{t("status")}</th>
              <th className="hidden px-4 py-3 text-center font-semibold text-primary-deep md:table-cell">{t("messages")}</th>
              <th className="hidden px-4 py-3 text-left font-semibold text-primary-deep lg:table-cell">{t("site")}</th>
              <th className="px-4 py-3 text-right font-semibold text-primary-deep">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && leads.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border-light">
                  <td className="px-4 py-3"><Skeleton className="h-5 w-32" /></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Skeleton className="h-5 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><Skeleton className="h-5 w-8 mx-auto" /></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><Skeleton className="h-5 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-12 ml-auto" /></td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted">{t("noLeads")}</td>
              </tr>
            ) : (
              leads.map((lead: {
                id: string; businessName: string | null; websiteUrl: string;
                email: string | null; phone: string | null; status: string;
                inboundEmailsCount: number;
                generatedSite: { id: string; status: string; views: number } | null;
              }) => (
                <tr
                  key={lead.id}
                  className="border-b border-border-light transition-colors hover:bg-primary-deep/[0.02] cursor-pointer"
                  onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-primary-deep">{lead.businessName || "—"}</p>
                    <p className="text-xs text-text-muted truncate max-w-[200px]">{lead.websiteUrl}</p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="text-text-secondary">{lead.email || "—"}</p>
                    <p className="text-xs text-text-muted">{lead.phone || ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[lead.status] || "bg-gray-100"}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-center">
                    {lead.inboundEmailsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                        {lead.inboundEmailsCount}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">0</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {lead.generatedSite ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_VIEWER_URL || "http://localhost:3001"}/${lead.generatedSite.id}`}
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-emerald-600 font-medium hover:underline"
                      >
                        {lead.generatedSite.views} views &rarr;
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
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
