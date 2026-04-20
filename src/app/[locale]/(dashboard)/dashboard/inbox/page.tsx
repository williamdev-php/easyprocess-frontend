"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "@/i18n/routing";
import { GET_INBOX, GET_SUPPORT_TICKETS } from "@/graphql/queries";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */

type InboxSource = "all" | "emails" | "support";

const CATEGORY_COLORS: Record<string, string> = {
  spam: "bg-red-100 text-red-700",
  lead_reply: "bg-green-100 text-green-700",
  support: "bg-blue-100 text-blue-700",
  inquiry: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
  ticket: "bg-indigo-100 text-indigo-700",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`} />
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("sv-SE", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface UnifiedItem {
  id: string;
  type: "email" | "ticket";
  fromName: string;
  fromEmail: string;
  subject: string;
  category: string;
  aiSummary?: string;
  matchedLeadId?: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  status?: string;
}

function emailToUnified(e: any): UnifiedItem {
  return {
    id: e.id,
    type: "email",
    fromName: e.fromName || e.fromEmail,
    fromEmail: e.fromEmail,
    subject: e.subject || "(no subject)",
    category: e.category,
    aiSummary: e.aiSummary,
    matchedLeadId: e.matchedLeadId,
    isRead: e.isRead,
    isArchived: e.isArchived,
    createdAt: e.createdAt,
  };
}

function ticketToUnified(t: any): UnifiedItem {
  return {
    id: t.id,
    type: "ticket",
    fromName: t.userName || t.userEmail || "User",
    fromEmail: t.userEmail || "",
    subject: t.subject,
    category: "ticket",
    isRead: t.isRead,
    isArchived: t.isArchived,
    createdAt: t.createdAt,
    status: t.status,
  };
}

/* ──────────────── Main Inbox Page ──────────────── */

export default function InboxPage() {
  const t = useTranslations("inbox");
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "unread" | "archived">("all");
  const [sourceFilter, setSourceFilter] = useState<InboxSource>("all");

  const emailFilterVars: any = {
    page,
    pageSize: 50,
    ...(search ? { search } : {}),
    ...(categoryFilter && categoryFilter !== "ticket" ? { category: categoryFilter } : {}),
  };
  if (viewFilter === "unread") emailFilterVars.isRead = false;
  if (viewFilter === "archived") emailFilterVars.isArchived = true;
  if (viewFilter === "all" || viewFilter === "unread") emailFilterVars.isArchived = false;

  const ticketFilterVars: any = {
    page: 1,
    pageSize: 50,
    ...(search ? { search } : {}),
  };
  if (viewFilter === "unread") ticketFilterVars.isRead = false;
  if (viewFilter === "archived") ticketFilterVars.isArchived = true;
  if (viewFilter === "all" || viewFilter === "unread") ticketFilterVars.isArchived = false;

  const skipEmails = sourceFilter === "support";
  const skipTickets = sourceFilter === "emails";

  const { data: emailData, loading: emailLoading } = useQuery<any>(GET_INBOX, {
    variables: { filter: emailFilterVars },
    fetchPolicy: "cache-and-network",
    skip: skipEmails,
  });

  const { data: ticketData, loading: ticketLoading } = useQuery<any>(GET_SUPPORT_TICKETS, {
    variables: { filter: ticketFilterVars },
    fetchPolicy: "cache-and-network",
    skip: skipTickets,
  });

  const loading = emailLoading || ticketLoading;

  const items = useMemo(() => {
    const emails = skipEmails ? [] : (emailData?.inbox?.items || []).map(emailToUnified);
    const tickets = skipTickets ? [] : (ticketData?.supportTickets?.items || []).map(ticketToUnified);

    let merged = [...emails, ...tickets];
    if (categoryFilter === "ticket") {
      merged = merged.filter((i) => i.type === "ticket");
    } else if (categoryFilter) {
      merged = merged.filter((i) => i.category === categoryFilter);
    }

    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return merged;
  }, [emailData, ticketData, categoryFilter, skipEmails, skipTickets]);

  // Counts for tabs
  const emailCount = emailData?.inbox?.total || 0;
  const ticketCount = ticketData?.supportTickets?.total || 0;
  const unreadEmails = skipEmails ? 0 : (emailData?.inbox?.items || []).filter((e: any) => !e.isRead).length;
  const unreadTickets = skipTickets ? 0 : (ticketData?.supportTickets?.items || []).filter((t: any) => !t.isRead).length;

  function handleItemClick(item: UnifiedItem) {
    router.push(`/dashboard/inbox/${item.type}/${item.id}` as any);
  }

  const categories = ["spam", "lead_reply", "support", "inquiry", "other", "ticket"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Source tabs */}
      <div className="flex gap-1 rounded-xl bg-background p-1">
        {(["all", "emails", "support"] as InboxSource[]).map((s) => {
          const count = s === "all" ? emailCount + ticketCount : s === "emails" ? emailCount : ticketCount;
          const unread = s === "all" ? unreadEmails + unreadTickets : s === "emails" ? unreadEmails : unreadTickets;
          return (
            <button
              key={s}
              onClick={() => { setSourceFilter(s); setPage(1); }}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                sourceFilter === s
                  ? "bg-white text-primary-deep shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {t(`source_${s}`)}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  sourceFilter === s ? "bg-primary-deep/10 text-primary-deep" : "bg-border-light text-text-muted"
                }`}>
                  {count}
                </span>
              )}
              {unread > 0 && sourceFilter !== s && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="sm:w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-border-theme bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{t(c)}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {(["all", "unread", "archived"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setViewFilter(v); setPage(1); }}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                viewFilter === v
                  ? "bg-primary-deep text-white"
                  : "text-text-muted hover:bg-primary-deep/5"
              }`}
            >
              {t(v)}
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
        <div className="divide-y divide-border-light">
          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="mt-1 h-2 w-2 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3.5 w-64" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <svg className="mx-auto h-10 w-10 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 0l-.001.027a11.955 11.955 0 01-6.738 2.098 11.955 11.955 0 01-6.738-2.098l-.001-.027m13.478 0A2.223 2.223 0 0016.5 16.5c0-.612-.25-1.167-.652-1.566M2.25 9l8.684-4.632a2.25 2.25 0 012.132 0L21.75 9" />
              </svg>
              <p className="mt-2 text-sm text-text-muted">{t("noEmails")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-primary-deep/[0.02] ${
                  !item.isRead ? "bg-blue-50/30" : ""
                }`}
              >
                {/* Unread dot */}
                <div className="mt-2 shrink-0">
                  {!item.isRead ? (
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  ) : (
                    <div className="h-2 w-2" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${!item.isRead ? "font-semibold text-primary-deep" : "font-medium text-text-secondary"}`}>
                      {item.fromName}
                    </p>
                    <span className="shrink-0 text-[10px] text-text-muted">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${!item.isRead ? "text-primary-deep" : "text-text-secondary"}`}>
                    {item.subject}
                  </p>
                  {item.aiSummary && (
                    <p className="text-xs text-text-muted truncate mt-0.5">{item.aiSummary}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category] || "bg-gray-100"}`}>
                      {item.type === "ticket" ? t("ticket") : t(item.category)}
                    </span>
                    {item.type === "ticket" && item.status && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${TICKET_STATUS_COLORS[item.status] || "bg-gray-100"}`}>
                        {t(`ticketStatus_${item.status}`)}
                      </span>
                    )}
                    {item.matchedLeadId && (
                      <span className="rounded-full bg-primary-deep/5 px-2 py-0.5 text-[10px] font-medium text-primary-deep">
                        {t("matchedLead")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <svg className="mt-2 h-4 w-4 shrink-0 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
