"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSiteContext } from "@/lib/site-context";
import { MY_SITE, MY_SUBSCRIPTION, GET_SITE_ANALYTICS } from "@/graphql/queries";
import { PUBLISH_SITE, PAUSE_SITE, UNPAUSE_SITE } from "@/graphql/mutations";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("siteOverview");

  const config: Record<string, { label: string; dot: string; bg: string }> = {
    PUBLISHED: { label: t("statusPublished"), dot: "bg-emerald-500", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    DRAFT: { label: t("statusDraft"), dot: "bg-amber-500", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    PAUSED: { label: t("statusPaused"), dot: "bg-orange-500", bg: "bg-orange-50 text-orange-700 border-orange-200" },
    ARCHIVED: { label: t("statusArchived"), dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600 border-gray-200" },
  };

  const c = config[status] || config.DRAFT;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${c.bg}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Quick action card
// ---------------------------------------------------------------------------

function ActionCard({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href as "/dashboard"}
      className="group flex items-start gap-4 rounded-xl border border-border-light bg-white p-4 shadow-sm transition-all hover:border-primary-deep/20 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-deep/5 text-primary-deep transition-colors group-hover:bg-primary-deep/10">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-primary-deep group-hover:text-primary transition-colors">{label}</p>
        <p className="mt-0.5 text-xs text-text-muted leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SiteGeneralPage() {
  const { site, siteId, installedApps, loading: ctxLoading, siteName } = useSiteContext();
  const t = useTranslations("siteOverview");

  // Additional data
  const { data: siteDetail } = useQuery<{
    mySite: {
      id: string;
      subdomain: string | null;
      status: string;
      views: number;
      createdAt: string;
      updatedAt: string;
      siteData: Record<string, unknown>;
    };
  }>(MY_SITE, { variables: { id: siteId }, fetchPolicy: "cache-and-network" });

  const { data: analyticsData } = useQuery<{
    siteAnalytics: { totalVisitors: number; totalPageViews: number; performanceScore: number };
  }>(GET_SITE_ANALYTICS, {
    variables: { siteId, days: 30 },
    skip: !siteId,
    fetchPolicy: "cache-and-network",
  });

  const { data: subData } = useQuery<{ mySubscription: { id: string } | null }>(MY_SUBSCRIPTION, {
    fetchPolicy: "cache-first",
  });

  // Mutations
  const [publishSite, { loading: publishing }] = useMutation(PUBLISH_SITE, {
    refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
  });
  const [pauseSite, { loading: pausing }] = useMutation(PAUSE_SITE, {
    refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
  });
  const [unpauseSite, { loading: unpausing }] = useMutation(UNPAUSE_SITE, {
    refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const detail = siteDetail?.mySite;
  const analytics = analyticsData?.siteAnalytics;
  const status = detail?.status || site?.status || "DRAFT";
  const subdomain = detail?.subdomain || site?.subdomain;
  const views = detail?.views ?? site?.views ?? 0;
  const updatedAt = detail?.updatedAt || site?.updatedAt;
  const createdAt = detail?.createdAt || site?.createdAt;
  const hasSubscription = !!subData?.mySubscription;

  const siteData = (detail?.siteData || site?.siteData || {}) as {
    branding?: { logo_url?: string; colors?: { primary?: string } };
    meta?: { og_image?: string; favicon_url?: string };
    hero?: { background_image?: string };
    about?: { image?: string };
    business?: { name?: string; tagline?: string };
    section_order?: string[];
  };

  const primaryColor = siteData.branding?.colors?.primary || "#326586";
  const siteUrl = subdomain ? `https://${subdomain}.qvickosite.com` : null;
  const viewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL ?? "";
  const previewIframeUrl = viewerUrl ? `${viewerUrl}/preview/${siteId}` : null;
  const previewImage =
    siteData.meta?.og_image ||
    siteData.hero?.background_image ||
    siteData.about?.image ||
    siteData.branding?.logo_url ||
    null;

  const activeSections = (siteData.section_order || []).length;

  function showMsg(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handlePublish() {
    try {
      await publishSite({ variables: { siteId } });
      showMsg("success", t("publishSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
    }
  }

  async function handlePause() {
    try {
      await pauseSite({ variables: { siteId } });
      showMsg("success", t("pauseSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
    }
  }

  async function handleUnpause() {
    try {
      await unpauseSite({ variables: { siteId } });
      showMsg("success", t("unpauseSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
    }
  }

  // Loading
  if (ctxLoading || !site) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const isPublished = status === "PUBLISHED";
  const isDraft = status === "DRAFT";
  const isPaused = status === "PAUSED";

  return (
    <div className="space-y-6">
      {/* Toast */}
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {siteData.branding?.logo_url ? (
            <img
              src={siteData.branding.logo_url}
              alt=""
              className="h-12 w-12 rounded-xl object-contain border border-border-light"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {siteName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-primary-deep">{siteName}</h2>
            {siteData.business?.tagline && (
              <p className="text-sm text-text-muted">{siteData.business.tagline}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={status} />

          {siteUrl && !isPaused && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep"
              title={t("visitSite")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Preview + Status card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Preview */}
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
          <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-deep/5 to-primary/5 overflow-hidden">
            {previewIframeUrl ? (
              <iframe
                src={previewIframeUrl}
                title="Preview"
                className="h-full w-full origin-top-left border-0"
                style={{ transform: "scale(0.5)", width: "200%", height: "200%" }}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
              />
            ) : previewImage ? (
              <img src={previewImage} alt={siteName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-text-muted">{t("noPreview")}</p>
              </div>
            )}

            {/* Color accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: primaryColor }} />
          </div>
        </div>

        {/* Status & info panel */}
        <div className="flex flex-col gap-4">
          {/* Status actions */}
          <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-primary-deep">{t("siteStatus")}</h3>

            <div className="mt-3 space-y-3">
              {isDraft && (
                <button
                  onClick={handlePublish}
                  disabled={publishing || !hasSubscription}
                  className="w-full rounded-xl bg-primary-deep px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
                >
                  {publishing ? t("publishing") : t("publishSite")}
                </button>
              )}

              {isDraft && !hasSubscription && (
                <p className="text-xs text-amber-600">{t("requiresPlan")}</p>
              )}

              {isPublished && (
                <button
                  onClick={handlePause}
                  disabled={pausing}
                  className="w-full rounded-xl border border-orange-300 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-50 disabled:opacity-50"
                >
                  {pausing ? "..." : t("pauseSite")}
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleUnpause}
                  disabled={unpausing}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {unpausing ? "..." : t("unpauseSite")}
                </button>
              )}

              {siteUrl && (
                <div className="rounded-lg bg-primary-deep/5 px-3 py-2">
                  <p className="text-[11px] font-medium text-text-muted">{t("siteAddress")}</p>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-primary-deep hover:underline break-all"
                  >
                    {subdomain}.qvickosite.com
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-primary-deep">{t("quickStats")}</h3>
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("totalViews")}</span>
                <span className="text-sm font-semibold text-primary-deep">{views.toLocaleString()}</span>
              </div>
              {analytics && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">{t("visitors30d")}</span>
                    <span className="text-sm font-semibold text-primary-deep">{analytics.totalVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">{t("pageViews30d")}</span>
                    <span className="text-sm font-semibold text-primary-deep">{analytics.totalPageViews.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("sections")}</span>
                <span className="text-sm font-semibold text-primary-deep">{activeSections}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{t("installedApps")}</span>
                <span className="text-sm font-semibold text-primary-deep">{installedApps.length}</span>
              </div>
              <div className="border-t border-border-light pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{t("lastUpdated")}</span>
                  <span className="text-xs font-medium text-text-secondary">
                    {updatedAt ? new Date(updatedAt).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-text-muted">{t("created")}</span>
                  <span className="text-xs font-medium text-text-secondary">
                    {createdAt ? new Date(createdAt).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-primary-deep">{t("quickActions")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionCard
            href={`/dashboard/pages/${siteId}`}
            icon="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            label={t("actionEditor")}
            description={t("actionEditorDesc")}
          />
          <ActionCard
            href={`/dashboard/sites/${siteId}/navigation`}
            icon="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            label={t("actionNavigation")}
            description={t("actionNavigationDesc")}
          />
          <ActionCard
            href={`/dashboard/pages/${siteId}/code`}
            icon="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            label={t("actionCode")}
            description={t("actionCodeDesc")}
          />
          <ActionCard
            href={`/dashboard/pages/${siteId}/settings`}
            icon="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            label={t("actionSettings")}
            description={t("actionSettingsDesc")}
          />
        </div>
      </div>
    </div>
  );
}
