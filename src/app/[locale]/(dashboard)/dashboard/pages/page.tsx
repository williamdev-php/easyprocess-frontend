"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import SubscribeDialog from "@/components/subscribe-dialog";
import { MY_SITES, MY_SUBSCRIPTION } from "@/graphql/queries";
import { PUBLISH_SITE } from "@/graphql/mutations";

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

function SiteCard({
  site,
  hasSubscription,
  onPublish,
  publishing,
}: {
  site: SiteItem;
  hasSubscription: boolean;
  onPublish: (siteId: string) => void;
  publishing: string | null;
}) {
  const t = useTranslations("userPages");
  const siteData = site.siteData as {
    business?: { name?: string; tagline?: string };
    branding?: { logo_url?: string; colors?: { primary?: string } };
    meta?: { title?: string; favicon_url?: string; og_image?: string };
    hero?: { background_image?: string; headline?: string; subtitle?: string };
    about?: { image?: string };
    gallery?: { images?: Array<{ url?: string }> };
    team?: { members?: Array<{ image?: string }> };
  };

  const faviconUrl = siteData?.meta?.favicon_url;
  const previewImage =
    siteData?.meta?.og_image ||
    siteData?.hero?.background_image ||
    siteData?.about?.image ||
    siteData?.gallery?.images?.find((img) => img.url)?.url ||
    siteData?.team?.members?.find((m) => m.image)?.image ||
    siteData?.branding?.logo_url ||
    null;

  const name =
    site.businessName ||
    siteData?.business?.name ||
    siteData?.meta?.title ||
    "Namnlös sida";
  const tagline = siteData?.business?.tagline || siteData?.hero?.subtitle || site.websiteUrl || "";
  const primaryColor = siteData?.branding?.colors?.primary || "#326586";

  const isPublished = site.status === "PUBLISHED";
  const isDraft = site.status === "DRAFT";
  const isPublishing = publishing === site.id;

  const statusLabel = isPublished ? t("statusPublished") : isDraft ? t("statusDraft") : site.status;
  const statusStyles = isPublished
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

  const siteUrl = site.subdomain ? `https://${site.subdomain}.qvickosite.com` : null;

  return (
    <div className="group rounded-2xl border border-border-light bg-white transition-all duration-200 hover:shadow-md hover:border-primary/20 overflow-hidden">
      {/* Preview area */}
      <div className="relative h-44 bg-gradient-to-br from-primary-deep/5 to-primary/5 overflow-hidden">
        {previewImage ? (
          <img
            src={previewImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: primaryColor + "15" }}
              >
                <svg className="h-6 w-6" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                </svg>
              </div>
              <p className="text-xs text-text-muted">{t("noPreview")}</p>
            </div>
          </div>
        )}

        {/* Color accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Status badge overlay */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${statusStyles}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          {faviconUrl ? (
            <img
              src={faviconUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-lg mt-0.5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="h-8 w-8 shrink-0 rounded-lg mt-0.5"
              style={{ backgroundColor: primaryColor + "20" }}
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-primary-deep group-hover:text-primary transition-colors">
              {name}
            </h3>
            {tagline && (
              <p className="mt-0.5 truncate text-sm text-text-muted">{tagline}</p>
            )}
          </div>
        </div>

        {/* Meta info */}
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

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/dashboard/pages/${site.id}` as "/dashboard"}
            className="flex-1"
          >
            <Button variant="outline" size="sm" fullWidth>
              {t("editSite")}
            </Button>
          </Link>

          {/* Preview (eye icon) */}
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" title={t("visitSite")}>
              <Button variant="ghost" size="sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </a>
          )}

          {isDraft && (
            <Button
              variant="primary"
              size="sm"
              disabled={isPublishing}
              onClick={(e) => {
                e.preventDefault();
                onPublish(site.id);
              }}
            >
              {isPublishing ? (
                <span className="flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("publishing")}
                </span>
              ) : (
                t("publishSite")
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  const t = useTranslations("userPages");
  const { data, loading } = useQuery<any>(MY_SITES);
  const { data: subData, refetch: refetchSub } = useQuery<any>(MY_SUBSCRIPTION);
  const [publishSiteMut] = useMutation(PUBLISH_SITE);

  const [publishing, setPublishing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [pendingPublishSiteId, setPendingPublishSiteId] = useState<string | null>(null);

  const sites: SiteItem[] = data?.mySites || [];
  const hasSubscription = !!subData?.mySubscription;

  const handlePublish = async (siteId: string) => {
    if (!hasSubscription) {
      setPendingPublishSiteId(siteId);
      setShowSubscribeDialog(true);
      return;
    }

    await doPublish(siteId);
  };

  const doPublish = async (siteId: string) => {
    setPublishing(siteId);
    try {
      await publishSiteMut({ variables: { siteId } });
      setMessage({ type: "success", text: t("publishSuccess") });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setMessage({ type: "error", text: msg });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setPublishing(null);
    }
  };

  const handleSubscribed = async () => {
    setShowSubscribeDialog(false);
    await refetchSub();
    if (pendingPublishSiteId) {
      await doPublish(pendingPublishSiteId);
      setPendingPublishSiteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
        <p className="mt-1 text-text-muted">{t("subtitle")}</p>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm animate-slide-down ${
          message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border-light bg-white overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
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
        <div className="grid gap-6 sm:grid-cols-2">
          {sites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              hasSubscription={hasSubscription}
              onPublish={handlePublish}
              publishing={publishing}
            />
          ))}
        </div>
      )}

      <SubscribeDialog
        open={showSubscribeDialog}
        onClose={() => {
          setShowSubscribeDialog(false);
          setPendingPublishSiteId(null);
        }}
        onSubscribed={handleSubscribed}
      />
    </div>
  );
}
