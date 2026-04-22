"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { GET_SITE_APPS } from "@/graphql/queries";
import { localizedText } from "@/lib/i18n-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AppListItem {
  id: string;
  slug: string;
  name: string;
  description: Record<string, string> | string | null;
  iconUrl: string | null;
  category: string | null;
  pricingType: string;
  price: number;
  installCount: number;
  avgRating: number;
  reviewCount: number;
  version: string;
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, l: string) => l.toUpperCase());
}

function convertKeys<T>(obj: unknown): T {
  if (Array.isArray(obj)) return obj.map((item) => convertKeys(item)) as T;
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        toCamelCase(key),
        convertKeys(value),
      ])
    ) as T;
  }
  return obj as T;
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function PricingBadge({ type, price, t }: { type: string; price: number; t: (key: string) => string }) {
  if (type === "FREE") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        {t("free")}
      </span>
    );
  }
  const label =
    type === "MONTHLY" ? `${price} kr/mo` :
    type === "ONE_TIME" ? `${price} kr` :
    `${t("from")} ${price} kr`;
  return (
    <span className="inline-flex items-center rounded-full bg-primary-deep/5 px-2.5 py-0.5 text-xs font-medium text-primary-deep">
      {label}
    </span>
  );
}

function InstalledBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      {label}
    </span>
  );
}

function AppSlider({ title, apps, installedSlugs, t, locale }: { title: string; apps: AppListItem[]; installedSlugs: Set<string>; t: (key: string) => string; locale: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll);
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [apps]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (apps.length === 0) return null;

  return (
    <div className="relative">
      <h2 className="mb-4 text-lg font-semibold text-text-primary">{title}</h2>
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-light bg-white shadow-md transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-light bg-white shadow-md transition hover:bg-gray-50"
          >
            <svg className="h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.slug}` as "/apps"}
              className="group/card flex w-72 shrink-0 flex-col rounded-2xl border border-border-light bg-white p-5 shadow-sm transition hover:shadow-md hover:border-primary/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-deep/5 text-primary-deep">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt="" className="h-7 w-7 rounded-lg object-contain" />
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {installedSlugs.has(app.slug) && <InstalledBadge label={t("installed")} />}
                  {!installedSlugs.has(app.slug) && <PricingBadge type={app.pricingType} price={app.price} t={t} />}
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-text-primary group-hover/card:text-primary-deep transition">
                {app.name}
              </h3>
              <p className="mt-1 flex-1 text-xs text-text-muted line-clamp-2">
                {localizedText(app.description, locale)}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border-light pt-2.5">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={app.avgRating} />
                  {app.reviewCount > 0 && (
                    <span className="text-xs text-text-muted">({app.reviewCount})</span>
                  )}
                </div>
                {app.installCount > 0 && (
                  <span className="text-xs text-text-muted">
                    {app.installCount}+ {t("installs")}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppLibraryPage() {
  const t = useTranslations("appLibrary");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [apps, setApps] = useState<AppListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedSiteId(localStorage.getItem("selectedSiteId"));
    }
    const handler = (e: Event) => {
      setSelectedSiteId((e as CustomEvent).detail);
    };
    window.addEventListener("selectedSiteChanged", handler);
    return () => window.removeEventListener("selectedSiteChanged", handler);
  }, []);

  const { data: siteAppsData } = useQuery<{ siteApps: { appSlug: string }[] }>(GET_SITE_APPS, {
    variables: { siteId: selectedSiteId },
    skip: !selectedSiteId || !isAuthenticated,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const installedSlugs = new Set(
    (siteAppsData?.siteApps ?? []).map((a) => a.appSlug)
  );

  useEffect(() => {
    async function fetchApps() {
      try {
        const res = await fetch(`${API_URL}/api/apps`);
        if (!res.ok) throw new Error("Failed to fetch apps");
        const data = await res.json();
        setApps(convertKeys<AppListItem[]>(data));
      } catch (err) {
        console.error("Failed to load apps:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, []);

  const categories = Array.from(new Set(apps.map((a) => a.category).filter(Boolean)));

  const filtered = apps.filter((app) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const desc = localizedText(app.description, locale).toLowerCase();
      if (!app.name.toLowerCase().includes(q) && !desc.includes(q)) {
        return false;
      }
    }
    if (selectedCategory && app.category !== selectedCategory) return false;
    return true;
  });

  // Featured app (blog)
  const featuredApp = apps.find((a) => a.slug === "blog");

  // Group apps by category for sliders
  const appsByCategory: Record<string, AppListItem[]> = {};
  for (const app of apps) {
    const cat = app.category || "Other";
    if (!appsByCategory[cat]) appsByCategory[cat] = [];
    appsByCategory[cat].push(app);
  }

  const isSearching = searchQuery || selectedCategory;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      {!isSearching && featuredApp && (
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-deep via-primary-deep/95 to-primary/80">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 800 400" fill="none">
              <circle cx="700" cy="50" r="200" fill="white" opacity="0.1" />
              <circle cx="100" cy="350" r="150" fill="white" opacity="0.05" />
              <path d="M0 200 Q200 100 400 200 T800 200" stroke="white" strokeWidth="1" opacity="0.15" />
              <path d="M0 250 Q200 150 400 250 T800 250" stroke="white" strokeWidth="1" opacity="0.1" />
            </svg>
          </div>
          <div className="relative flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:gap-12 lg:p-12">
            <div className="flex-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
                </svg>
                {t("featuredApp")}
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {featuredApp.name}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/80 sm:text-lg">
                {t("heroBlogDescription")}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t("heroSeoBoost")}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t("heroOrganicTraffic")}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-white/70">
                  <svg className="h-4 w-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {t("heroEasySetup")}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/apps/${featuredApp.slug}` as "/apps"}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-deep shadow-sm transition hover:bg-white/90"
                >
                  {t("learnMore")}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                {installedSlugs.has(featuredApp.slug) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/20 px-3 py-1.5 text-sm font-medium text-green-100">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t("installed")}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden lg:flex lg:shrink-0">
              <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
                {featuredApp.iconUrl ? (
                  <img src={featuredApp.iconUrl} alt="" className="h-20 w-20 rounded-2xl object-contain" />
                ) : (
                  <svg className="h-20 w-20 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border-light bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                !selectedCategory
                  ? "bg-primary-deep text-white"
                  : "bg-white text-text-secondary border border-border-light hover:bg-gray-50"
              }`}
            >
              {t("all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? "bg-primary-deep text-white"
                    : "bg-white text-text-secondary border border-border-light hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-shimmer rounded-2xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ))}
        </div>
      ) : isSearching ? (
        /* Grid view when searching/filtering */
        filtered.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="mx-auto h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="mt-4 text-text-muted">{t("noResults")}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((app) => (
              <Link
                key={app.id}
                href={`/apps/${app.slug}` as "/apps"}
                className="group flex flex-col rounded-2xl border border-border-light bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-deep/5 text-primary-deep">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
                    ) : (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {installedSlugs.has(app.slug) && <InstalledBadge label={t("installed")} />}
                    {!installedSlugs.has(app.slug) && <PricingBadge type={app.pricingType} price={app.price} t={t} />}
                  </div>
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary group-hover:text-primary-deep transition">
                  {app.name}
                </h3>
                <p className="mt-1.5 flex-1 text-sm text-text-muted line-clamp-2">
                  {localizedText(app.description, locale)}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border-light pt-3">
                  <div className="flex items-center gap-2">
                    <StarRating rating={app.avgRating} />
                    {app.reviewCount > 0 && (
                      <span className="text-xs text-text-muted">({app.reviewCount})</span>
                    )}
                  </div>
                  {app.installCount > 0 && (
                    <span className="text-xs text-text-muted">
                      {app.installCount}+ {t("installs")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Slider view (default) */
        <div className="space-y-10">
          {/* All apps slider */}
          <AppSlider title={t("allApps")} apps={apps} installedSlugs={installedSlugs} t={t} locale={locale} />

          {/* Category sliders */}
          {Object.entries(appsByCategory).map(([category, catApps]) => (
            <AppSlider key={category} title={category} apps={catApps} installedSlugs={installedSlugs} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
