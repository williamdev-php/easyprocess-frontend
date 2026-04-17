"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { useRouter } from "@/i18n/routing";
import { GET_INBOX } from "@/graphql/queries";
import { MARK_EMAIL_READ, ARCHIVE_EMAIL } from "@/graphql/mutations";
import { Input } from "@/components/ui/input";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CATEGORY_COLORS: Record<string, string> = {
  spam: "bg-red-100 text-red-700",
  lead_reply: "bg-green-100 text-green-700",
  support: "bg-blue-100 text-blue-700",
  inquiry: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
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

/* ──────────────── Email Detail Panel ──────────────── */

function EmailDetail({
  email,
  onClose,
  onToggleRead,
  onToggleArchive,
}: {
  email: any;
  onClose: () => void;
  onToggleRead: () => void;
  onToggleArchive: () => void;
}) {
  const t = useTranslations("inbox");
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-light p-4">
        <h3 className="text-sm font-semibold text-primary-deep truncate pr-2">
          {email.subject || "(no subject)"}
        </h3>
        <button onClick={onClose} className="shrink-0 rounded-lg p-1 hover:bg-primary-deep/5">
          <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-deep">{email.fromName || email.fromEmail}</p>
              <p className="text-xs text-text-muted">{email.fromEmail}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_COLORS[email.category] || "bg-gray-100"}`}>
              {t(email.category)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>{t("to")}: {email.toEmail}</span>
            <span>{formatDate(email.createdAt)}</span>
          </div>
        </div>

        {/* AI Summary */}
        {email.aiSummary && (
          <div className="rounded-xl bg-primary-deep/5 p-3">
            <span className="text-xs font-medium text-primary-deep">{t("summary")}</span>
            <p className="text-sm text-text-secondary mt-1">{email.aiSummary}</p>
          </div>
        )}

        {email.spamScore != null && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{t("spamScore")}:</span>
            <div className="h-1.5 w-20 rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full ${email.spamScore > 0.7 ? "bg-red-500" : email.spamScore > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${email.spamScore * 100}%` }}
              />
            </div>
            <span>{(email.spamScore * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Body */}
        <div className="rounded-xl border border-border-light bg-white p-4">
          <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans">{email.bodyText || "(empty)"}</pre>
        </div>

        {/* Matched lead */}
        {email.matchedLeadId && (
          <button
            onClick={() => router.push(`/dashboard/leads/${email.matchedLeadId}`)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-deep/5 px-3 py-2 text-xs font-medium text-primary-deep hover:bg-primary-deep/10 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {t("viewLead")}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-border-light p-3">
        <button onClick={onToggleRead} className="flex-1 rounded-lg border border-border-light px-3 py-2 text-xs font-medium text-text-secondary hover:bg-primary-deep/5 transition-colors">
          {email.isRead ? t("markUnread") : t("markRead")}
        </button>
        <button onClick={onToggleArchive} className="flex-1 rounded-lg border border-border-light px-3 py-2 text-xs font-medium text-text-secondary hover:bg-primary-deep/5 transition-colors">
          {email.isArchived ? t("unarchive") : t("archive")}
        </button>
      </div>
    </div>
  );
}

/* ─────���────────── Main Inbox Page ──────────────── */

export default function InboxPage() {
  const t = useTranslations("inbox");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "unread" | "archived">("all");
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  const filterVars: any = {
    page,
    pageSize: 20,
    ...(search ? { search } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
  };
  if (viewFilter === "unread") filterVars.isRead = false;
  if (viewFilter === "archived") filterVars.isArchived = true;
  if (viewFilter === "all" || viewFilter === "unread") filterVars.isArchived = false;

  const { data, loading, refetch } = useQuery<any>(GET_INBOX, {
    variables: { filter: filterVars },
    fetchPolicy: "cache-and-network",
  });

  const [markRead] = useMutation(MARK_EMAIL_READ);
  const [archiveEmail] = useMutation(ARCHIVE_EMAIL);

  const emails = (data as any)?.inbox?.items || [];
  const total = (data as any)?.inbox?.total || 0;
  const totalPages = Math.ceil(total / 20);

  async function handleToggleRead(email: any) {
    await markRead({ variables: { id: email.id, isRead: !email.isRead } });
    refetch();
    if (selectedEmail?.id === email.id) {
      setSelectedEmail({ ...email, isRead: !email.isRead });
    }
  }

  async function handleToggleArchive(email: any) {
    await archiveEmail({ variables: { id: email.id, isArchived: !email.isArchived } });
    refetch();
    if (selectedEmail?.id === email.id) {
      setSelectedEmail(null);
    }
  }

  const categories = ["spam", "lead_reply", "support", "inquiry", "other"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
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

      {/* Content: Email list + detail panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Email list */}
        <div className={`${selectedEmail ? "lg:col-span-3" : "lg:col-span-5"} overflow-hidden rounded-2xl border border-border-light bg-white`}>
          <div className="divide-y divide-border-light">
            {loading && emails.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : emails.length === 0 ? (
              <div className="px-4 py-12 text-center text-text-muted">{t("noEmails")}</div>
            ) : (
              emails.map((email: any) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-primary-deep/[0.02] ${
                    selectedEmail?.id === email.id ? "bg-primary-deep/[0.03]" : ""
                  } ${!email.isRead ? "bg-blue-50/30" : ""}`}
                >
                  {/* Unread dot */}
                  <div className="mt-2 shrink-0">
                    {!email.isRead ? (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : (
                      <div className="h-2 w-2" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!email.isRead ? "font-semibold text-primary-deep" : "font-medium text-text-secondary"}`}>
                        {email.fromName || email.fromEmail}
                      </p>
                      <span className="shrink-0 text-[10px] text-text-muted">{formatDate(email.createdAt)}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${!email.isRead ? "text-primary-deep" : "text-text-secondary"}`}>
                      {email.subject || "(no subject)"}
                    </p>
                    {email.aiSummary && (
                      <p className="text-xs text-text-muted truncate mt-0.5">{email.aiSummary}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[email.category] || "bg-gray-100"}`}>
                        {t(email.category)}
                      </span>
                      {email.matchedLeadId && (
                        <span className="rounded-full bg-primary-deep/5 px-2 py-0.5 text-[10px] font-medium text-primary-deep">
                          {t("matchedLead")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

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

        {/* Detail panel */}
        {selectedEmail && (
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl border border-border-light bg-white overflow-hidden" style={{ maxHeight: "calc(100vh - 8rem)" }}>
              <EmailDetail
                email={selectedEmail}
                onClose={() => setSelectedEmail(null)}
                onToggleRead={() => handleToggleRead(selectedEmail)}
                onToggleArchive={() => handleToggleArchive(selectedEmail)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
