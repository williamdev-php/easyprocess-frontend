"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES, GET_SITE_APPS } from "@/graphql/queries";
import { Dropdown } from "@/components/ui";

// ---------------------------------------------------------------------------
// Icons (SVG paths)
// ---------------------------------------------------------------------------
const ICONS = {
  overview: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  editor: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z",
  settings: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  apps: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  domain: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
  billing: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z",
  account: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  help: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z",
  contact: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
  customize: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
  navigation: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
  seo: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z",
  chevronDown: "M19.5 8.25l-7.5 7.5-7.5-7.5",
  blogPost: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  category: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z M6 6h.008v.008H6V6z",
  // Admin icons
  leads: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  users: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.16V14.82M12 9.75a3 3 0 11-6 0 3 3 0 016 0z",
  sites: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  inbox: "M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 0l-.001.027a11.955 11.955 0 01-6.738 2.098 11.955 11.955 0 01-6.738-2.098l-.001-.027m13.478 0A2.223 2.223 0 0016.5 16.5c0-.612-.25-1.167-.652-1.566M2.25 9l8.684-4.632a2.25 2.25 0 012.132 0L21.75 9M2.25 9v10.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9",
  subscriptions: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183",
  revenue: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  analytics: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  adminSettings: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  payments: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
} as const;

// ---------------------------------------------------------------------------
// Helper: render icon
// ---------------------------------------------------------------------------
function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg className={`${className} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helper: sidebar link
// ---------------------------------------------------------------------------
function SidebarLink({
  href, icon, label, active, indent = false, badge,
}: {
  href: string; icon: string; label: string; active: boolean; indent?: boolean; badge?: number;
}) {
  return (
    <Link
      href={href as "/dashboard"}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        indent ? "pl-9" : ""
      } ${
        active
          ? "bg-primary-deep text-white shadow-sm"
          : "text-text-secondary hover:bg-primary-deep/5 hover:text-primary-deep"
      }`}
    >
      <Icon d={icon} className={`h-5 w-5 ${active ? "text-accent" : ""}`} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${
            active
              ? "bg-white/20 text-white"
              : "bg-primary-deep/10 text-primary-deep"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SiteItem {
  id: string;
  siteData: Record<string, unknown>;
  businessName: string | null;
}

interface InstalledApp {
  appSlug: string;
  appName: string;
  sidebarLinks: Array<{ key: string; href_suffix: string; icon: string }> | null;
  requiresPayments: boolean;
}

function getSiteName(site: SiteItem): string {
  const biz = site.siteData?.business as Record<string, string> | undefined;
  return biz?.name || site.businessName || site.id.slice(0, 8);
}

// ---------------------------------------------------------------------------
// Admin nav config (static — no site context needed)
// ---------------------------------------------------------------------------
const adminNav = [
  { key: "overview", href: "/dashboard", icon: ICONS.overview },
  { key: "leads", href: "/dashboard/leads", icon: ICONS.leads },
  { key: "users", href: "/dashboard/users", icon: ICONS.users },
  { key: "sites", href: "/dashboard/sites", icon: ICONS.sites },
  { key: "inbox", href: "/dashboard/inbox", icon: ICONS.inbox },
  { key: "subscriptions", href: "/dashboard/subscriptions", icon: ICONS.subscriptions },
  { key: "revenue", href: "/dashboard/revenue", icon: ICONS.revenue },
  { key: "analytics", href: "/dashboard/analytics", icon: ICONS.analytics },
  { key: "settings", href: "/dashboard/settings", icon: ICONS.adminSettings },
] as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("dashboardNav");
  const isSuperuser = user?.isSuperuser === true;

  // Fetch user's sites
  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    fetchPolicy: "cache-first",
  });
  const sites = sitesData?.mySites ?? [];

  // Selected site — derive from URL or localStorage
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => {
    // Initialize from localStorage synchronously to prevent flash
    try {
      return localStorage.getItem("selectedSiteId");
    } catch {
      return null;
    }
  });

  // Extract siteId from URL (works for /dashboard/pages/[id] and /dashboard/sites/[siteId])
  useEffect(() => {
    const pagesMatch = pathname.match(/^\/dashboard\/pages\/([^/]+)/);
    const sitesMatch = pathname.match(/^\/dashboard\/sites\/([^/]+)/);
    const fromUrl = pagesMatch?.[1] || sitesMatch?.[1];

    if (fromUrl) {
      setSelectedSiteId(fromUrl);
      try { localStorage.setItem("selectedSiteId", fromUrl); } catch {}
    } else if (!selectedSiteId) {
      // Try localStorage, fallback to first site
      try {
        const stored = localStorage.getItem("selectedSiteId");
        if (stored && sites.find((s) => s.id === stored)) {
          setSelectedSiteId(stored);
          return;
        }
      } catch {}
      if (sites.length > 0) {
        setSelectedSiteId(sites[0].id);
      }
    }
  }, [pathname, sites, selectedSiteId]);

  // If selected site no longer exists, reset
  useEffect(() => {
    if (selectedSiteId && sites.length > 0 && !sites.find((s) => s.id === selectedSiteId)) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId]);

  // Fetch installed apps for selected site
  const { data: appsData } = useQuery<{ siteApps: InstalledApp[] }>(GET_SITE_APPS, {
    variables: { siteId: selectedSiteId },
    skip: !selectedSiteId || isSuperuser,
    fetchPolicy: "cache-and-network",
    errorPolicy: "ignore",
  });
  const installedApps = appsData?.siteApps ?? [];
  const hasPaymentApps = installedApps.some((app) => app.requiresPayments);

  function handleSiteChange(newId: string) {
    setSelectedSiteId(newId);
    try { localStorage.setItem("selectedSiteId", newId); } catch {}

    // Navigate to the equivalent page for the new site so the URL-based
    // useEffect doesn't immediately revert the selection.
    if (selectedSiteId && selectedSiteId !== newId) {
      const newPath = pathname
        .replace(`/sites/${selectedSiteId}`, `/sites/${newId}`)
        .replace(`/pages/${selectedSiteId}`, `/pages/${newId}`);
      if (newPath !== pathname) {
        router.push(newPath as "/dashboard");
      }
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  // ----- ADMIN SIDEBAR -----
  if (isSuperuser) {
    return (
      <>
        <aside className="hidden lg:block">
          <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col overflow-y-auto space-y-3 transition-all duration-300 scrollbar-thin">
            <div className="w-52 rounded-2xl border border-border-light bg-white/80 shadow-sm backdrop-blur-sm">
              <nav className="flex flex-col gap-1 p-2">
                {adminNav.map((item) => (
                  <SidebarLink
                    key={item.key}
                    href={item.href}
                    icon={item.icon}
                    label={t(item.key)}
                    active={isActive(item.href)}
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <MobileNav items={adminNav.map((i) => ({ ...i, label: t(i.key) }))} isActive={isActive} />
      </>
    );
  }

  // ----- USER SIDEBAR -----
  const sid = selectedSiteId;
  const hasMultipleSites = sites.length > 1;

  // Memoize site options to prevent unnecessary re-renders / flashes on navigation
  const siteOptions = useMemo(
    () => sites.map((s) => ({ value: s.id, label: getSiteName(s) })),
    [sites],
  );

  // "Customize" section is open when viewing general, editor, settings, code or navigation pages
  const customizeActive = sid
    ? pathname.startsWith(`/dashboard/sites/${sid}/general`) || pathname.startsWith(`/dashboard/pages/${sid}`) || pathname.startsWith(`/dashboard/sites/${sid}/editor`) || pathname.startsWith(`/dashboard/sites/${sid}/settings`) || pathname.startsWith(`/dashboard/sites/${sid}/code`) || pathname.startsWith(`/dashboard/sites/${sid}/navigation`) || pathname.startsWith(`/dashboard/sites/${sid}/seo`) || pathname.startsWith(`/dashboard/sites/${sid}/pages`)
    : false;
  const [customizeOpen, setCustomizeOpen] = useState(customizeActive);

  // Keep section open when navigating to a sub-page
  useEffect(() => {
    if (customizeActive) setCustomizeOpen(true);
  }, [customizeActive]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col space-y-3 overflow-y-auto transition-all duration-300 scrollbar-thin">
          {/* Site selector — only show if multiple sites */}
          {hasMultipleSites && (
            <div className="w-52 shrink-0 rounded-2xl border border-border-light bg-white/80 shadow-sm backdrop-blur-sm">
              <div className="p-2">
                <Dropdown
                  options={siteOptions}
                  value={sid ?? undefined}
                  onChange={handleSiteChange}
                  placeholder={t("selectSite")}
                  fullWidth
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Site navigation */}
          <div className="w-52 shrink-0 rounded-2xl border border-border-light bg-white/80 shadow-sm backdrop-blur-sm">
            <nav className="flex flex-col gap-1 p-2">
              <SidebarLink
                href="/dashboard"
                icon={ICONS.overview}
                label={t("overview")}
                active={pathname === "/dashboard"}
              />

              {sid && (
                <>
                  {/* Customize — collapsible group */}
                  <button
                    onClick={() => setCustomizeOpen((o) => !o)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      customizeActive
                        ? "bg-primary-deep/10 text-primary-deep"
                        : "text-text-secondary hover:bg-primary-deep/5 hover:text-primary-deep"
                    }`}
                  >
                    <Icon d={ICONS.customize} className={`h-5 w-5 ${customizeActive ? "text-primary" : ""}`} />
                    <span className="flex-1 text-left">{t("customize")}</span>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${customizeOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.chevronDown} />
                    </svg>
                  </button>

                  {customizeOpen && (
                    <div className="animate-collapsible-open animate-stagger flex flex-col gap-1">
                      <SidebarLink
                        href={`/dashboard/sites/${sid}/general`}
                        icon={ICONS.overview}
                        label={t("general")}
                        active={pathname === `/dashboard/sites/${sid}/general` || pathname === `/dashboard/sites/${sid}`}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/pages/${sid}`}
                        icon={ICONS.editor}
                        label={t("editor")}
                        active={pathname === `/dashboard/pages/${sid}`}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/pages/${sid}/settings`}
                        icon={ICONS.settings}
                        label={t("siteSettings")}
                        active={pathname.startsWith(`/dashboard/pages/${sid}/settings`)}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/pages/${sid}/code`}
                        icon={ICONS.code}
                        label={t("code")}
                        active={pathname.startsWith(`/dashboard/pages/${sid}/code`)}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/sites/${sid}/navigation`}
                        icon={ICONS.navigation}
                        label={t("navigation")}
                        active={pathname.startsWith(`/dashboard/sites/${sid}/navigation`)}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/sites/${sid}/seo`}
                        icon={ICONS.seo}
                        label={t("seo")}
                        active={pathname.startsWith(`/dashboard/sites/${sid}/seo`)}
                        indent
                      />
                      <SidebarLink
                        href={`/dashboard/sites/${sid}/pages`}
                        icon={ICONS.sites}
                        label={t("sitePages")}
                        active={pathname.startsWith(`/dashboard/sites/${sid}/pages`)}
                        indent
                      />
                    </div>
                  )}

                  {/* Apps — with badge */}
                  <SidebarLink
                    href={`/dashboard/sites/${sid}/apps`}
                    icon={ICONS.apps}
                    label={t("apps")}
                    active={pathname.startsWith(`/dashboard/sites/${sid}/apps`)}
                    badge={installedApps.length}
                  />

                  {/* Installed app sub-links */}
                  {installedApps.map((app) => {
                    const appBase = `/dashboard/sites/${sid}/apps/${app.appSlug}`;
                    return (
                      <div key={app.appSlug} className="animate-collapsible-open">
                        {app.sidebarLinks?.map((link) => (
                          <SidebarLink
                            key={link.key}
                            href={`${appBase}${link.href_suffix}`}
                            icon={link.icon}
                            label={link.key === "posts" ? t("blogPosts") : link.key === "categories" ? t("blogCategories") : link.key === "overview" ? t("bookingsOverview") : link.key === "bookings" ? t("bookingsBookings") : link.key === "form-builder" ? t("bookingsFormBuilder") : link.key === "payment-methods" ? t("bookingsPayments") : link.key}
                            active={pathname.startsWith(`${appBase}${link.href_suffix}`)}
                            indent
                          />
                        ))}
                      </div>
                    );
                  })}
                </>
              )}
            </nav>
          </div>

          {/* Account & settings */}
          <div className="w-52 shrink-0 rounded-2xl border border-border-light bg-white/80 shadow-sm backdrop-blur-sm">
            <nav className="flex flex-col gap-1 p-2">
              <SidebarLink href="/dashboard/domain" icon={ICONS.domain} label={t("domain")} active={isActive("/dashboard/domain")} />
              <SidebarLink href="/dashboard/billing" icon={ICONS.billing} label={t("billing")} active={isActive("/dashboard/billing")} />
              <SidebarLink href="/dashboard/account" icon={ICONS.account} label={t("account")} active={isActive("/dashboard/account")} />
              {hasPaymentApps && (
                <SidebarLink
                  href="/dashboard/payments"
                  icon={ICONS.payments}
                  label={t("payments")}
                  active={isActive("/dashboard/payments")}
                />
              )}
              <SidebarLink
                href="/dashboard/contact"
                icon={ICONS.contact}
                label={t("contactUs")}
                active={pathname.startsWith("/dashboard/contact")}
              />
              <SidebarLink
                href="/help"
                icon={ICONS.help}
                label={t("helpCenter")}
                active={pathname.startsWith("/help")}
              />
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <MobileNav
        items={[
          { href: "/dashboard", icon: ICONS.overview, label: t("overview") },
          ...(sid ? [
            { href: `/dashboard/pages/${sid}`, icon: ICONS.customize, label: t("customize") },
            { href: `/dashboard/sites/${sid}/apps`, icon: ICONS.apps, label: t("apps") },
          ] : []),
          { href: "/dashboard/account", icon: ICONS.account, label: t("account") },
        ]}
        isActive={isActive}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile bottom nav
// ---------------------------------------------------------------------------
function MobileNav({
  items,
  isActive,
}: {
  items: Array<{ href: string; icon: string; label: string }>;
  isActive: (href: string) => boolean;
}) {
  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed mobile nav */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-white/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as "/dashboard"}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary-deep" : "text-text-muted"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary-deep/10" : ""}`}>
                  <Icon d={item.icon} className={`h-5 w-5 ${active ? "" : ""}`} />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
