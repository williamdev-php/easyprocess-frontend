"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/routing";
import {
  GET_ANALYTICS_OVERVIEW,
  GET_FUNNEL_STATS,
  GET_VISITOR_STATS,
  GET_UTM_STATS,
  GET_TOP_PAGES,
} from "@/graphql/queries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FunnelStep {
  name: string;
  count: number;
  conversionRate: number | null;
}

interface DailyPoint {
  date: string;
  count: number;
}

interface UtmEntry {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  count: number;
}

interface TopPage {
  path: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

type RangeKey = "7d" | "30d" | "90d";

function getDateRange(key: RangeKey): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (key === "7d" ? 7 : key === "30d" ? 30 : 90));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 1) return "0s";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const FUNNEL_LABELS: Record<string, { en: string; sv: string }> = {
  page_view: { en: "Visitors", sv: "Besökare" },
  cta_click: { en: "CTA Clicks", sv: "CTA-klick" },
  create_site_started: { en: "Site Started", sv: "Sida startad" },
  create_site_completed: { en: "Site Created", sv: "Sida skapad" },
  signup: { en: "Signups", sv: "Registreringar" },
  trial_started: { en: "Trial Started", sv: "Trial startad" },
  subscription_created: { en: "Subscribed", sv: "Prenumererat" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<RangeKey>("30d");
  const [utmFilter, setUtmFilter] = useState("");

  const { startDate, endDate } = useMemo(() => getDateRange(range), [range]);

  // Redirect non-superusers
  if (!authLoading && (!user || !user.isSuperuser)) {
    router.push("/dashboard");
    return null;
  }

  // Queries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: overviewData, loading: overviewLoading } = useQuery<any>(GET_ANALYTICS_OVERVIEW, {
    variables: { startDate, endDate },
    skip: !user?.isSuperuser,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: funnelData, loading: funnelLoading } = useQuery<any>(GET_FUNNEL_STATS, {
    variables: {
      startDate,
      endDate,
      utmSource: utmFilter || null,
    },
    skip: !user?.isSuperuser,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: visitorData, loading: visitorLoading } = useQuery<any>(GET_VISITOR_STATS, {
    variables: { startDate, endDate },
    skip: !user?.isSuperuser,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: utmData, loading: utmLoading } = useQuery<any>(GET_UTM_STATS, {
    variables: { startDate, endDate },
    skip: !user?.isSuperuser,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pagesData, loading: pagesLoading } = useQuery<any>(GET_TOP_PAGES, {
    variables: { startDate, endDate, limit: 15 },
    skip: !user?.isSuperuser,
  });

  const overview = overviewData?.analyticsOverview;
  const funnelSteps: FunnelStep[] = funnelData?.funnelStats?.steps || [];
  const visitorPoints: DailyPoint[] = visitorData?.visitorStats?.points || [];
  const utmEntries: UtmEntry[] = utmData?.utmStats || [];
  const topPages: TopPage[] = pagesData?.topPages || [];

  const isLoading = overviewLoading || funnelLoading || visitorLoading;

  if (authLoading || isLoading) {
    return <AnalyticsSkeleton />;
  }

  const maxVisitors = Math.max(...visitorPoints.map((p) => p.count), 1);
  const firstFunnelCount = funnelSteps[0]?.count || 1;

  return (
    <div className="animate-page-enter space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-deep">{t("title")}</h1>
          <p className="text-sm text-text-muted">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d"] as RangeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                range === key
                  ? "bg-primary-deep text-white"
                  : "bg-surface text-text-muted hover:bg-background-subtle"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      {overview && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <MetricCard label={t("uniqueVisitors")} value={overview.uniqueVisitors.toLocaleString()} />
          <MetricCard label={t("totalSignups")} value={overview.totalSignups.toLocaleString()} />
          <MetricCard label={t("trialStartRate")} value={`${overview.trialStartRate}%`} />
          <MetricCard label={t("trialConversion")} value={`${overview.trialConversionRate}%`} />
          <MetricCard
            label={t("totalRevenue")}
            value={`${(overview.totalRevenueSek / 100).toLocaleString()} kr`}
          />
          <MetricCard
            label={t("avgSessionDuration")}
            value={formatDuration(overview.avgSessionDurationSeconds)}
          />
        </div>
      )}

      {/* Funnel */}
      <div className="rounded-2xl border border-border-theme bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary-deep">{t("funnelTitle")}</h2>
          <input
            type="text"
            placeholder={t("filterUtmSource")}
            value={utmFilter}
            onChange={(e) => setUtmFilter(e.target.value)}
            className="rounded-lg border border-border-theme bg-background px-3 py-1.5 text-sm text-text-theme placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-deep"
          />
        </div>
        <div className="space-y-3">
          {funnelSteps.map((step, i) => {
            const widthPct = Math.max((step.count / firstFunnelCount) * 100, 2);
            const label = FUNNEL_LABELS[step.name]?.en || step.name;
            return (
              <div key={step.name} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-right text-sm text-text-muted">{label}</div>
                <div className="flex-1">
                  <div
                    className="flex h-9 items-center rounded-lg bg-primary-deep/10 px-3 transition-all"
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="text-sm font-semibold text-primary-deep">
                      {step.count.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-text-muted">
                  {i > 0 && step.conversionRate !== null ? `${step.conversionRate}%` : ""}
                </div>
              </div>
            );
          })}
        </div>
        {funnelSteps.length === 0 && (
          <p className="py-8 text-center text-sm text-text-muted">{t("noData")}</p>
        )}
      </div>

      {/* Visitor Chart */}
      <div className="rounded-2xl border border-border-theme bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold text-primary-deep">{t("visitorsChart")}</h2>
        {visitorPoints.length > 0 ? (
          <div className="flex items-end gap-1" style={{ height: 180 }}>
            {visitorPoints.map((point) => {
              const heightPct = Math.max((point.count / maxVisitors) * 100, 2);
              return (
                <div
                  key={point.date}
                  className="group relative flex-1"
                  style={{ height: "100%" }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-t bg-primary-deep/70 transition-colors group-hover:bg-primary-deep"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-primary-deep px-2 py-1 text-xs text-white group-hover:block">
                    {point.date}: {point.count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-text-muted">{t("noData")}</p>
        )}
      </div>

      {/* Two-column: UTM Sources + Top Pages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* UTM Sources */}
        <div className="rounded-2xl border border-border-theme bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary-deep">{t("utmSources")}</h2>
          {utmEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-theme text-text-muted">
                    <th className="pb-2 font-medium">{t("source")}</th>
                    <th className="pb-2 font-medium">{t("medium")}</th>
                    <th className="pb-2 font-medium">{t("campaign")}</th>
                    <th className="pb-2 text-right font-medium">{t("visitors")}</th>
                  </tr>
                </thead>
                <tbody>
                  {utmEntries.map((entry, i) => (
                    <tr key={i} className="border-b border-border-theme/50 last:border-0">
                      <td className="py-2 text-primary-deep">{entry.source || "—"}</td>
                      <td className="py-2 text-text-muted">{entry.medium || "—"}</td>
                      <td className="py-2 text-text-muted">{entry.campaign || "—"}</td>
                      <td className="py-2 text-right font-medium text-primary-deep">
                        {entry.count.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">{t("noUtmData")}</p>
          )}
        </div>

        {/* Top Pages */}
        <div className="rounded-2xl border border-border-theme bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-primary-deep">{t("topPages")}</h2>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map((page, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 odd:bg-background-subtle"
                >
                  <span className="truncate text-sm text-text-theme">{page.path}</span>
                  <span className="ml-4 shrink-0 text-sm font-medium text-primary-deep">
                    {page.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">{t("noData")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-theme bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-primary-deep">{value}</p>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between">
        <div>
          <div className="h-7 w-40 rounded bg-background-subtle" />
          <div className="mt-2 h-4 w-64 rounded bg-background-subtle" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-12 rounded-lg bg-background-subtle" />
          <div className="h-8 w-12 rounded-lg bg-background-subtle" />
          <div className="h-8 w-12 rounded-lg bg-background-subtle" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-background-subtle" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-background-subtle" />
      <div className="h-48 rounded-2xl bg-background-subtle" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-2xl bg-background-subtle" />
        <div className="h-48 rounded-2xl bg-background-subtle" />
      </div>
    </div>
  );
}
