"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { MY_SITE } from "@/graphql/queries";
import { UPDATE_SITE_DATA } from "@/graphql/mutations";

interface PageMeta {
  title?: string;
  description?: string;
  og_image?: string | null;
}

interface PageSection {
  type: string;
  data: Record<string, unknown>;
}

interface PageItem {
  slug: string;
  title: string;
  meta?: PageMeta;
  sections: PageSection[];
  parent_slug?: string | null;
  show_in_nav?: boolean;
  nav_order?: number;
}

interface SiteData {
  pages?: PageItem[] | null;
  [key: string]: unknown;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "untitled";
}

/** Encode a page into a URL-safe identifier for the detail route. */
function pageDetailSlug(page: PageItem): string {
  return page.parent_slug
    ? `${page.parent_slug}--${page.slug}`
    : page.slug;
}

export default function PagesManagerPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const t = useTranslations("pagesManager");

  const { data, loading } = useQuery<{
    mySite: { id: string; siteData: SiteData; subdomain: string };
  }>(MY_SITE, { variables: { id: siteId } });

  const [updateSiteData, { loading: saving }] = useMutation(UPDATE_SITE_DATA);

  const siteData: SiteData | null = data?.mySite?.siteData
    ? (typeof data.mySite.siteData === "string"
        ? JSON.parse(data.mySite.siteData)
        : data.mySite.siteData)
    : null;

  const pages: PageItem[] = siteData?.pages || [];

  // --- Create page dialog ---
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newShowInNav, setNewShowInNav] = useState(true);

  const [error, setError] = useState("");

  async function handleCreatePage() {
    if (!newTitle.trim()) return;
    const slug = newSlug.trim() || slugify(newTitle);

    if (pages.some((p) => p.slug === slug && (!newParent || p.parent_slug === newParent))) {
      setError("En sida med denna slug finns redan");
      return;
    }

    const newPage: PageItem = {
      slug,
      title: newTitle.trim(),
      meta: { title: newTitle.trim(), description: "" },
      sections: [{ type: "page_content", data: { title: "", content: "" } }],
      parent_slug: newParent || null,
      show_in_nav: newShowInNav,
      nav_order: pages.length,
    };

    try {
      await updateSiteData({
        variables: {
          input: {
            siteId,
            siteData: { ...siteData, pages: [...pages, newPage] },
          },
        },
        refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
      });
      setShowCreate(false);
      setNewTitle("");
      setNewSlug("");
      setNewParent("");
      setNewShowInNav(true);
      setError("");
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  async function handleDeletePage(idx: number) {
    if (!confirm(t("confirmDelete"))) return;
    const updated = pages.filter((_, i) => i !== idx);
    try {
      await updateSiteData({
        variables: {
          input: {
            siteId,
            siteData: { ...siteData, pages: updated },
          },
        },
        refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
      });
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  const topPages = pages.filter((p) => !p.parent_slug);
  const childPages = pages.filter((p) => p.parent_slug);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-deep border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-page-enter mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-deep">{t("title")}</h1>
          <p className="text-sm text-text-muted">{t("description")}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep/90 sm:w-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t("createPage")}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Pages list */}
      {pages.length === 0 ? (
        <div className="rounded-2xl border border-border-light bg-white/80 px-6 py-16 text-center shadow-sm">
          <svg className="mx-auto h-12 w-12 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-text-secondary">{t("noPages")}</h3>
          <p className="mt-1 text-sm text-text-muted">{t("noPagesDescription")}</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep/90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t("createPage")}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {topPages
            .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
            .map((page) => {
              const idx = pages.indexOf(page);
              const children = childPages.filter((c) => c.parent_slug === page.slug);
              return (
                <div key={page.slug}>
                  <PageCard
                    page={page}
                    siteId={siteId}
                    onDelete={() => handleDeletePage(idx)}
                    saving={saving}
                    t={t}
                  />
                  {children
                    .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
                    .map((child) => {
                      const childIdx = pages.indexOf(child);
                      return (
                        <div key={child.slug} className="ml-4 sm:ml-8">
                          <PageCard
                            page={child}
                            siteId={siteId}
                            onDelete={() => handleDeletePage(childIdx)}
                            saving={saving}
                            t={t}
                            isChild
                          />
                        </div>
                      );
                    })}
                </div>
              );
            })}
        </div>
      )}

      {/* Create page dialog */}
      {showCreate && (
        <Dialog onClose={() => setShowCreate(false)} title={t("newPage")}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("pageName")}</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug || newSlug === slugify(newTitle)) {
                    setNewSlug(slugify(e.target.value));
                  }
                }}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
                placeholder="Min nya sida"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("pageSlug")}</label>
              <div className="flex items-center rounded-xl border border-border-light bg-white transition focus-within:border-primary-deep focus-within:ring-1 focus-within:ring-primary-deep/20">
                <span className="shrink-0 pl-4 text-sm text-text-muted">/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full bg-transparent px-1 py-2.5 text-sm font-mono outline-none"
                />
              </div>
            </div>
            {topPages.length > 0 && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("parentPage")}</label>
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep"
                >
                  <option value="">{t("none")}</option>
                  {topPages.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.title}</option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={newShowInNav}
                  onChange={(e) => setNewShowInNav(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-primary-deep" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
              </div>
              {t("showInNav")}
            </label>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-border-light px-4 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-gray-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newTitle.trim() || saving}
                className="rounded-xl bg-primary-deep px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Skapar...
                  </span>
                ) : (
                  t("createPage")
                )}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PageCard — links to detail page instead of opening a dialog
// ---------------------------------------------------------------------------

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "Om oss",
  features: "Egenskaper",
  stats: "Statistik",
  services: "Tjänster",
  process: "Process",
  gallery: "Galleri",
  team: "Team",
  testimonials: "Omdömen",
  faq: "FAQ",
  cta: "CTA",
  contact: "Kontakt",
  pricing: "Priser",
  video: "Video",
  logo_cloud: "Logotyper",
  custom_content: "Eget innehåll",
  banner: "Banner",
  ranking: "Topplista",
  page_content: "Sidinnehåll",
};

function PageCard({
  page,
  siteId,
  onDelete,
  saving,
  t,
  isChild,
}: {
  page: PageItem;
  siteId: string;
  onDelete: () => void;
  saving: boolean;
  t: (key: string, values?: Record<string, unknown>) => string;
  isChild?: boolean;
}) {
  const detailHref = `/dashboard/sites/${siteId}/pages/${pageDetailSlug(page)}`;
  const editorPageParam = page.parent_slug ? `${page.parent_slug}/${page.slug}` : page.slug;
  const editorHref = `/dashboard/pages/${siteId}?page=${encodeURIComponent(editorPageParam)}`;

  return (
    <Link
      href={detailHref as "/dashboard"}
      className={`group block rounded-xl border border-border-light bg-white/80 shadow-sm transition hover:shadow-md hover:border-primary-deep/20 ${isChild ? "mt-2" : "mb-2"}`}
    >
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-deep/10 sm:h-10 sm:w-10">
          <svg className="h-4 w-4 text-primary-deep sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-primary-deep truncate group-hover:text-primary-deep/80">{page.title}</h3>
            {page.show_in_nav !== false && (
              <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline">
                Nav
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted font-mono truncate">
            /{page.parent_slug ? `${page.parent_slug}/` : ""}{page.slug}
          </p>
          {/* Section chips — hidden on very small screens */}
          <div className="mt-1.5 hidden flex-wrap gap-1 sm:flex">
            {page.sections.length > 0 ? (
              page.sections.map((sec, i) => (
                <span
                  key={i}
                  className="rounded-md bg-primary-deep/5 px-1.5 py-0.5 text-[10px] font-medium text-primary-deep/70"
                >
                  {SECTION_LABELS[sec.type] || sec.type}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-text-muted">{t("noSections")}</span>
            )}
          </div>
          {/* Mobile: compact section count */}
          <p className="mt-1 text-[11px] text-text-muted sm:hidden">
            {page.sections.length} {page.sections.length === 1 ? "sektion" : "sektioner"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.preventDefault()}>
          <Link
            href={editorHref as "/dashboard"}
            className="hidden items-center gap-1.5 rounded-lg bg-primary-deep/10 px-3 py-1.5 text-xs font-medium text-primary-deep transition hover:bg-primary-deep/20 sm:flex"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            Editor
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
            disabled={saving}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            title={t("delete")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
          {/* Chevron indicating it's clickable */}
          <svg className="h-4 w-4 text-text-muted/40 transition group-hover:text-primary-deep/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Dialog component (used only for create now)
// ---------------------------------------------------------------------------

function Dialog({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative mx-0 w-full max-w-md rounded-t-2xl border border-border-light bg-white p-5 shadow-xl sm:mx-4 sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-deep">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Mobile drag handle */}
        <div className="absolute left-1/2 top-2 h-1 w-8 -translate-x-1/2 rounded-full bg-gray-300 sm:hidden" />
        {children}
      </div>
    </div>
  );
}
