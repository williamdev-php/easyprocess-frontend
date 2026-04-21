"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { SAVE_DRAFT, LOAD_DRAFT, PUBLISH_SITE_DATA, DISCARD_DRAFT } from "@/graphql/mutations";
import { useSiteContext } from "@/lib/site-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
}

interface SiteData {
  [key: string]: unknown;
  header_nav?: NavItem[] | null;
  footer_nav?: NavItem[] | null;
  about?: Record<string, unknown> | null;
  services?: { items?: unknown[] } | null;
  gallery?: { images?: unknown[] } | null;
  faq?: { items?: unknown[] } | null;
  contact?: Record<string, unknown> | null;
  business?: { email?: string | null; phone?: string | null } | null;
  pricing?: Record<string, unknown> | null;
  team?: Record<string, unknown> | null;
  testimonials?: { items?: unknown[] } | null;
  process?: Record<string, unknown> | null;
  video?: Record<string, unknown> | null;
  meta?: { language?: string } | null;
}

// ---------------------------------------------------------------------------
// Available pages that navigation can link to
// ---------------------------------------------------------------------------

interface PageOption {
  key: string;
  label: string;
  href: string;
  available: boolean;
}

function getAvailablePages(data: SiteData, t: (key: string) => string): PageOption[] {
  return [
    { key: "home", label: t("home"), href: "/", available: true },
    { key: "about", label: t("about"), href: "/about", available: !!data.about },
    { key: "services", label: t("services"), href: "/services", available: !!(data.services?.items?.length) },
    { key: "gallery", label: t("gallery"), href: "/gallery", available: !!(data.gallery?.images?.length) },
    { key: "faq", label: t("faq"), href: "/faq", available: !!(data.faq?.items?.length) },
    { key: "contact", label: t("contact"), href: "/contact", available: !!(data.business?.email || data.business?.phone || data.contact) },
    { key: "pricing", label: t("pricing"), href: "/pricing", available: !!data.pricing },
    { key: "team", label: t("team"), href: "/team", available: !!data.team },
    { key: "blog", label: t("blog"), href: "/blog", available: true },
  ];
}

// ---------------------------------------------------------------------------
// Deep clone helper
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// Drag & drop reorder
// ---------------------------------------------------------------------------

function NavItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  pages,
}: {
  item: NavItem;
  index: number;
  onUpdate: (index: number, field: "label" | "href", value: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
  pages: PageOption[];
}) {
  const [customHref, setCustomHref] = useState(false);
  const isKnownPage = pages.some((p) => p.href === item.href);

  useEffect(() => {
    setCustomHref(!isKnownPage && item.href !== "");
  }, [isKnownPage, item.href]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border-light bg-white p-3 shadow-sm">
      {/* Reorder buttons */}
      <div className="flex flex-col gap-0.5">
        <button
          onClick={() => onMoveUp(index)}
          disabled={isFirst}
          className="rounded p-0.5 text-text-muted transition hover:bg-primary-deep/5 hover:text-primary-deep disabled:opacity-30"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <button
          onClick={() => onMoveDown(index)}
          disabled={isLast}
          className="rounded p-0.5 text-text-muted transition hover:bg-primary-deep/5 hover:text-primary-deep disabled:opacity-30"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Label */}
      <input
        type="text"
        value={item.label}
        onChange={(e) => onUpdate(index, "label", e.target.value)}
        placeholder="Etikett"
        className="w-32 flex-shrink-0 rounded-lg border border-border-light bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-deep focus:ring-2 focus:ring-primary-deep/20 sm:w-40"
      />

      {/* Page selector or custom href */}
      {customHref ? (
        <input
          type="text"
          value={item.href}
          onChange={(e) => onUpdate(index, "href", e.target.value)}
          placeholder="/custom-page"
          className="min-w-0 flex-1 rounded-lg border border-border-light bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-deep focus:ring-2 focus:ring-primary-deep/20"
        />
      ) : (
        <select
          value={item.href}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "__custom__") {
              setCustomHref(true);
              onUpdate(index, "href", "");
            } else {
              onUpdate(index, "href", val);
              // Auto-set label if empty
              if (!item.label) {
                const page = pages.find((p) => p.href === val);
                if (page) onUpdate(index, "label", page.label);
              }
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-border-light bg-white px-3 py-2 text-sm text-text-primary outline-none transition focus:border-primary-deep focus:ring-2 focus:ring-primary-deep/20"
        >
          <option value="">-- Välj sida --</option>
          {pages.filter((p) => p.available).map((p) => (
            <option key={p.key} value={p.href}>{p.label}</option>
          ))}
          <optgroup label="Ej aktiva sektioner">
            {pages.filter((p) => !p.available).map((p) => (
              <option key={p.key} value={p.href} className="text-text-muted">{p.label}</option>
            ))}
          </optgroup>
          <option value="__custom__">Anpassad URL...</option>
        </select>
      )}

      {/* Toggle between custom and select */}
      {customHref && (
        <button
          onClick={() => setCustomHref(false)}
          className="rounded-lg p-2 text-text-muted transition hover:bg-primary-deep/5 hover:text-primary-deep"
          title="Välj från sidor"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(index)}
        className="rounded-lg p-2 text-text-muted transition hover:bg-red-50 hover:text-red-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Nav section editor (used for both header and footer)
// ---------------------------------------------------------------------------

function NavSection({
  title,
  description,
  items,
  onChange,
  pages,
}: {
  title: string;
  description: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  pages: PageOption[];
}) {
  function handleUpdate(index: number, field: "label" | "href", value: string) {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  function handleAdd() {
    onChange([...items, { label: "", href: "" }]);
  }

  return (
    <div className="rounded-2xl border border-border-light bg-white/80 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-primary-deep">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <NavItemRow
            key={i}
            item={item}
            index={i}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            pages={pages}
          />
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-border-light px-4 py-2.5 text-sm font-medium text-text-muted transition hover:border-primary-deep hover:bg-primary-deep/5 hover:text-primary-deep"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Lägg till länk
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function NavigationPage() {
  const { siteId } = useSiteContext();
  const t = useTranslations("navigation");

  // Fetch site data
  const { data, loading: siteLoading } = useQuery<{ mySite: { id: string; siteData: SiteData } }>(
    MY_SITE,
    { variables: { id: siteId }, fetchPolicy: "cache-and-network" }
  );

  // Mutations
  const [saveDraftMutation] = useMutation(SAVE_DRAFT);
  const [loadDraftMutation] = useMutation(LOAD_DRAFT);
  const [publishMutation] = useMutation(PUBLISH_SITE_DATA, {
    refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
  });
  const [discardDraftMutation] = useMutation(DISCARD_DRAFT, {
    refetchQueries: [{ query: MY_SITE, variables: { id: siteId } }],
  });

  // State
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "publishing" | "published">("idle");
  const publishedRef = useRef<SiteData | null>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Initialize from published data + load draft
  useEffect(() => {
    if (data?.mySite?.siteData && !siteData) {
      const published = deepClone(data.mySite.siteData);
      publishedRef.current = published;
      setSiteData(published);

      loadDraftMutation({ variables: { siteId } })
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const draft = (res.data as any)?.loadDraft;
          if (draft?.draftData) {
            setSiteData(deepClone(draft.draftData) as SiteData);
            setHasDraft(true);
            setHasUnsavedChanges(true);
          }
        })
        .catch(() => {});
    }
  }, [data, siteData, siteId, loadDraftMutation]);

  // Auto-save draft
  const scheduleDraftSave = useCallback(
    (newData: SiteData) => {
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await saveDraftMutation({ variables: { input: { siteId, draftData: newData } } });
          setHasDraft(true);
          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
        }
      }, 2000);
    },
    [siteId, saveDraftMutation]
  );

  // Update handlers
  function handleHeaderNavChange(items: NavItem[]) {
    if (!siteData) return;
    const next = { ...siteData, header_nav: items.length > 0 ? items : null };
    setSiteData(next);
    setHasUnsavedChanges(true);
    scheduleDraftSave(next);
  }

  function handleFooterNavChange(items: NavItem[]) {
    if (!siteData) return;
    const next = { ...siteData, footer_nav: items.length > 0 ? items : null };
    setSiteData(next);
    setHasUnsavedChanges(true);
    scheduleDraftSave(next);
  }

  // Publish
  async function handlePublish() {
    if (!siteData) return;
    setSaveStatus("publishing");
    try {
      await publishMutation({ variables: { input: { siteId, siteData } } });
      publishedRef.current = deepClone(siteData);
      setHasUnsavedChanges(false);
      setHasDraft(false);
      setSaveStatus("published");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Publish failed:", err);
      setSaveStatus("idle");
    }
  }

  // Discard draft
  async function handleDiscard() {
    if (!publishedRef.current) return;
    try {
      await discardDraftMutation({ variables: { siteId } });
      setSiteData(deepClone(publishedRef.current));
      setHasUnsavedChanges(false);
      setHasDraft(false);
      setSaveStatus("idle");
    } catch (err) {
      console.error("Discard failed:", err);
    }
  }

  // Reset to auto-generated
  function handleResetHeader() {
    if (!siteData) return;
    const next = { ...siteData, header_nav: null };
    setSiteData(next);
    setHasUnsavedChanges(true);
    scheduleDraftSave(next);
  }

  function handleResetFooter() {
    if (!siteData) return;
    const next = { ...siteData, footer_nav: null };
    setSiteData(next);
    setHasUnsavedChanges(true);
    scheduleDraftSave(next);
  }

  // Loading state
  if (siteLoading || !siteData) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
        {[1, 2].map((i) => (
          <div key={i} className="h-64 animate-shimmer rounded-2xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
        ))}
      </div>
    );
  }

  const pages = getAvailablePages(siteData, t);
  const headerNav = siteData.header_nav ?? [];
  const footerNav = siteData.footer_nav ?? [];
  const isHeaderCustom = siteData.header_nav !== null && siteData.header_nav !== undefined;
  const isFooterCustom = siteData.footer_nav !== null && siteData.footer_nav !== undefined;

  // Build auto-generated nav for preview
  const autoNavLabels = pages.filter((p) => p.available).map((p) => p.label).join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
          <p className="mt-1 text-text-muted">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          {saveStatus === "saving" && (
            <span className="text-xs text-text-muted">{t("saving")}</span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-600">{t("draftSaved")}</span>
          )}
          {saveStatus === "published" && (
            <span className="text-xs text-emerald-600">{t("published")}</span>
          )}

          {/* Discard */}
          {hasDraft && (
            <button
              onClick={handleDiscard}
              className="rounded-xl border border-border-light px-4 py-2 text-sm font-medium text-text-muted transition hover:bg-gray-50"
            >
              {t("discard")}
            </button>
          )}

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={!hasUnsavedChanges || saveStatus === "publishing"}
            className="rounded-xl bg-primary-deep px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
          >
            {saveStatus === "publishing" ? t("publishing") : t("publish")}
          </button>
        </div>
      </div>

      {/* Header Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div />
          {isHeaderCustom ? (
            <button
              onClick={handleResetHeader}
              className="text-xs font-medium text-text-muted transition hover:text-primary-deep"
            >
              {t("resetToAuto")}
            </button>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {t("autoGenerated")}
            </span>
          )}
        </div>

        {isHeaderCustom ? (
          <NavSection
            title={t("headerNav")}
            description={t("headerNavDesc")}
            items={headerNav}
            onChange={handleHeaderNavChange}
            pages={pages}
          />
        ) : (
          <div className="rounded-2xl border border-border-light bg-white/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-primary-deep">{t("headerNav")}</h3>
            <p className="mt-1 text-sm text-text-muted">{t("headerNavDesc")}</p>
            <p className="mt-3 text-sm text-text-secondary">
              {t("currentAuto")}: <span className="font-medium">{autoNavLabels}</span>
            </p>
            <button
              onClick={() => {
                // Initialize custom nav from current auto-generated pages
                const initial = pages
                  .filter((p) => p.available)
                  .map((p) => ({ label: p.label, href: p.href }));
                handleHeaderNavChange(initial);
              }}
              className="mt-4 rounded-xl border border-primary-deep px-4 py-2 text-sm font-medium text-primary-deep transition hover:bg-primary-deep/5"
            >
              {t("customizeNav")}
            </button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div />
          {isFooterCustom ? (
            <button
              onClick={handleResetFooter}
              className="text-xs font-medium text-text-muted transition hover:text-primary-deep"
            >
              {t("resetToAuto")}
            </button>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {t("autoGenerated")}
            </span>
          )}
        </div>

        {isFooterCustom ? (
          <NavSection
            title={t("footerNav")}
            description={t("footerNavDesc")}
            items={footerNav}
            onChange={handleFooterNavChange}
            pages={pages}
          />
        ) : (
          <div className="rounded-2xl border border-border-light bg-white/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-primary-deep">{t("footerNav")}</h3>
            <p className="mt-1 text-sm text-text-muted">{t("footerNavDesc")}</p>
            <p className="mt-3 text-sm text-text-secondary">
              {t("footerAutoHint")}
            </p>
            <button
              onClick={() => {
                const initial = pages
                  .filter((p) => p.available)
                  .map((p) => ({ label: p.label, href: p.href }));
                handleFooterNavChange(initial);
              }}
              className="mt-4 rounded-xl border border-primary-deep px-4 py-2 text-sm font-medium text-primary-deep transition hover:bg-primary-deep/5"
            >
              {t("customizeNav")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
