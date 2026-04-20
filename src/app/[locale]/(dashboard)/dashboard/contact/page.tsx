"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_SUPPORT_TICKET } from "@/graphql/mutations";
import { GET_MY_SUPPORT_TICKETS } from "@/graphql/queries";

/* eslint-disable @typescript-eslint/no-explicit-any */

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS: Record<string, string> = {
  OPEN: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  IN_PROGRESS: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182",
  RESOLVED: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  CLOSED: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="rounded-2xl border border-border-light bg-white p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

function TicketsSkeleton() {
  return (
    <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
      <div className="border-b border-border-light p-4">
        <Skeleton className="h-6 w-48" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b border-border-light p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(d: string | null) {
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

/* ──────────────── Collapsible Ticket ──────────────── */

function TicketItem({ ticket, t }: { ticket: any; t: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border-light last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-primary-deep/[0.02]"
      >
        {/* Status icon */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${STATUS_COLORS[ticket.status] || "bg-gray-100"}`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={STATUS_ICONS[ticket.status] || STATUS_ICONS.OPEN} />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-primary-deep truncate">
              {ticket.subject}
            </p>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                STATUS_COLORS[ticket.status] || "bg-gray-100"
              }`}
            >
              {t(`status_${ticket.status}`)}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5">
            {formatRelative(ticket.createdAt)}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border-light bg-background/50 px-4 pb-4 pt-3 space-y-3">
          {/* User message */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-deep/10">
                <svg className="h-3.5 w-3.5 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-primary-deep">{t("you")}</span>
              <span className="text-[10px] text-text-muted">{formatDate(ticket.createdAt)}</span>
            </div>
            <div className="ml-8 rounded-xl border border-border-light bg-white p-3">
              <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans">
                {ticket.message}
              </pre>
            </div>
          </div>

          {/* Admin reply */}
          {ticket.adminReply ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10">
                  <svg className="h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-accent">{t("supportTeam")}</span>
                <span className="text-[10px] text-text-muted">{formatDate(ticket.repliedAt)}</span>
              </div>
              <div className="ml-8 rounded-xl border border-accent/20 bg-accent/5 p-3">
                <pre className="whitespace-pre-wrap text-sm text-text-secondary font-sans">
                  {ticket.adminReply}
                </pre>
              </div>
            </div>
          ) : (
            <div className="ml-8 flex items-center gap-2 text-xs text-text-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t("awaitingReply")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────── Main Page ──────────────── */

export default function ContactPage() {
  const t = useTranslations("contact");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { data, loading: ticketsLoading, refetch } = useQuery(GET_MY_SUPPORT_TICKETS, {
    fetchPolicy: "cache-and-network",
  });

  const [createTicket, { loading: submitting }] = useMutation(CREATE_SUPPORT_TICKET);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!subject.trim() || !message.trim()) {
      setError(t("requiredFields"));
      return;
    }

    try {
      await createTicket({
        variables: {
          input: { subject: subject.trim(), message: message.trim() },
        },
      });
      setSubject("");
      setMessage("");
      setSuccess(true);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("genericError");
      setError(msg);
    }
  }

  const tickets = (data as any)?.mySupportTickets || [];
  const isFirstLoad = ticketsLoading && !data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Quick stats */}
      {!isFirstLoad && tickets.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((status) => {
            const count = tickets.filter((t: any) => t.status === status).length;
            return (
              <div
                key={status}
                className="rounded-2xl border border-border-light bg-white p-4"
              >
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${STATUS_COLORS[status]}`}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={STATUS_ICONS[status]} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-text-muted">
                    {t(`status_${status}`)}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-primary-deep">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Submit form */}
      {isFirstLoad ? (
        <FormSkeleton />
      ) : (
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="text-lg font-semibold text-primary-deep mb-4">
            {t("newTicket")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t("subject")}
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t("subjectPlaceholder")}
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t("message")}
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                rows={5}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-text-theme focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder={t("messagePlaceholder")}
              />
              <p className="mt-1 text-xs text-text-muted">
                {message.length}/5000
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("ticketCreated")}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-deep px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-deep/90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("sending")}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  {t("send")}
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Previous tickets — collapsible */}
      {isFirstLoad ? (
        <TicketsSkeleton />
      ) : tickets.length > 0 ? (
        <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-border-light p-4">
            <h3 className="text-lg font-semibold text-primary-deep">
              {t("previousTickets")}
            </h3>
            <span className="rounded-full bg-primary-deep/10 px-2.5 py-1 text-xs font-medium text-primary-deep">
              {tickets.length}
            </span>
          </div>
          {tickets.map((ticket: any) => (
            <TicketItem key={ticket.id} ticket={ticket} t={t} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
