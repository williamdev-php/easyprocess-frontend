"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { GET_LEAD } from "@/graphql/queries";
import {
  SCRAPE_LEAD,
  SEND_OUTREACH_EMAIL,
  PUBLISH_SITE,
} from "@/graphql/mutations";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  PENDING: "bg-gray-100 text-gray-600",
  SENT: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-blue-100 text-blue-700",
  CLICKED: "bg-green-100 text-green-700",
  BOUNCED: "bg-red-100 text-red-700",
};

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
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ──────────────── Conversation Sidebar ──────────────── */

function ConversationPanel({ lead }: { lead: any }) {
  const t = useTranslations("leads");
  const [activeTab, setActiveTab] = useState<"all" | "inbound" | "outbound">("all");

  // Merge outreach and inbound emails into a timeline
  const outreachMessages = (lead.outreachEmails || []).map((e: any) => ({
    id: e.id,
    type: "outbound" as const,
    from: "Qvicko",
    to: e.toEmail,
    subject: e.subject,
    status: e.status,
    date: e.sentAt || e.createdAt,
    body: null,
  }));

  const inboundMessages = (lead.inboundEmails || []).map((e: any) => ({
    id: e.id,
    type: "inbound" as const,
    from: e.fromName || e.fromEmail,
    to: e.toEmail,
    subject: e.subject,
    status: e.category,
    date: e.createdAt,
    body: e.bodyText,
    aiSummary: e.aiSummary,
    category: e.category,
  }));

  let messages = [...outreachMessages, ...inboundMessages];
  if (activeTab === "inbound") messages = inboundMessages;
  if (activeTab === "outbound") messages = outreachMessages;
  messages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border-light p-4">
        <h3 className="text-sm font-semibold text-primary-deep">{t("conversation")}</h3>
        <div className="mt-2 flex gap-1">
          {(["all", "inbound", "outbound"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary-deep text-white"
                  : "text-text-muted hover:bg-primary-deep/5"
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">{t("noMessages")}</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl p-3 ${
                msg.type === "outbound"
                  ? "ml-6 bg-primary-deep/5 border border-primary-deep/10"
                  : "mr-6 bg-white border border-border-light shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-primary-deep">
                  {msg.from}
                </span>
                <div className="flex items-center gap-1.5">
                  {msg.type === "inbound" && msg.category && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[msg.category] || "bg-gray-100"}`}>
                      {msg.category}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[msg.status] || "bg-gray-100"}`}>
                    {msg.status}
                  </span>
                </div>
              </div>
              {msg.subject && (
                <p className="text-xs font-medium text-text-secondary mb-1">{msg.subject}</p>
              )}
              {msg.type === "inbound" && msg.aiSummary && (
                <p className="text-xs text-text-muted italic mb-1">AI: {msg.aiSummary}</p>
              )}
              {msg.type === "inbound" && msg.body && (
                <p className="text-xs text-text-secondary whitespace-pre-wrap line-clamp-4">{msg.body}</p>
              )}
              <p className="text-[10px] text-text-muted mt-1.5">{formatDate(msg.date)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ──────────────── Scraped Data Panel ──────────────── */

function ScrapedDataPanel({ data }: { data: any }) {
  const t = useTranslations("leads");
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border-light p-4 space-y-3">
      <h4 className="text-sm font-semibold text-primary-deep">{t("scrapedData")}</h4>

      {data.logoUrl && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("logo")}</span>
          <img src={data.logoUrl} alt="Logo" className="mt-1 h-12 rounded-lg object-contain bg-gray-50 p-1" />
        </div>
      )}

      {data.colors && Object.keys(data.colors).length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("colors")}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {Object.entries(data.colors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1">
                <div className="h-4 w-4 rounded-md border border-border-light" style={{ backgroundColor: val as string }} />
                <span className="text-[10px] text-text-muted">{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.texts && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("texts")}</span>
          <div className="mt-1 space-y-1">
            {data.texts.title && <p className="text-xs font-medium text-primary-deep">{data.texts.title}</p>}
            {data.texts.description && <p className="text-xs text-text-secondary line-clamp-3">{data.texts.description}</p>}
          </div>
        </div>
      )}

      {data.contactInfo && Object.keys(data.contactInfo).length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("contactInfo")}</span>
          <div className="mt-1 text-xs text-text-secondary space-y-0.5">
            {Object.entries(data.contactInfo).map(([key, val]) => (
              val ? <p key={key}><span className="font-medium">{key}:</span> {Array.isArray(val) ? (val as string[]).join(", ") : String(val)}</p> : null
            ))}
          </div>
        </div>
      )}

      {data.metaInfo && Object.keys(data.metaInfo).length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("metaInfo")}</span>
          <div className="mt-1 text-xs text-text-secondary space-y-0.5">
            {Object.entries(data.metaInfo).map(([key, val]) => (
              val ? <p key={key}><span className="font-medium">{key}:</span> {String(val).substring(0, 150)}</p> : null
            ))}
          </div>
        </div>
      )}

      {data.images && data.images.length > 0 && (
        <div>
          <span className="text-xs font-medium text-text-muted">{t("images")} ({data.images.length})</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {data.images.slice(0, 6).map((img: any, i: number) => {
              const url = typeof img === "string" ? img : img?.url;
              const alt = typeof img === "string" ? "" : img?.alt || "";
              if (!url) return null;
              return (
                <img key={i} src={url} alt={alt} className="h-16 w-16 rounded-lg object-cover border border-border-light" />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── Main Detail Page ──────────────── */

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params.id as string;
  const t = useTranslations("leads");

  const { data, loading, refetch } = useQuery<any>(GET_LEAD, {
    variables: { id: leadId },
  });

  const [scrapeLead] = useMutation(SCRAPE_LEAD);
  const [sendEmail] = useMutation(SEND_OUTREACH_EMAIL);
  const [publishSite] = useMutation(PUBLISH_SITE);
  const [actionLoading, setActionLoading] = useState("");

  const lead = data?.lead;

  async function handleAction(action: string) {
    setActionLoading(action);
    try {
      if (action === "scrape") {
        await scrapeLead({ variables: { leadId } });
      } else if (action === "email") {
        await sendEmail({ variables: { leadId } });
      } else if (action === "publish" && lead?.generatedSite?.id) {
        await publishSite({ variables: { siteId: lead.generatedSite.id } });
      }
      await refetch();
    } catch {
      // Error shown via Apollo
    }
    setActionLoading("");
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">{t("notFound")}</p>
        <Link href="/dashboard/leads" className="mt-4 inline-block text-sm text-primary hover:underline">
          {t("backToLeads")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary-deep transition-colors mb-3">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t("backToLeads")}
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-primary-deep">
              {lead.businessName || lead.websiteUrl}
            </h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[lead.status] || "bg-gray-100"}`}>
              {lead.status}
            </span>
          </div>
          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAction("scrape")} disabled={actionLoading === "scrape"}>
              {actionLoading === "scrape" ? t("processing") : t("rescrape")}
            </Button>
            {lead.generatedSite && lead.generatedSite.status === "DRAFT" && (
              <Button size="sm" variant="secondary" onClick={() => handleAction("publish")} disabled={actionLoading === "publish"}>
                {actionLoading === "publish" ? t("processing") : t("publish")}
              </Button>
            )}
            {lead.email && lead.generatedSite && (
              <Button size="sm" variant="accent" onClick={() => handleAction("email")} disabled={actionLoading === "email"}>
                {actionLoading === "email" ? t("processing") : t("sendEmail")}
              </Button>
            )}
          </div>
        </div>
        <a href={lead.websiteUrl} target="_blank" rel="noopener" className="text-sm text-primary hover:underline">
          {lead.websiteUrl}
        </a>
      </div>

      {/* Main grid: Info left, Conversation right */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Lead info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact info */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: t("email"), value: lead.email },
              { label: t("phone"), value: lead.phone },
              { label: t("industry"), value: lead.industry },
              { label: t("address"), value: lead.address },
              { label: t("qualityScore"), value: lead.qualityScore != null ? `${(lead.qualityScore * 100).toFixed(0)}%` : null },
              { label: t("createdAt"), value: formatDate(lead.createdAt) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border-light bg-white p-3">
                <span className="text-xs font-medium text-text-muted">{item.label}</span>
                <p className="text-sm font-medium text-primary-deep">{item.value || "—"}</p>
              </div>
            ))}
          </div>

          {/* Error message */}
          {lead.errorMessage && (
            <Alert variant="error">{lead.errorMessage}</Alert>
          )}

          {/* Generated site info */}
          {lead.generatedSite && (
            <div className="rounded-xl border border-border-light bg-white p-4">
              <h4 className="mb-2 text-sm font-semibold text-primary-deep">{t("generatedSite")}</h4>
              <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                <span>AI: {lead.generatedSite.aiModel}</span>
                <span>Tokens: {lead.generatedSite.tokensUsed}</span>
                <span>Cost: ${lead.generatedSite.generationCostUsd?.toFixed(4)}</span>
                <span>Views: {lead.generatedSite.views}</span>
                <span className={`rounded-full px-2 py-0.5 ${STATUS_COLORS[lead.generatedSite.status] || "bg-gray-100"}`}>
                  {lead.generatedSite.status}
                </span>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_VIEWER_URL || "http://localhost:3001"}/${lead.generatedSite.id}`}
                target="_blank"
                rel="noopener"
                className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                {t("viewSite")} &rarr;
              </a>
            </div>
          )}

          {/* Scraped data */}
          <ScrapedDataPanel data={lead.scrapedData} />
        </div>

        {/* Right column: Conversation sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border-light bg-white overflow-hidden" style={{ maxHeight: "calc(100vh - 8rem)" }}>
            <ConversationPanel lead={lead} />
          </div>
        </div>
      </div>
    </div>
  );
}
