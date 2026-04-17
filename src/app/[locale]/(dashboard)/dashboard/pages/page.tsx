"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { MY_SITES } from "@/graphql/queries";

interface SiteItem {
  id: string;
  siteData: Record<string, unknown>;
  template: string;
  status: string;
  subdomain: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
  businessName: string | null;
  websiteUrl: string | null;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`}
    />
  );
}

function SiteCard({ site }: { site: SiteItem }) {
  const t = useTranslations("userPages");
  const siteData = site.siteData as {
    business?: { name?: string; tagline?: string };
    branding?: { colors?: { primary?: string } };
    meta?: { title?: string };
  };

  const name =
    site.businessName ||
    siteData?.business?.name ||
    siteData?.meta?.title ||
    "Namnlös sida";
  const tagline = siteData?.business?.tagline || site.websiteUrl || "";
  const primaryColor = siteData?.branding?.colors?.primary || "#2563eb";

  const statusLabel =
    site.status === "PUBLISHED"
      ? t("statusPublished")
      : site.status === "DRAFT"
        ? t("statusDraft")
        : site.status;

  const statusColor =
    site.status === "PUBLISHED"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";

  return (
    <Link
      href={`/dashboard/pages/${site.id}` as "/dashboard"}
      className="group block rounded-2xl border border-border-light bg-white transition-all duration-200 hover:shadow-md hover:border-primary/20"
    >
      {/* Color bar */}
      <div
        className="h-2 rounded-t-2xl"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-primary-deep group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-text-muted">{tagline}</p>
          </div>
          <span
            className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-medium ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {site.views} {t("views")}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(site.updatedAt).toLocaleDateString("sv-SE")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary group-hover:underline">
            {t("editSite")} &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PagesPage() {
  const t = useTranslations("userPages");
  const { data, loading } = useQuery<any>(MY_SITES);

  const sites: SiteItem[] = data?.mySites || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border-light bg-white p-5">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-2xl border border-border-light bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-deep/5">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-deep">{t("noPages")}</h3>
          <p className="mt-2 text-sm text-text-muted">{t("noPagesDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
