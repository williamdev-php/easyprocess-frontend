"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_CHAT_CONVERSATIONS } from "@/graphql/queries";

interface ChatConversation {
  id: string;
  siteId: string;
  visitorEmail: string;
  visitorName: string | null;
  status: string;
  subject: string | null;
  lastMessageAt: string | null;
  messageCount: number;
  lastMessagePreview: string | null;
  createdAt: string;
}

export default function ChatConversationsPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("chat");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filter: Record<string, unknown> = { page, pageSize: 20 };
  if (statusFilter) filter.status = statusFilter;
  if (search) filter.search = search;

  const { data, loading } = useQuery<{
    chatConversations: { items: ChatConversation[]; total: number; page: number; pageSize: number };
  }>(GET_CHAT_CONVERSATIONS, {
    variables: { siteId, filter },
    fetchPolicy: "cache-and-network",
    pollInterval: 15000,
  });

  const conversations = data?.chatConversations.items ?? [];
  const total = data?.chatConversations.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const statusBadge: Record<string, { label: string; color: string }> = {
    open: { label: t("open"), color: "bg-green-100 text-green-700" },
    closed: { label: t("closed"), color: "bg-gray-100 text-gray-600" },
  };

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-4 animate-page-enter">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-text-primary">{t("conversations")}</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("searchConversations")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary-deep"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border-light bg-white px-3 py-2 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="OPEN">{t("open")}</option>
          <option value="CLOSED">{t("closed")}</option>
        </select>
      </div>

      {/* List */}
      {loading && conversations.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-xl border border-border-light bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep/10">
            <svg className="h-8 w-8 text-primary-deep" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-text-primary">{t("noConversations")}</h3>
          <p className="mt-1 text-sm text-text-secondary">{t("waitingForMessages")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-light bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-light bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-text-secondary">{t("from")}</th>
                <th className="px-4 py-3 font-medium text-text-secondary hidden sm:table-cell">{t("subject")}</th>
                <th className="px-4 py-3 font-medium text-text-secondary hidden md:table-cell">{t("lastMessage")}</th>
                <th className="px-4 py-3 font-medium text-text-secondary">{t("messages")}</th>
                <th className="px-4 py-3 font-medium text-text-secondary">{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {conversations.map((conv) => {
                const badge = statusBadge[conv.status] || statusBadge.open;
                return (
                  <tr key={conv.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/sites/${siteId}/apps/chat/conversations/${conv.id}` as "/dashboard"}
                        className="block"
                      >
                        <div className="font-medium text-text-primary">
                          {conv.visitorName || conv.visitorEmail.split("@")[0]}
                        </div>
                        <div className="text-xs text-text-secondary">{conv.visitorEmail}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                      <Link href={`/dashboard/sites/${siteId}/apps/chat/conversations/${conv.id}` as "/dashboard"}>
                        {conv.subject || "-"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      <Link href={`/dashboard/sites/${siteId}/apps/chat/conversations/${conv.id}` as "/dashboard"}>
                        <div className="max-w-xs truncate">{conv.lastMessagePreview || "-"}</div>
                        <div className="text-xs">{formatDate(conv.lastMessageAt)}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">{conv.messageCount}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &larr;
          </button>
          <span className="text-sm text-text-secondary">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-border-light px-3 py-1.5 text-sm disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
