"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES, GET_SITE_ANALYTICS, GET_DASHBOARD_STATS, GET_OUTREACH_STATS, GET_ADMIN_USER_STATS, MY_SUBSCRIPTION, MY_DOMAINS, GET_SITE_APPS, MY_GSC_CONNECTION } from "@/graphql/queries";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useGreeting } from "@/hooks/use-greeting";
import Link from "next/link";

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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [show]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((v) => !v)}
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
      className={`rounded-2xl border border-border-light bg-white p-5 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        {tooltip ? (
          <Tooltip text={tooltip}>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5 cursor-help transition-colors hover:bg-primary-deep/10"
              role="button"
              tabIndex={0}
              aria-label={`${label}: ${tooltip}`}
            >
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
  const { data: userStatsData } = useQuery<any>(GET_ADMIN_USER_STATS, {
    fetchPolicy: "cache-and-network",
  });

  const stats = statsData?.dashboardStats;
  const outreach = outreachData?.outreachStats;
  const userStats = userStatsData?.adminUserStats;

  if (statsLoading) return <OverviewSkeleton />;

  return (
    <div className="space-y-6 animate-page-enter">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Platform stats */}
      {userStats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
          <MetricCard
            label={t("totalUsers")}
            value={String(userStats.totalUsers)}
            change={`+${userStats.newUsers30d} ${t("last30d")}`}
            icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.16V14.82"
          />
          <MetricCard
            label={t("totalSitesLabel")}
            value={String(stats?.totalSites ?? 0)}
            change={`${stats?.totalViews ?? 0} ${t("views")}`}
            icon="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            delay={100}
          />
          <MetricCard
            label={t("verifiedLabel")}
            value={String(userStats.verifiedUsers)}
            change={`${userStats.activeUsers} ${t("active")}`}
            icon="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            delay={200}
          />
          <MetricCard
            label={t("aiCostLabel")}
            value={`$${(stats?.totalAiCostUsd ?? 0).toFixed(2)}`}
            change={`${stats?.totalEmailsSent ?? 0} ${t("emailsSent")}`}
            icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            delay={300}
          />
        </div>
      )}

      {/* Lead pipeline stats */}
      <div className="grid gap-4 sm:grid-cols-3 animate-stagger">
        <MetricCard
          label={t("totalLeads")}
          value={String(stats?.totalLeads ?? 0)}
          change={`${stats?.leadsGenerated ?? 0} ${t("generated")}`}
          icon="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
        <MetricCard
          label={t("outreach30d")}
          value={String(outreach?.emailsSent30d ?? stats?.outreachSent30d ?? 0)}
          change={outreach ? `${outreach.openRate}% ${t("opened")}` : "—"}
          icon="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          delay={100}
        />
        <MetricCard
          label={t("conversions30d")}
          value={String(outreach?.conversions30d ?? stats?.outreachConversions30d ?? 0)}
          change={outreach ? `${outreach.replyRate}% ${t("replies")}` : "—"}
          icon="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          delay={200}
        />
      </div>

      {/* Outreach performance bar */}
      {outreach && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-primary-deep">{t("outreachPerformance")}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-sm">
            <div>
              <span className="text-text-muted">{t("replyRateLabel")}</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.replyRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">{t("clickRate")}</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.clickRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">{t("bounceRate")}</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.bounceRate}%</p>
            </div>
            <div>
              <span className="text-text-muted">{t("dailySend")}</span>
              <p className="text-xl font-bold text-primary-deep">{outreach.dailySendCount}/{outreach.dailySendLimit}</p>
            </div>
            <div>
              <span className="text-text-muted">{t("warmupLabel")}</span>
              <p className={`text-sm font-semibold ${outreach.warmupStatus === "warmed" ? "text-green-700" : "text-amber-700"}`}>
                {outreach.warmupStatus === "warmed" ? t("warmupDone") : `${t("warmupDayLabel")} ${outreach.warmupDay}/${outreach.warmupDaysTarget}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline overview */}
      {stats && (
        <div className="rounded-2xl border border-border-light bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-primary-deep">{t("pipeline")}</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: t("pipelineNew"), value: stats.leadsNew, color: "bg-blue-100 text-blue-700" },
              { label: t("pipelineScraped"), value: stats.leadsScraped, color: "bg-indigo-100 text-indigo-700" },
              { label: t("pipelineGenerated"), value: stats.leadsGenerated, color: "bg-emerald-100 text-emerald-700" },
              { label: t("pipelineSent"), value: stats.leadsEmailSent, color: "bg-cyan-100 text-cyan-700" },
              { label: t("pipelineConverted"), value: stats.leadsConverted, color: "bg-green-100 text-green-800" },
              { label: t("pipelineFailed"), value: stats.leadsFailed, color: "bg-red-100 text-red-700" },
              { label: t("pipelineAiCost"), value: `$${(stats.totalAiCostUsd ?? 0).toFixed(2)}`, color: "bg-purple-100 text-purple-700" },
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

/* ──────────────── Onboarding Checklist ──────────────── */

interface ChecklistItem {
  key: string;
  completed: boolean;
  href: string;
}

function OnboardingChecklist({
  siteId,
  locale,
}: {
  siteId: string | null;
  locale: string;
}) {
  const { user } = useAuth();
  const t = useTranslations("dashboardOverview.checklist");

  const { data: subData } = useQuery<{
    mySubscription: { id: string; status: string } | null;
  }>(MY_SUBSCRIPTION, { fetchPolicy: "cache-and-network" });

  const { data: domainsData } = useQuery<{
    myDomains: Array<{ id: string; status: string; verifiedAt: string | null }>;
  }>(MY_DOMAINS, { fetchPolicy: "cache-and-network" });

  const { data: sitesData } = useQuery<{
    mySites: Array<{ id: string; status: string }>;
  }>(MY_SITES, { fetchPolicy: "cache-and-network" });

  const { data: appsData } = useQuery<{
    siteApps: Array<{ id: string; isActive: boolean }>;
  }>(GET_SITE_APPS, {
    variables: { siteId },
    skip: !siteId,
    fetchPolicy: "cache-and-network",
  });

  const { data: gscData, refetch: refetchGsc } = useQuery<{
    myGscConnection: {
      connected: boolean;
      googleEmail: string | null;
      indexedDomain: string | null;
      indexedAt: string | null;
      status: string | null;
    };
  }>(MY_GSC_CONNECTION, { fetchPolicy: "cache-and-network" });

  // Auto-detect completion
  const hasCompanyInfo = !!(user?.companyName && user.companyName.trim().length > 0);
  const hasPlan = !!(
    subData?.mySubscription &&
    ["active", "trialing"].includes(subData.mySubscription.status)
  );
  const isPublished = !!(
    siteId && sitesData?.mySites?.find((s) => s.id === siteId)?.status === "PUBLISHED"
  );
  const hasVerifiedDomain = !!(
    domainsData?.myDomains?.some((d) => d.verifiedAt)
  );
  const hasApps = !!(appsData?.siteApps && appsData.siteApps.length > 0);
  const gscConnected = !!(gscData?.myGscConnection?.connected);

  const prefix = `/${locale}/dashboard`;

  const items: ChecklistItem[] = [
    { key: "companyInfo", completed: hasCompanyInfo, href: `${prefix}/account` },
    { key: "choosePlan", completed: hasPlan, href: `${prefix}/billing` },
    { key: "publishSite", completed: isPublished, href: siteId ? `${prefix}/sites/${siteId}` : `${prefix}/sites` },
    { key: "customDomain", completed: hasVerifiedDomain, href: `${prefix}/domain` },
    { key: "searchConsole", completed: gscConnected, href: "#" },
    { key: "installApps", completed: hasApps, href: siteId ? `${prefix}/sites/${siteId}/apps` : `${prefix}/sites` },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount;

  // Expanded item state
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleItem = useCallback((key: string) => {
    setExpandedItem((prev) => (prev === key ? null : key));
  }, []);

  // Collapsed state
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("onboarding_checklist_collapsed");
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem("onboarding_checklist_collapsed", String(!prev));
      return !prev;
    });
  }, []);

  return (
    <div className="rounded-2xl border border-border-light bg-white overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleCollapsed}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-primary-deep/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-deep/5">
            <svg className="h-[18px] w-[18px] text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-deep">{t("title")}</h3>
            <p className="text-xs text-text-muted">
              {t("progress", { completed: completedCount, total: totalCount })}
            </p>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-text-muted transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="px-5">
        <div className="h-1.5 w-full rounded-full bg-border-light overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-deep to-primary transition-all duration-700 ease-out"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="px-5 pb-5 pt-4 space-y-1">
          {items.map((item) => {
            const isGsc = item.key === "searchConsole";
            const isExpanded = expandedItem === item.key;
            return (
              <div
                key={item.key}
                className={`rounded-xl transition-all duration-300 ${
                  item.completed
                    ? "bg-primary-deep/5"
                    : isExpanded
                    ? "bg-primary-deep/[0.03]"
                    : "hover:bg-primary-deep/[0.03]"
                }`}
              >
                {/* Row */}
                <button
                  onClick={() => toggleItem(item.key)}
                  className="group flex w-full items-center gap-3 px-3 py-2.5 text-left"
                >
                  {/* Checkbox */}
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
                      item.completed
                        ? "border-primary bg-primary"
                        : "border-border-light"
                    }`}
                  >
                    {item.completed && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>

                  {/* Label */}
                  <span
                    className={`flex-1 text-sm transition-colors ${
                      item.completed
                        ? "text-primary line-through decoration-primary/30"
                        : "text-primary-deep"
                    }`}
                  >
                    {t(item.key)}
                  </span>

                  {/* Completed badge */}
                  {item.completed && (
                    <span className="text-[10px] font-medium text-primary">{t("done")}</span>
                  )}

                  {/* Chevron */}
                  <svg
                    className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-3 pb-3 pl-11 animate-tooltip-in">
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`${item.key}Desc`)}
                    </p>
                    {isGsc ? (
                      <GscActions
                        connected={gscConnected}
                        googleEmail={gscData?.myGscConnection?.googleEmail ?? null}
                        indexedDomain={gscData?.myGscConnection?.indexedDomain ?? null}
                        hasVerifiedDomain={hasVerifiedDomain}
                        onUpdate={refetchGsc}
                      />
                    ) : (
                      !item.completed && item.href !== "#" && (
                        <Link
                          href={item.href}
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-deep transition-colors"
                        >
                          {t("goTo")}
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {allDone && (
            <div className="mt-3 rounded-xl bg-primary-deep/5 px-4 py-3 text-center">
              <p className="text-sm font-medium text-primary-deep">{t("allDone")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────── GSC Actions (inside checklist) ──────────────── */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

function GscActions({
  connected,
  googleEmail,
  indexedDomain,
  hasVerifiedDomain,
  onUpdate,
}: {
  connected: boolean;
  googleEmail: string | null;
  indexedDomain: string | null;
  hasVerifiedDomain: boolean;
  onUpdate: () => void;
}) {
  const t = useTranslations("dashboardOverview.checklist");
  const [loading, setLoading] = useState(false);

  const handleConnect = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/userinfo.email",
      access_type: "offline",
      prompt: "consent",
    });

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      "gsc-connect",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) return;
    setLoading(true);

    const interval = setInterval(async () => {
      try {
        if (popup.closed) {
          clearInterval(interval);
          setLoading(false);
          return;
        }
        const url = popup.location.href;
        if (url && url.includes("code=")) {
          const searchParams = new URL(url).searchParams;
          const code = searchParams.get("code");
          popup.close();
          clearInterval(interval);
          if (code) {
            try {
              const { connectGsc } = await import("@/lib/api");
              const { getAccessToken } = await import("@/lib/auth-context");
              const token = getAccessToken();
              if (token) {
                await connectGsc(code, redirectUri, token);
                onUpdate();
              }
            } catch (err) {
              console.error("GSC connect failed:", err);
            }
          }
          setLoading(false);
        }
      } catch {
        // Cross-origin — popup hasn't redirected back yet
      }
    }, 200);
  }, [onUpdate]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    try {
      const { disconnectGsc } = await import("@/lib/api");
      const { getAccessToken } = await import("@/lib/auth-context");
      const token = getAccessToken();
      if (token) {
        await disconnectGsc(token);
        onUpdate();
      }
    } catch (err) {
      console.error("GSC disconnect failed:", err);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  const handleReindex = useCallback(async () => {
    setLoading(true);
    try {
      const { triggerGscIndex } = await import("@/lib/api");
      const { getAccessToken } = await import("@/lib/auth-context");
      const token = getAccessToken();
      if (token) {
        await triggerGscIndex(token);
        onUpdate();
      }
    } catch (err) {
      console.error("GSC re-index failed:", err);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  if (!hasVerifiedDomain) {
    return (
      <p className="mt-2 text-xs text-amber-600">
        {t("searchConsoleNeedsDomain")}
      </p>
    );
  }

  if (connected) {
    return (
      <div className="mt-2 space-y-2">
        {googleEmail && (
          <p className="text-xs text-text-muted">
            {t("searchConsoleConnected", { email: googleEmail })}
          </p>
        )}
        {indexedDomain && (
          <p className="text-xs text-emerald-600">
            {t("searchConsoleIndexed", { domain: indexedDomain })}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleReindex}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-primary-deep transition hover:bg-primary-deep/5 disabled:opacity-50"
          >
            {t("searchConsoleReindex")}
          </button>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {t("searchConsoleDisconnect")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading || !GOOGLE_CLIENT_ID}
      className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary-deep px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {t("searchConsoleConnect")}
    </button>
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
  const firstName = user?.fullName?.split(" ")[0] || "";
  const { greeting, subtitle: greetingSubtitle } = useGreeting(firstName);

  // Get user's sites
  const { data: sitesData, loading: sitesLoading } = useQuery<{ mySites: Array<SiteOption> }>(MY_SITES);

  const sites: SiteOption[] = useMemo(() => sitesData?.mySites ?? [], [sitesData]);

  // Read selected site from localStorage (set by the sidebar site selector)
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      try {
        const stored = localStorage.getItem("selectedSiteId");
        if (stored && sites.find((s) => s.id === stored)) {
          setSiteId(stored);
          return;
        }
      } catch {}
      if (sites.length > 0) setSiteId(sites[0].id);
    }
    sync();
    // Listen for storage changes from other components (sidebar)
    window.addEventListener("storage", sync);
    // Also poll briefly since same-tab localStorage writes don't fire 'storage'
    const interval = setInterval(sync, 500);
    return () => { window.removeEventListener("storage", sync); clearInterval(interval); };
  }, [sites]);

  // Fetch analytics for selected site
  const { data: analyticsData, loading: analyticsLoading } = useQuery<{ siteAnalytics: { totalPageViews: number; totalVisitors: number; pagesPerSession: number; performanceScore: number; visitorsChangePct: number; pagesPerSessionPrev: number; performanceScorePrev: number; daily: Array<{ date: string; visitors: number; pageViews: number }> } }>(
    GET_SITE_ANALYTICS,
    {
      variables: { siteId, days: 7 },
      skip: !siteId,
      fetchPolicy: "cache-and-network",
    }
  );

  // Track when data was last synced
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  useEffect(() => {
    if (analyticsData && !analyticsLoading) {
      setLastSynced(new Date());
    }
  }, [analyticsData, analyticsLoading]);

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
    <div className="space-y-6 animate-page-enter">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">
            {greeting}
          </h2>
          <p className="mt-1 text-text-muted">{greetingSubtitle}</p>
        </div>

        {/* Last synced indicator */}
        {lastSynced && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            <span>
              {locale === "sv" ? "Senast synkad" : "Last synced"}{" "}
              {lastSynced.toLocaleTimeString(locale === "sv" ? "sv-SE" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {!siteId ? (
        <div className="rounded-2xl border border-border-light bg-white p-8 text-center">
          <p className="text-text-muted">{t("noData")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 animate-stagger">
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

      <OnboardingChecklist siteId={siteId} locale={locale} />

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
