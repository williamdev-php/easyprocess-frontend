"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES, GET_SITE_ANALYTICS, GET_DASHBOARD_STATS, GET_OUTREACH_STATS } from "@/graphql/queries";
import { useState, useEffect, useRef, useMemo } from "react";

/* ──────────────── Skeleton shimmer ──────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="mb-1 h-8 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <Skeleton className="mb-4 h-5 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
            <Skeleton className="mb-2 h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────── Tooltip ──────────────── */

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full right-0 mb-2 z-10 w-56 rounded-xl bg-primary-deep px-3 py-2 text-xs text-white shadow-lg animate-tooltip-in">
          {text}
          <div className="absolute top-full right-3 h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-primary-deep" />
        </div>
      )}
    </div>
  );
}

/* ──────────────── Metric Card ──────────────── */

function MetricCard({
  label,
  value,
  change,
  icon,
  tooltip,
  delay = 0,
}: {
  label: string;
  value: string;
  change: string;
  icon: string;
  tooltip?: string;
  delay?: number;
}) {
  const isPositive = change.startsWith("+");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`rounded-2xl border border-border-light bg-white p-5 transition-all duration-500 hover:shadow-md ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {tooltip ? (
          <Tooltip text={tooltip}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5 cursor-help transition-colors hover:bg-primary-deep/10">
              <svg
                className="h-[18px] w-[18px] text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
          </Tooltip>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
            <svg
              className="h-[18px] w-[18px] text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-primary-deep">{value}</p>
      <p
        className={`mt-1 text-xs font-medium ${
          isPositive ? "text-emerald-600" : "text-text-muted"
        }`}
      >
        {change}
      </p>
    </div>
  );
}

/* ──────────────── Mini bar chart (visitors) ──────────────── */

interface DailyPoint {
  date: string;
  visitors: number;
  pageViews: number;
}

const DAY_LABELS_SV = ["Son", "Man", "Tis", "Ons", "Tor", "Fre", "Lor"];
const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function VisitorChart({
  title,
  daily,
  locale,
}: {
  title: string;
  daily: DailyPoint[];
  locale: string;
}) {
  const dayLabels = locale === "sv" ? DAY_LABELS_SV : DAY_LABELS_EN;
  const max = Math.max(...daily.map((d) => d.visitors), 1);
  const [animated, setAnimated] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-border-light bg-white p-6">
      <h3 className="mb-6 text-sm font-semibold text-primary-deep">{title}</h3>
      <div className="flex items-end gap-3 h-48">
        {daily.map((d, i) => {
          const dateObj = new Date(d.date + "T00:00:00");
          const dayLabel = dayLabels[dateObj.getDay()];
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="relative w-full flex justify-center"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === i && (
                  <div className="absolute -top-8 rounded-lg bg-primary-deep px-2 py-1 text-[11px] font-medium text-white shadow-md animate-tooltip-in z-10">
                    {d.visitors}
                  </div>
                )}
                <div
                  className={`w-full max-w-[36px] rounded-lg bg-gradient-to-t from-primary-deep to-primary transition-all duration-700 ease-out cursor-pointer ${
                    hoveredBar === i ? "brightness-110 scale-105" : ""
                  }`}
                  style={{
                    height: animated
                      ? `${(d.visitors / max) * 160}px`
                      : "0px",
                    minHeight: animated && d.visitors > 0 ? "4px" : "0px",
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-text-muted">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────── Tip card ──────────────── */

function TipCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border-light bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/40">
        <svg
          className="h-5 w-5 text-primary-deep"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <h4 className="text-sm font-semibold text-primary-deep">{title}</h4>
      <p className="mt-1 text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

/* ──────────────── Format helpers ──────────────── */

function formatNumber(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return n.toLocaleString("sv-SE");
  return String(n);
}

function formatChange(value: number, type: "pct" | "abs"): string {
  const sign = value >= 0 ? "+" : "";
  if (type === "pct") return `${sign}${Math.round(value)}%`;
  return `${sign}${value}`;
}

/* ──────────────── Admin Overview ──────────────── */

function AdminOverview() {
  const t = useTranslations("dashboardOverview.admin");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const { data: statsData, loading: statsLoading } = useQuery<any>(GET_DASHBOARD_STATS, {
    fetchPolicy: "cache-and-network",
  });
  const { data: outreachData } = useQuery<any>(GET_OUTREACH_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData?.dashboardStats;
  const outreach = outreachData?.outreachStats;

  if (statsLoading) return <OverviewSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Lead pipeline stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={t("totalLeads")}
          value={String(stats?.totalLeads ?? 0)}
          change={`${stats?.leadsGenerated ?? 0} genererade`}
          icon="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
        <MetricCard
          label="Utskick (30d)"
          value={String(outreach?.emailsSent30d ?? stats?.outreachSent30d ?? 0)}
          change={outreach ? `${outreach.openRate}% oppnade` : "—"}
          icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          delay={100}
        />
        <MetricCard
          label="Konverteringar (30d)"
          value={String(outreach?.conversions30d ?? stats?.outreachConversions30d ?? 0)}
          change={outreach ? `${outreach.replyRate}% svar` : "—"}
          icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          delay={200}
        />
      </div>

      {/* Outreach performance bar */}
      {outreach && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary-deep">Outreach-prestanda</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-sm">
            <div>
              <span className="text-text-muted">Svarsfrekvens</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.replyRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">Klickfrekvens</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.clickRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">Bounce-frekvens</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.bounceRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">Dagligt utskick</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.dailySendCount}/{outreach.dailySendLimit}</p>
            </div>
            <div>
              <span className="text-text-muted">Uppvarmning</span>
              <p className={`text-sm font-semibold ${outreach.warmupStatus === "warmed" ? "text-green-700" : "text-amber-700"}`}>
                {outreach.warmupStatus === "warmed" ? "Klar" : `Dag ${outreach.warmupDay}/${outreach.warmupDaysTarget}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline overview */}
      {stats && (
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">Pipeline</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: "Nya", value: stats.leadsNew, color: "bg-blue-100 text-blue-700" },
              { label: "Skrapade", value: stats.leadsScraped, color: "bg-indigo-100 text-indigo-700" },
              { label: "Genererade", value: stats.leadsGenerated, color: "bg-emerald-100 text-emerald-700" },
              { label: "Skickade", value: stats.leadsEmailSent, color: "bg-cyan-100 text-cyan-700" },
              { label: "Konverterade", value: stats.leadsConverted, color: "bg-green-100 text-green-800" },
              { label: "Misslyckade", value: stats.leadsFailed, color: "bg-red-100 text-red-700" },
              { label: "AI-kostnad", value: `$${(stats.totalAiCostUsd ?? 0).toFixed(2)}`, color: "bg-purple-100 text-purple-700" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${item.color}`}>
                  {item.value}
                </span>
                <p className="mt-1 text-xs text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────── User Overview (real data) ──────────────── */

interface SiteOption {
  id: string;
  businessName?: string;
  subdomain?: string;
}

function UserOverview() {
  const { user } = useAuth();
  const t = useTranslations("dashboardOverview.user");

  // First, get user's sites to find the site ID
  const { data: sitesData, loading: sitesLoading } = useQuery<{ mySites: Array<SiteOption> }>(MY_SITES);

  const sites: SiteOption[] = useMemo(() => sitesData?.mySites ?? [], [sitesData]);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Auto-select first site when sites load (or if selected site disappears)
  useEffect(() => {
    if (sites.length > 0 && (!selectedSiteId || !sites.find((s) => s.id === selectedSiteId))) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  const siteId = selectedSiteId;

  // Fetch analytics for selected site
  const { data: analyticsData, loading: analyticsLoading } = useQuery<{ siteAnalytics: { totalPageViews: number; totalVisitors: number; pagesPerSession: number; performanceScore: number; visitorsChangePct: number; pagesPerSessionPrev: number; performanceScorePrev: number; daily: Array<{ date: string; visitors: number; pageViews: number }> } }>(
    GET_SITE_ANALYTICS,
    {
      variables: { siteId, days: 7 },
      skip: !siteId,
      fetchPolicy: "cache-and-network",
    }
  );

  const loading = sitesLoading || analyticsLoading;
  const analytics = analyticsData?.siteAnalytics;
  const hasData = analytics && analytics.totalPageViews > 0;

  // Locale detection from URL
  const locale =
    typeof window !== "undefined" && window.location.pathname.startsWith("/sv")
      ? "sv"
      : "en";

  // Format metric values
  const visitorsValue = analytics ? formatNumber(analytics.totalVisitors) : "—";
  const ppsValue = analytics ? String(analytics.pagesPerSession) : "—";
  const perfValue = analytics ? String(analytics.performanceScore) : "—";

  const visitorsChange = analytics
    ? formatChange(analytics.visitorsChangePct, "pct") + " " + t("changePct", { value: "" }).replace(" ", "").trim()
    : "—";
  const visitorsChangeStr = analytics
    ? `${formatChange(analytics.visitorsChangePct, "pct")}`
    : "—";

  const ppsChange = analytics
    ? formatChange(
        Math.round((analytics.pagesPerSession - analytics.pagesPerSessionPrev) * 10) / 10,
        "abs"
      )
    : "—";

  const perfChange = analytics
    ? formatChange(
        analytics.performanceScore - analytics.performanceScorePrev,
        "abs"
      )
    : "—";

  if (loading) {
    return <OverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">
            {t("greeting", { name: user?.fullName?.split(" ")[0] || "" })}
          </h2>
          <p className="mt-1 text-text-muted">{t("subtitle")}</p>
        </div>

        {sites.length > 1 && (
          <select
            value={siteId ?? ""}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="rounded-xl border border-border-light bg-white px-4 py-2 text-sm font-medium text-primary-deep shadow-sm transition-colors hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.businessName || s.subdomain || s.id}
              </option>
            ))}
          </select>
        )}
      </div>

      {!siteId ? (
        <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
          <p className="text-text-muted">{t("noData")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label={t("visitors")}
              value={visitorsValue}
              change={visitorsChangeStr}
              icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.16V14.82"
              tooltip={t("visitorsTooltip")}
              delay={0}
            />
            <MetricCard
              label={t("pagesPerSession")}
              value={ppsValue}
              change={ppsChange}
              icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              tooltip={t("pagesPerSessionTooltip")}
              delay={100}
            />
            <MetricCard
              label={t("performanceScore")}
              value={perfValue}
              change={perfChange}
              icon="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              tooltip={t("performanceTooltip")}
              delay={200}
            />
          </div>

          {hasData && analytics.daily?.length > 0 && (
            <VisitorChart
              title={t("visitorsChart")}
              daily={analytics.daily}
              locale={locale}
            />
          )}

          {!hasData && (
            <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
              <p className="text-text-muted">{t("noData")}</p>
            </div>
          )}
        </>
      )}

      <div>
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">
          {t("tipsTitle")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TipCard
            title={t("tip1Title")}
            description={t("tip1Desc")}
            icon="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
          <TipCard
            title={t("tip2Title")}
            description={t("tip2Desc")}
            icon="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Main page ──────────────── */

import { EmailVerificationAlert } from "@/components/email-verification-alert";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      const timer = setTimeout(() => setReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user]);

  if (!ready) {
    return <OverviewSkeleton />;
  }

  return (
    <>
      <EmailVerificationAlert />
      {user?.isSuperuser ? <AdminOverview /> : <UserOverview />}
    </>
  );
}
