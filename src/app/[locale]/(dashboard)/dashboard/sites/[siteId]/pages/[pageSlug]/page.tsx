"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link, useRouter } from "@/i18n/routing";
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

export default function PageDetailPage() {
  const params = useParams();
  const siteId = params.siteId as string;
  const pageSlug = decodeURIComponent(params.pageSlug as string);
  const t = useTranslations("pagesManager");
  const router = useRouter();

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

  // Find page: pageSlug can be "slug" or "parent--slug" for child pages
  const isChild = pageSlug.includes("--");
  const [parentSlugPart, childSlugPart] = isChild
    ? pageSlug.split("--")
    : [null, pageSlug];

  const pageIdx = pages.findIndex((p) =>
    isChild
      ? p.parent_slug === parentSlugPart && p.slug === childSlugPart
      : !p.parent_slug && p.slug === childSlugPart,
  );
  const page = pageIdx >= 0 ? pages[pageIdx] : null;

  // Editor page param: "slug" for top-level, "parent/slug" for child pages
  const editorPageParam = page
    ? page.parent_slug ? `${page.parent_slug}/${page.slug}` : page.slug
    : "";
  const editorHref = `/dashboard/pages/${siteId}?page=${encodeURIComponent(editorPageParam)}`;

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [showInNav, setShowInNav] = useState(true);
  const [navOrder, setNavOrder] = useState(0);
  const [parentSlug, setParentSlug] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Populate form when page data loads
  useEffect(() => {
    if (!page) return;
    setTitle(page.title);
    setSlug(page.slug);
    setSeoTitle(page.meta?.title || "");
    setSeoDesc(page.meta?.description || "");
    setOgImage(page.meta?.og_image || "");
    setShowInNav(page.show_in_nav !== false);
    setNavOrder(page.nav_order ?? 0);
    setParentSlug(page.parent_slug || "");
  }, [page]);

  const topPages = pages.filter((p) => !p.parent_slug && p.slug !== page?.slug);

  async function handleSave() {
    if (!siteData || pageIdx < 0) return;
    const updated = [...pages];
    updated[pageIdx] = {
      ...updated[pageIdx],
      title: title.trim() || updated[pageIdx].title,
      slug: slug.trim() || updated[pageIdx].slug,
      meta: {
        title: seoTitle,
        description: seoDesc,
        og_image: ogImage || null,
      },
      show_in_nav: showInNav,
      nav_order: navOrder,
      parent_slug: parentSlug || null,
    };
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
      setError("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  async function handleDelete() {
    if (!siteData || pageIdx < 0) return;
    if (!confirm(t("confirmDelete"))) return;
    const updated = pages.filter((_, i) => i !== pageIdx);
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
      router.push(`/dashboard/sites/${siteId}/pages` as "/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Något gick fel");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-deep border-t-transparent" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center">
        <svg className="mx-auto h-12 w-12 text-text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="mt-4 text-lg font-semibold text-text-secondary">Sidan hittades inte</h2>
        <Link
          href={`/dashboard/sites/${siteId}/pages` as "/dashboard"}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-deep hover:underline"
        >
          &larr; Tillbaka till sidor
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Back link + page title */}
      <div>
        <Link
          href={`/dashboard/sites/${siteId}/pages` as "/dashboard"}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary-deep transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t("title")}
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-primary-deep sm:text-2xl truncate">{page.title}</h1>
            <p className="mt-0.5 text-sm text-text-muted font-mono">
              /{page.parent_slug ? `${page.parent_slug}/` : ""}{page.slug}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={editorHref as "/dashboard"}
              className="flex items-center gap-1.5 rounded-xl bg-primary-deep px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep/90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              <span className="hidden sm:inline">{t("editInEditor")}</span>
              <span className="sm:hidden">Editor</span>
            </Link>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
            >
              <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <span className="hidden sm:inline">{t("delete")}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Ändringar sparade
        </div>
      )}

      {/* Page details card */}
      <div className="rounded-2xl border border-border-light bg-white/80 shadow-sm">
        <div className="border-b border-border-light px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-primary-deep">Siduppgifter</h2>
          <p className="mt-0.5 text-xs text-text-muted">Namn, URL och navigeringsinställningar</p>
        </div>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("pageName")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("pageSlug")}</label>
            <div className="flex items-center rounded-xl border border-border-light bg-white transition focus-within:border-primary-deep focus-within:ring-1 focus-within:ring-primary-deep/20">
              <span className="shrink-0 pl-4 text-sm text-text-muted">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-transparent px-1 py-2.5 text-sm font-mono outline-none"
              />
            </div>
          </div>

          {/* Parent page */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("parentPage")}</label>
            <select
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
            >
              <option value="">{t("none")}</option>
              {topPages.map((p) => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Nav settings row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showInNav}
                  onChange={(e) => setShowInNav(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-primary-deep" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
              </div>
              {t("showInNav")}
            </label>
            <div className="flex-1 sm:max-w-[160px]">
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("navOrder")}</label>
              <input
                type="number"
                value={navOrder}
                onChange={(e) => setNavOrder(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEO card */}
      <div className="rounded-2xl border border-border-light bg-white/80 shadow-sm">
        <div className="border-b border-border-light px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-primary-deep">SEO</h2>
          <p className="mt-0.5 text-xs text-text-muted">Sökmotoroptimering och metadata</p>
        </div>
        <div className="space-y-5 px-5 py-5 sm:px-6">
          {/* SEO Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("seoTitle")}</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
              placeholder="Sidans titel i sökresultat"
            />
            <p className="mt-1 text-xs text-text-muted">
              {seoTitle.length}/60 tecken
              {seoTitle.length > 60 && <span className="text-amber-500"> — rekommenderas max 60</span>}
            </p>
          </div>

          {/* SEO Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">{t("seoDescription")}</label>
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
              placeholder="En kort beskrivning som visas i sökresultat"
            />
            <p className="mt-1 text-xs text-text-muted">
              {seoDesc.length}/160 tecken
              {seoDesc.length > 160 && <span className="text-amber-500"> — rekommenderas max 160</span>}
            </p>
          </div>

          {/* OG Image */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">OG-bild</label>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-deep focus:ring-1 focus:ring-primary-deep/20"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-text-muted">Bild som visas vid delning på sociala medier</p>
          </div>

          {/* Search preview */}
          <div className="rounded-xl border border-border-light bg-gray-50/50 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">Förhandsvisning i sökresultat</p>
            <div className="space-y-0.5">
              <p className="text-base font-medium text-blue-700 leading-snug truncate">
                {seoTitle || title || "Sidtitel"}
              </p>
              <p className="text-xs text-emerald-700 font-mono truncate">
                qvickosite.com/{page.parent_slug ? `${page.parent_slug}/` : ""}{slug || page.slug}
              </p>
              <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                {seoDesc || "Ingen beskrivning angiven..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections card */}
      <div className="rounded-2xl border border-border-light bg-white/80 shadow-sm">
        <div className="border-b border-border-light px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-primary-deep">{t("sections")}</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                {page.sections.length} {page.sections.length === 1 ? "sektion" : "sektioner"} på denna sida
              </p>
            </div>
            <Link
              href={editorHref as "/dashboard"}
              className="flex items-center gap-1.5 rounded-lg bg-primary-deep/10 px-3 py-1.5 text-xs font-medium text-primary-deep transition hover:bg-primary-deep/20"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              {t("editInEditor")}
            </Link>
          </div>
        </div>
        <div className="divide-y divide-border-light">
          {page.sections.length > 0 ? (
            page.sections.map((sec, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-deep/5 text-xs font-bold text-primary-deep/60">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-secondary truncate">
                    {SECTION_LABELS[sec.type] || sec.type}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">{sec.type}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center sm:px-6">
              <p className="text-sm text-text-muted">{t("noSections")}</p>
              <Link
                href={editorHref as "/dashboard"}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-deep hover:underline"
              >
                Lägg till sektioner i editorn &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Save button — sticky on mobile */}
      <div className="sticky bottom-4 z-10">
        <div className="flex gap-3 rounded-2xl border border-border-light bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:justify-end">
          <Link
            href={`/dashboard/sites/${siteId}/pages` as "/dashboard"}
            className="flex-1 rounded-xl border border-border-light px-4 py-2.5 text-center text-sm font-medium text-text-secondary transition hover:bg-gray-50 sm:flex-none"
          >
            {t("cancel")}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-deep px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep/90 disabled:opacity-50 sm:flex-none"
          >
            {saving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
