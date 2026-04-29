"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES } from "@/graphql/queries";

interface SiteItem {
  id: string;
  siteData: Record<string, unknown>;
  businessName: string | null;
  subdomain: string | null;
  status: string;
}

function getSiteName(site: SiteItem): string {
  const biz = site.siteData?.business as Record<string, string> | undefined;
  return biz?.name || site.businessName || site.id.slice(0, 8);
}

function getSiteInitial(site: SiteItem): string {
  return getSiteName(site).charAt(0).toUpperCase();
}

function getSitePrimaryColor(site: SiteItem): string {
  const branding = site.siteData?.branding as Record<string, Record<string, string>> | undefined;
  return branding?.colors?.primary || "#326586";
}

function getStatusLabel(status: string, t: ReturnType<typeof useTranslations>): string {
  const map: Record<string, string> = {
    PUBLISHED: t("statusPublished"),
    DRAFT: t("statusDraft"),
    PAUSED: t("statusPaused"),
    ARCHIVED: t("statusArchived"),
  };
  return map[status] || status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-500",
    DRAFT: "bg-amber-500",
    PAUSED: "bg-orange-500",
    ARCHIVED: "bg-gray-400",
  };
  return map[status] || "bg-gray-400";
}

export default function SelectSitePage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("selectSite");

  const { data: sitesData, loading } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    fetchPolicy: "cache-and-network",
  });
  const sites = sitesData?.mySites ?? [];

  // If only 1 site, redirect directly to dashboard
  useEffect(() => {
    if (!loading && sites.length === 1) {
      const siteId = sites[0].id;
      try { localStorage.setItem("selectedSiteId", siteId); } catch {}
      router.replace(`/dashboard/sites/${siteId}/general` as "/dashboard");
    }
  }, [loading, sites, router]);

  // If no sites, redirect to dashboard (which shows create wizard)
  useEffect(() => {
    if (!loading && sites.length === 0) {
      router.replace("/dashboard" as "/dashboard");
    }
  }, [loading, sites, router]);

  function handleSelectSite(siteId: string) {
    try { localStorage.setItem("selectedSiteId", siteId); } catch {}
    router.push(`/dashboard/sites/${siteId}/general` as "/dashboard");
  }

  if (loading || sites.length <= 1) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border-light border-t-primary-deep" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-8 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-deep sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 animate-stagger">
        {sites.map((site) => {
          const name = getSiteName(site);
          const color = getSitePrimaryColor(site);
          const logoUrl = (site.siteData?.branding as Record<string, string> | undefined)?.logo_url;
          const tagline = (site.siteData?.business as Record<string, string> | undefined)?.tagline;

          return (
            <button
              key={site.id}
              onClick={() => handleSelectSite(site.id)}
              className="group flex items-start gap-4 rounded-2xl border-2 border-border-light bg-white p-5 text-left shadow-sm transition-all hover:border-primary-deep/30 hover:shadow-md active:scale-[0.98]"
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl border border-border-light object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {getSiteInitial(site)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-primary-deep group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(site.status)}`} />
                    {getStatusLabel(site.status, t)}
                  </span>
                </div>
                {tagline && (
                  <p className="mt-0.5 truncate text-sm text-text-muted">{tagline}</p>
                )}
                {site.subdomain && (
                  <p className="mt-1 text-xs text-text-muted/70">{site.subdomain}.qvickosite.com</p>
                )}
              </div>
              <svg className="h-5 w-5 shrink-0 text-text-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
