"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link, useRouter } from "@/i18n/routing";
import { GET_INBOUND_EMAIL, GET_SUPPORT_TICKET } from "@/graphql/queries";
import {
  MARK_EMAIL_READ,
  ARCHIVE_EMAIL,
  MARK_TICKET_READ,
  ARCHIVE_TICKET,
  UPDATE_SUPPORT_TICKET,
} from "@/graphql/mutations";
import { Button } from "@/components/ui/button";

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ──────────────── Constants ──────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  spam: "bg-red-100 text-red-700",
  lead_reply: "bg-green-100 text-green-700",
  support: "bg-blue-100 text-blue-700",
  inquiry: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const TICKET_STATUS_ICONS: Record<string, string> = {
  OPEN: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  IN_PROGRESS: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182",
  RESOLVED: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  CLOSED: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

/* ──────────────── Helpers ──────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`} />
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <div className="rounded-2xl border border-border-light bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="rounded-2xl border border-border-light bg-white p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(d: string | null | undefined) {
  if (!d) return "—";
  const now = Date.now();
  const then = new Date(d).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

/* ──────────────── Email Detail ──────────────── */

function EmailDetailView({ email, t }: { email: any; t: any }) {
  const router = useRouter();
  const [markRead] = useMutation(MARK_EMAIL_READ);
  const [archive] = useMutation(ARCHIVE_EMAIL);

  async function handleMarkRead() {
    await markRead({ variables: { id: email.id, isRead: !email.isRead } });
    router.push("/dashboard/inbox");
  }

  async function handleArchive() {
    await archive({ variables: { id: email.id, isArchived: !email.isArchived } });
    router.push("/dashboard/inbox");
  }

  return (
    <div className="space-y-6">
      {/* Email header card */}
      <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${CATEGORY_COLORS[email.category] || "bg-gray-100"}`}>
              {t(email.category)}
            </span>
            {email.matchedLeadId && (
              <Link
                href={`/dashboard/leads/${email.matchedLeadId}` as any}
                className="inline-flex items-center gap-1 rounded-full bg-primary-deep/5 px-3 py-1 text-xs font-medium text-primary-deep hover:bg-primary-deep/10 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                {t("viewLead")}
              </Link>
            )}
          </div>
          <span className="text-xs text-text-muted">{formatDate(email.createdAt)}</span>
        </div>

        {/* Sender info */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-primary-deep mb-3">
            {email.subject || "(no subject)"}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-deep/10 text-primary-deep font-semibold text-sm">
              {(email.fromName || email.fromEmail || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-deep">
                {email.fromName || email.fromEmail}
              </p>
              <p className="text-xs text-text-muted">
                {email.fromEmail} &rarr; {email.toEmail}
              </p>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {email.aiSummary && (
          <div className="mx-6 mb-4 rounded-xl bg-primary-deep/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="h-4 w-4 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <span className="text-xs font-medium text-primary-deep">{t("aiSummary")}</span>
            </div>
            <p className="text-sm text-text-secondary">{email.aiSummary}</p>
          </div>
        )}

        {/* Spam score */}
        {email.spamScore != null && (
          <div className="mx-6 mb-4 flex items-center gap-3 text-xs text-text-muted">
            <span>{t("spamScore")}:</span>
            <div className="h-1.5 w-24 rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${email.spamScore > 0.7 ? "bg-red-500" : email.spamScore > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${email.spamScore * 100}%` }}
              />
            </div>
            <span>{(email.spamScore * 100).toFixed(0)}%</span>
          </div>
        )}

        {/* Body */}
        <div className="border-t border-border-light px-6 py-5">
          <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans leading-relaxed">
            {email.bodyText || "(empty)"}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleMarkRead}>
          {email.isRead ? t("markUnread") : t("markRead")}
        </Button>
        <Button variant="outline" size="sm" onClick={handleArchive}>
          {email.isArchived ? t("unarchive") : t("archive")}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── Ticket Detail ──────────────── */

function TicketDetailView({ ticket, t }: { ticket: any; t: any }) {
  const router = useRouter();
  const [replyText, setReplyText] = useState(ticket.adminReply || "");
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [updateTicket] = useMutation(UPDATE_SUPPORT_TICKET);
  const [markRead] = useMutation(MARK_TICKET_READ);
  const [archiveTicket] = useMutation(ARCHIVE_TICKET);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateTicket({
        variables: {
          input: {
            ticketId: ticket.id,
            status: selectedStatus,
            ...(replyText.trim() !== (ticket.adminReply || "") ? { adminReply: replyText.trim() } : {}),
          },
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickResolve() {
    setSaving(true);
    try {
      await updateTicket({
        variables: {
          input: {
            ticketId: ticket.id,
            status: "RESOLVED",
            ...(replyText.trim() ? { adminReply: replyText.trim() } : {}),
          },
        },
      });
      router.push("/dashboard/inbox");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickClose() {
    await updateTicket({
      variables: { input: { ticketId: ticket.id, status: "CLOSED" } },
    });
    router.push("/dashboard/inbox");
  }

  async function handleArchive() {
    await archiveTicket({ variables: { ticketId: ticket.id, isArchived: !ticket.isArchived } });
    router.push("/dashboard/inbox");
  }

  const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  return (
    <div className="space-y-6">
      {/* Ticket header card */}
      <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
        {/* Top bar with status + priority */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TICKET_STATUS_COLORS[ticket.status]}`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={TICKET_STATUS_ICONS[ticket.status] || TICKET_STATUS_ICONS.OPEN} />
              </svg>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${TICKET_STATUS_COLORS[ticket.status]}`}>
              {t(`ticketStatus_${ticket.status}`)}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || "bg-gray-100"}`}>
              {t(`priority_${ticket.priority}`)}
            </span>
          </div>
          <span className="text-xs text-text-muted">{formatRelative(ticket.createdAt)}</span>
        </div>

        {/* Ticket info */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-primary-deep mb-3">
            {ticket.subject}
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-deep/10 text-primary-deep font-semibold text-sm">
              {(ticket.userName || ticket.userEmail || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-primary-deep">
                {ticket.userName || t("unknownUser")}
              </p>
              <p className="text-xs text-text-muted">{ticket.userEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation thread */}
      <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
        <div className="border-b border-border-light px-6 py-3">
          <h3 className="text-sm font-semibold text-primary-deep">{t("conversation")}</h3>
        </div>

        <div className="divide-y divide-border-light">
          {/* User message */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-deep/10">
                <svg className="h-3.5 w-3.5 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-primary-deep">
                {ticket.userName || ticket.userEmail}
              </span>
              <span className="text-[10px] text-text-muted">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="ml-9">
              <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans leading-relaxed">
                {ticket.message}
              </pre>
            </div>
          </div>

          {/* Existing admin reply */}
          {ticket.adminReply && (
            <div className="bg-accent/[0.03] px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
                  <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-accent">{t("supportTeamLabel")}</span>
                <span className="text-[10px] text-text-muted">{formatDate(ticket.repliedAt)}</span>
              </div>
              <div className="ml-9">
                <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans leading-relaxed">
                  {ticket.adminReply}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin actions card */}
      <div className="rounded-2xl border border-border-light bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-primary-deep">{t("adminActions")}</h3>

        {/* Status selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">{t("changeStatus")}</label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  selectedStatus === s
                    ? `${TICKET_STATUS_COLORS[s]} ring-2 ring-offset-1 ring-current/30`
                    : "border border-border-light text-text-muted hover:bg-primary-deep/5"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={TICKET_STATUS_ICONS[s]} />
                </svg>
                {t(`ticketStatus_${s}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Reply textarea */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">
            {ticket.adminReply ? t("editReply") : t("writeReply")}
          </label>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            maxLength={5000}
            className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            placeholder={t("replyPlaceholder")}
          />
          <p className="mt-1 text-xs text-text-muted">{replyText.length}/5000</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("saving")}
              </div>
            ) : (
              t("saveChanges")
            )}
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={handleQuickResolve}
            disabled={saving}
          >
            <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t("resolveAndSend")}
          </Button>

          <Button variant="outline" size="sm" onClick={handleQuickClose}>
            {t("closeTicket")}
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={handleArchive}>
            {ticket.isArchived ? t("unarchive") : t("archive")}
          </Button>

          {saved && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t("saved")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Page ──────────────── */

export default function InboxDetailPage() {
  const params = useParams();
  const t = useTranslations("inbox");
  const itemType = params.type as string; // "email" or "ticket"
  const itemId = params.id as string;

  const isEmail = itemType === "email";
  const isTicket = itemType === "ticket";

  const { data: emailData, loading: emailLoading } = useQuery(GET_INBOUND_EMAIL, {
    variables: { id: itemId },
    skip: !isEmail,
  });

  const { data: ticketData, loading: ticketLoading } = useQuery(GET_SUPPORT_TICKET, {
    variables: { id: itemId },
    skip: !isTicket,
  });

  const loading = emailLoading || ticketLoading;
  const email = (emailData as any)?.inboundEmail;
  const ticket = (ticketData as any)?.supportTicket;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/inbox" className="text-sm text-text-muted hover:text-primary-deep transition-colors">
            &larr; {t("backToInbox")}
          </Link>
        </div>
        <PageSkeleton />
      </div>
    );
  }

  if ((isEmail && !email) || (isTicket && !ticket)) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/inbox" className="text-sm text-text-muted hover:text-primary-deep transition-colors">
          &larr; {t("backToInbox")}
        </Link>
        <div className="rounded-2xl border border-border-light bg-white p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 0l-.001.027a11.955 11.955 0 01-6.738 2.098 11.955 11.955 0 01-6.738-2.098l-.001-.027m13.478 0A2.223 2.223 0 0016.5 16.5c0-.612-.25-1.167-.652-1.566M2.25 9l8.684-4.632a2.25 2.25 0 012.132 0L21.75 9" />
          </svg>
          <p className="mt-3 text-sm text-text-muted">{t("notFound")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/inbox"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-deep transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {t("backToInbox")}
      </Link>

      {isEmail && email && <EmailDetailView email={email} t={t} />}
      {isTicket && ticket && <TicketDetailView ticket={ticket} t={t} />}
    </div>
  );
}
