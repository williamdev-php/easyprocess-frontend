"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SubscribeDialog from "@/components/subscribe-dialog";
import { MY_SITES, MY_SUBSCRIPTION } from "@/graphql/queries";
import {
  PUBLISH_SITE,
  REQUEST_SITE_DELETION,
  CONFIRM_SITE_DELETION,
  PAUSE_SITE,
  UNPAUSE_SITE,
} from "@/graphql/mutations";

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

// ---------------------------------------------------------------------------
// Three-dot Menu
// ---------------------------------------------------------------------------

function SiteMenu({
  site,
  onDelete,
  onPause,
  onUnpause,
}: {
  site: SiteItem;
  onDelete: () => void;
  onPause: () => void;
  onUnpause: () => void;
}) {
  const t = useTranslations("userPages");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isPaused = site.status === "PAUSED";

  const items = [
    {
      key: "code",
      label: t("menuEditCode"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      href: `/dashboard/sites/${site.id}/code` as "/dashboard",
    },
    {
      key: "customize",
      label: t("menuCustomize"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
      href: `/dashboard/sites/${site.id}/editor` as "/dashboard",
    },
    {
      key: "settings",
      label: t("menuSettings"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: `/dashboard/sites/${site.id}/settings` as "/dashboard",
    },
    "divider" as const,
    {
      key: "pause",
      label: isPaused ? t("menuUnpause") : t("menuPause"),
      icon: isPaused ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
        </svg>
      ),
      onClick: isPaused ? onUnpause : onPause,
    },
    {
      key: "delete",
      label: t("menuDelete"),
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      ),
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-primary/5 hover:text-primary-deep"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border-light bg-white py-1 shadow-lg shadow-black/8 animate-in fade-in slide-in-from-top-1 duration-150">
          {items.map((item, idx) => {
            if (item === "divider") {
              return <div key={`div-${idx}`} className="my-1 border-t border-border-light" />;
            }
            const menuItem = item as {
              key: string;
              label: string;
              icon: React.ReactNode;
              href?: string;
              onClick?: () => void;
              danger?: boolean;
            };

            const className = `flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              menuItem.danger
                ? "text-red-600 hover:bg-red-50"
                : "text-primary-deep hover:bg-primary/5"
            }`;

            if (menuItem.href) {
              return (
                <Link
                  key={menuItem.key}
                  href={menuItem.href as "/dashboard"}
                  className={className}
                  onClick={() => setOpen(false)}
                >
                  {menuItem.icon}
                  {menuItem.label}
                </Link>
              );
            }

            return (
              <button
                key={menuItem.key}
                type="button"
                className={className}
                onClick={() => {
                  setOpen(false);
                  menuItem.onClick?.();
                }}
              >
                {menuItem.icon}
                {menuItem.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------------------------------------

function DeleteDialog({
  site,
  open,
  onClose,
  onConfirmed,
}: {
  site: SiteItem;
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const t = useTranslations("userPages");
  const [slugInput, setSlugInput] = useState("");
  const [step, setStep] = useState<"slug" | "email_sent" | "error">("slug");
  const [errorMsg, setErrorMsg] = useState("");
  const [requestDeletion, { loading }] = useMutation(REQUEST_SITE_DELETION);

  const expectedSlug = site.subdomain || site.id.slice(0, 8);
  const slugMatches = slugInput.trim().toLowerCase() === expectedSlug.toLowerCase();

  useEffect(() => {
    if (open) {
      setSlugInput("");
      setStep("slug");
      setErrorMsg("");
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      await requestDeletion({
        variables: { siteId: site.id, slug: slugInput.trim() },
      });
      setStep("email_sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error";
      setErrorMsg(msg);
      setStep("error");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border-light bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-primary-deep transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {step === "slug" && (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-primary-deep">{t("deleteTitle")}</h3>
            <p className="mt-2 text-sm text-text-muted">
              {t("deleteDescription")}
            </p>
            <p className="mt-3 text-sm text-primary-deep">
              {t("deleteSlugPrompt")} <code className="rounded bg-primary/5 px-1.5 py-0.5 text-xs font-mono font-bold text-primary">{expectedSlug}</code>
            </p>
            <Input
              value={slugInput}
              onChange={(e) => setSlugInput(e.target.value)}
              placeholder={expectedSlug}
              className="mt-3"
              autoFocus
            />
            <div className="mt-5 flex gap-3">
              <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
                {t("cancel")}
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!slugMatches || loading}
                onClick={handleSubmit}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("deleting")}
                  </span>
                ) : (
                  t("deleteSite")
                )}
              </Button>
            </div>
          </>
        )}

        {step === "email_sent" && (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-primary-deep">{t("deleteEmailSentTitle")}</h3>
            <p className="mt-2 text-sm text-text-muted">
              {t("deleteEmailSentDesc")}
            </p>
            <Button variant="outline" size="sm" onClick={onClose} className="mt-5 w-full">
              {t("close")}
            </Button>
          </>
        )}

        {step === "error" && (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-red-600">{t("deleteErrorTitle")}</h3>
            <p className="mt-2 text-sm text-text-muted">{errorMsg}</p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
                {t("close")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setStep("slug")} className="flex-1">
                {t("tryAgain")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Site Card
// ---------------------------------------------------------------------------

function SiteCard({
  site,
  hasSubscription,
  onPublish,
  publishing,
  onDelete,
  onPause,
  onUnpause,
}: {
  site: SiteItem;
  hasSubscription: boolean;
  onPublish: (siteId: string) => void;
  publishing: string | null;
  onDelete: (site: SiteItem) => void;
  onPause: (siteId: string) => void;
  onUnpause: (siteId: string) => void;
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
  const isPaused = site.status === "PAUSED";
  const isPublishing = publishing === site.id;

  const statusLabel = isPublished
    ? t("statusPublished")
    : isDraft
      ? t("statusDraft")
      : isPaused
        ? t("statusPaused")
        : site.status;
  const statusStyles = isPublished
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isPaused
      ? "bg-orange-50 text-orange-700 border-orange-200"
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
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${statusStyles}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-500" : isPaused ? "bg-orange-500" : "bg-amber-500"}`} />
            {statusLabel}
          </span>
        </div>

        {/* Three-dot menu overlay */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
            <SiteMenu
              site={site}
              onDelete={() => onDelete(site)}
              onPause={() => onPause(site.id)}
              onUnpause={() => onUnpause(site.id)}
            />
          </div>
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

          {/* Three-dot menu (always visible) */}
          <SiteMenu
            site={site}
            onDelete={() => onDelete(site)}
            onPause={() => onPause(site.id)}
            onUnpause={() => onUnpause(site.id)}
          />
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
            href={`/dashboard/sites/${site.id}` as "/dashboard"}
            className="flex-1"
          >
            <Button variant="outline" size="sm" fullWidth>
              {t("editSite")}
            </Button>
          </Link>

          {/* Preview (eye icon) */}
          {siteUrl && !isPaused && (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" title={t("visitSite")}>
              <Button variant="ghost" size="sm">
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </a>
          )}

          {/* Pause / Unpause */}
          {isPaused ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.preventDefault(); onUnpause(site.id); }}
              title={t("menuUnpause")}
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </Button>
          ) : (isPublished || isDraft) ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.preventDefault(); onPause(site.id); }}
              title={t("menuPause")}
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg>
            </Button>
          ) : null}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.preventDefault(); onDelete(site); }}
            title={t("menuDelete")}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </Button>

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

// ---------------------------------------------------------------------------
// Pages Page
// ---------------------------------------------------------------------------

export default function PagesPage() {
  return (
    <Suspense>
      <PagesPageInner />
    </Suspense>
  );
}

function PagesPageInner() {
  const t = useTranslations("userPages");
  const searchParams = useSearchParams();
  const { data, loading, refetch } = useQuery<any>(MY_SITES);
  const { data: subData, refetch: refetchSub } = useQuery<any>(MY_SUBSCRIPTION);
  const [publishSiteMut] = useMutation(PUBLISH_SITE);
  const [pauseSiteMut] = useMutation(PAUSE_SITE);
  const [unpauseSiteMut] = useMutation(UNPAUSE_SITE);
  const [confirmDeletionMut] = useMutation(CONFIRM_SITE_DELETION);

  const [publishing, setPublishing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [pendingPublishSiteId, setPendingPublishSiteId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SiteItem | null>(null);

  const sites: SiteItem[] = data?.mySites || [];
  const hasSubscription = !!subData?.mySubscription;

  // Handle email confirmation token from URL
  useEffect(() => {
    const token = searchParams.get("confirm_delete");
    if (!token) return;

    (async () => {
      try {
        await confirmDeletionMut({ variables: { token } });
        setMessage({ type: "success", text: t("deleteConfirmed") });
        refetch();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error";
        setMessage({ type: "error", text: msg });
      }
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => setMessage(null), 5000);
    })();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

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
      showMsg("success", t("publishSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
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

  const handlePause = async (siteId: string) => {
    try {
      await pauseSiteMut({ variables: { siteId }, refetchQueries: [{ query: MY_SITES }] });
      showMsg("success", t("pauseSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
    }
  };

  const handleUnpause = async (siteId: string) => {
    try {
      await unpauseSiteMut({ variables: { siteId }, refetchQueries: [{ query: MY_SITES }] });
      showMsg("success", t("unpauseSuccess"));
    } catch (err: unknown) {
      showMsg("error", err instanceof Error ? err.message : "Error");
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
              onDelete={(s) => setDeleteTarget(s)}
              onPause={handlePause}
              onUnpause={handleUnpause}
            />
          ))}
        </div>
      )}

      {/* Delete dialog */}
      {deleteTarget && (
        <DeleteDialog
          site={deleteTarget}
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirmed={() => {
            setDeleteTarget(null);
            refetch();
          }}
        />
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
