"use client";

import { useState, useEffect, use } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { GET_SITE_APPS } from "@/graphql/queries";
import AppReviews from "@/components/app-reviews";
import { localizedText } from "@/lib/i18n-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AppDetail {
  id: string;
  slug: string;
  name: string;
  description: Record<string, string> | string | null;
  longDescription: Record<string, string> | string | null;
  iconUrl: string | null;
  version: string;
  category: string | null;
  screenshots: string[];
  features: { title: string; description: string }[];
  developerName: string | null;
  developerUrl: string | null;
  pricingType: string;
  price: number;
  priceDescription: string | null;
  installCount: number;
  avgRating: number;
  reviewCount: number;
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

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
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

function PricingLabel({ type, price, freeLabel }: { type: string; price: number; freeLabel: string }) {
  if (type === "FREE") return <span className="text-2xl font-bold text-green-600">{freeLabel}</span>;
  const suffix = type === "MONTHLY" ? "/mo" : "";
  return (
    <span className="text-2xl font-bold text-primary-deep">
      {price} kr{suffix}
    </span>
  );
}

export default function AppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations("appLibrary");
  const locale = useLocale();
  const { isAuthenticated } = useAuth();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
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

  const alreadyInstalled = (siteAppsData?.siteApps ?? []).some((a) => a.appSlug === slug);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`${API_URL}/api/apps/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setApp(convertKeys<AppDetail>(data));
      } catch (err) {
        console.error("Failed to load app:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 w-64 animate-shimmer rounded-lg bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
            <div className="h-80 animate-shimmer rounded-2xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          </div>
          <div className="h-64 animate-shimmer rounded-2xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{t("notFound")}</h2>
          <Link href="/apps" className="mt-4 inline-block text-sm text-primary-deep hover:underline">
            {t("backToLibrary")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-muted">
        <Link href="/apps" className="hover:text-primary-deep transition">
          {t("title")}
        </Link>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-text-primary font-medium">{app.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-deep/5 text-primary-deep">
              {app.iconUrl ? (
                <img src={app.iconUrl} alt="" className="h-12 w-12 rounded-xl object-contain" />
              ) : (
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">{app.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {app.developerName && (
                  <span className="text-sm text-text-secondary">{t("by")} {app.developerName}</span>
                )}
                {app.category && (
                  <span className="rounded-full bg-primary-deep/5 px-2.5 py-0.5 text-xs font-medium text-primary-deep">
                    {app.category}
                  </span>
                )}
                <span className="text-xs text-text-muted">v{app.version}</span>
                {alreadyInstalled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t("installed")}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={app.avgRating} size="md" />
                <span className="text-sm text-text-secondary">
                  {app.avgRating > 0 ? app.avgRating.toFixed(1) : "0"} ({app.reviewCount} {t("reviewsCount")})
                </span>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {app.screenshots.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border-light bg-white">
                <img
                  src={app.screenshots[activeScreenshot]}
                  alt={`${app.name} screenshot ${activeScreenshot + 1}`}
                  className="w-full object-cover"
                  style={{ maxHeight: "480px" }}
                />
              </div>
              {app.screenshots.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {app.screenshots.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveScreenshot(idx)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        idx === activeScreenshot
                          ? "border-primary-deep"
                          : "border-border-light hover:border-primary/30"
                      }`}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h2 className="text-lg font-semibold text-text-primary">{t("description")}</h2>
            <div className="prose prose-sm mt-4 max-w-none text-text-secondary">
              {localizedText(app.longDescription, locale) || localizedText(app.description, locale) || t("noDescription")}
            </div>
          </div>

          {/* Features */}
          {app.features.length > 0 && (
            <div className="rounded-2xl border border-border-light bg-white p-6">
              <h2 className="text-lg font-semibold text-text-primary">{t("features")}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {app.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-primary">{feature.title}</h3>
                      <p className="mt-0.5 text-xs text-text-muted">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <AppReviews appSlug={slug} appName={app.name} />
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Install Card */}
          <div className="rounded-2xl border border-border-light bg-white p-6 shadow-sm">
            <PricingLabel type={app.pricingType} price={app.price} freeLabel={t("free")} />
            {app.priceDescription && (
              <p className="mt-1 text-xs text-text-muted">{app.priceDescription}</p>
            )}

            {alreadyInstalled ? (
              <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-6 py-3 text-sm font-semibold text-green-700 border border-green-200">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {t("alreadyInstalled")}
              </div>
            ) : (
              <Link
                href={isAuthenticated ? (`/apps/${app.slug}/install` as "/apps") : "/login"}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-deep/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {t("installApp")}
              </Link>
            )}

            {!isAuthenticated && !alreadyInstalled && (
              <p className="mt-3 text-center text-xs text-text-muted">{t("loginToInstall")}</p>
            )}
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-border-light bg-white p-6">
            <h3 className="text-sm font-semibold text-text-primary">{t("details")}</h3>
            <dl className="mt-3 space-y-3">
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">{t("version")}</dt>
                <dd className="font-medium text-text-primary">{app.version}</dd>
              </div>
              {app.category && (
                <div className="flex justify-between text-sm">
                  <dt className="text-text-muted">{t("category")}</dt>
                  <dd className="font-medium text-text-primary">{app.category}</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">{t("installs")}</dt>
                <dd className="font-medium text-text-primary">{app.installCount}+</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">{t("rating")}</dt>
                <dd className="flex items-center gap-1.5">
                  <StarRating rating={app.avgRating} size="sm" />
                  <span className="font-medium text-text-primary">
                    {app.avgRating > 0 ? app.avgRating.toFixed(1) : "-"}
                  </span>
                </dd>
              </div>
              {app.developerName && (
                <div className="flex justify-between text-sm">
                  <dt className="text-text-muted">{t("developer")}</dt>
                  <dd className="font-medium text-text-primary">
                    {app.developerUrl ? (
                      <a href={app.developerUrl} target="_blank" rel="noopener noreferrer" className="text-primary-deep hover:underline">
                        {app.developerName}
                      </a>
                    ) : (
                      app.developerName
                    )}
                  </dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-text-muted">{t("pricing")}</dt>
                <dd className="font-medium text-text-primary">
                  {app.pricingType === "FREE" ? t("free") :
                   app.pricingType === "MONTHLY" ? `${app.price} kr/mo` :
                   app.pricingType === "ONE_TIME" ? `${app.price} kr` :
                   `${t("usageBased")}`}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
