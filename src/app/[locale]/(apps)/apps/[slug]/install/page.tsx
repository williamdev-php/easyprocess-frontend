"use client";

import { useState, useEffect, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITES, GET_SITE_APPS } from "@/graphql/queries";
import { INSTALL_APP } from "@/graphql/mutations";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { localizedText } from "@/lib/i18n-utils";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SiteItem {
  id: string;
  businessName: string | null;
  subdomain: string;
  status: string;
}

interface AppDetail {
  id: string;
  slug: string;
  name: string;
  description: Record<string, string> | string | null;
  iconUrl: string | null;
  pricingType: string;
  price: number;
  priceDescription: string | null;
  features: { title: string; description: string }[];
  developerName: string | null;
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

export default function AppInstallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations("appLibrary");
  const locale = useLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: sitesData, loading: sitesLoading } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    skip: !isAuthenticated,
    errorPolicy: "all",
  });

  const sites = sitesData?.mySites ?? [];

  // Check if app already installed on selected site
  const { data: siteAppsData } = useQuery<{ siteApps: { appSlug: string }[] }>(GET_SITE_APPS, {
    variables: { siteId: selectedSiteId },
    skip: !selectedSiteId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const installedSlugs = new Set(
    (siteAppsData?.siteApps ?? []).map((a) => a.appSlug)
  );
  const alreadyInstalled = installedSlugs.has(slug);

  const [installApp, { loading: installing }] = useMutation(INSTALL_APP, {
    refetchQueries: selectedSiteId
      ? [{ query: GET_SITE_APPS, variables: { siteId: selectedSiteId } }]
      : [],
  });

  // Select first site by default
  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      const stored = typeof window !== "undefined" ? localStorage.getItem("selectedSiteId") : null;
      const match = stored && sites.find((s) => s.id === stored);
      setSelectedSiteId(match ? stored : sites[0].id);
    }
  }, [sites, selectedSiteId]);

  // Listen for site changes from the header selector
  useEffect(() => {
    const handler = (e: Event) => {
      setSelectedSiteId((e as CustomEvent).detail);
    };
    window.addEventListener("selectedSiteChanged", handler);
    return () => window.removeEventListener("selectedSiteChanged", handler);
  }, []);

  useEffect(() => {
    async function fetchApp() {
      try {
        const res = await fetch(`${API_URL}/api/apps/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setApp(convertKeys<AppDetail>(data));
      } catch {
        console.error("Failed to load app");
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [slug]);

  async function handleInstall() {
    if (!selectedSiteId || !app) return;
    setError(null);
    try {
      await installApp({
        variables: { input: { appSlug: slug, siteId: selectedSiteId } },
      });
      setInstallSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Installation failed";
      setError(message);
    }
  }

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{t("loginRequired")}</h2>
          <p className="mt-2 text-sm text-text-muted">{t("loginToInstall")}</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-xl bg-primary-deep px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-deep/90"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-deep border-t-transparent" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">{t("notFound")}</h2>
          <Link href="/apps" className="mt-4 inline-block text-sm text-primary-deep hover:underline">
            {t("backToLibrary")}
          </Link>
        </div>
      </div>
    );
  }

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Main Content (2/3) */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        {installSuccess ? (
          <div className="w-full max-w-lg text-center">
            <div className="relative mx-auto h-16 w-16">
              <div className="absolute inset-0 rounded-full bg-green-100 animate-install-ripple" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-50 animate-install-success">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-text-primary animate-fade-rise-delay">{t("installSuccess")}</h2>
            <p className="mt-2 text-text-muted animate-fade-rise-delay-2">
              {app.name} {t("installedOn")} {selectedSite?.businessName || selectedSite?.subdomain}
            </p>
            <div className="mt-8 flex flex-col gap-3 opacity-0 animate-fade-rise sm:flex-row sm:justify-center" style={{ animationDelay: "0.6s" }}>
              <Link
                href={`/dashboard/sites/${selectedSiteId}/apps/${slug}` as "/dashboard"}
                className="rounded-xl bg-primary-deep px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-deep/90"
              >
                {t("openApp")}
              </Link>
              <Link
                href="/apps"
                className="rounded-xl border border-border-light px-6 py-2.5 text-sm font-medium text-text-secondary transition hover:bg-gray-50"
              >
                {t("backToLibrary")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            {/* App permissions / info */}
            <div className="rounded-2xl border border-border-light bg-white p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-deep/5 text-primary-deep">
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
                  ) : (
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{app.name}</h2>
                  {app.developerName && (
                    <p className="text-sm text-text-muted">{t("by")} {app.developerName}</p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm text-text-secondary">{localizedText(app.description, locale)}</p>

              {/* Permissions */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-text-primary">{t("appWillHaveAccess")}</h3>
                <ul className="mt-3 space-y-2">
                  {[
                    t("accessSiteContent"),
                    t("accessSiteSettings"),
                    t("accessSiteData"),
                  ].map((perm) => (
                    <li key={perm} className="flex items-center gap-2 text-sm text-text-secondary">
                      <svg className="h-4 w-4 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Select site */}
            <div className="mt-6 rounded-2xl border border-border-light bg-white p-6">
              <h3 className="text-sm font-semibold text-text-primary">{t("selectSite")}</h3>
              {sitesLoading ? (
                <div className="mt-3 h-12 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
              ) : sites.length === 0 ? (
                <p className="mt-3 text-sm text-text-muted">{t("noSites")}</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {sites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => setSelectedSiteId(site.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        selectedSiteId === site.id
                          ? "border-primary-deep bg-primary-deep/5"
                          : "border-border-light hover:bg-gray-50"
                      }`}
                    >
                      <div className={`h-3 w-3 rounded-full ${selectedSiteId === site.id ? "bg-primary-deep" : "bg-border-light"}`} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {site.businessName || site.subdomain}
                        </p>
                        <p className="text-xs text-text-muted">{site.subdomain}.qvickosite.com</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar (1/3) */}
      <div className="hidden w-[380px] shrink-0 flex-col border-l border-border-light bg-white p-8 lg:flex">
        <div className="flex flex-1 flex-col">
          {/* App icon + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-deep/5 text-primary-deep">
              {app.iconUrl ? (
                <img src={app.iconUrl} alt="" className="h-10 w-10 rounded-xl object-contain" />
              ) : (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{app.name}</h2>
              {app.developerName && (
                <p className="text-xs text-text-muted">{t("by")} {app.developerName}</p>
              )}
            </div>
          </div>

          {/* Install button */}
          {!installSuccess && (
            <div className="mt-8">
              {alreadyInstalled ? (
                <div className="rounded-xl bg-green-50 p-4 text-center">
                  <svg className="mx-auto h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-green-700">{t("alreadyInstalled")}</p>
                  <Link
                    href={`/dashboard/sites/${selectedSiteId}/apps/${slug}` as "/dashboard"}
                    className="mt-3 inline-block text-sm font-medium text-primary-deep hover:underline"
                  >
                    {t("openApp")}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  disabled={installing || !selectedSiteId || sites.length === 0}
                  className="w-full rounded-xl bg-primary-deep px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-primary-deep/90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {installing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("installing")}
                    </span>
                  ) : (
                    t("installApp")
                  )}
                </button>
              )}
            </div>
          )}

          {/* Pricing details */}
          <div className="mt-8 space-y-4 border-t border-border-light pt-6">
            <h3 className="text-sm font-semibold text-text-primary">{t("costSummary")}</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">{app.name}</span>
                <span className="font-medium text-text-primary">
                  {app.pricingType === "FREE" ? t("free") :
                   app.pricingType === "MONTHLY" ? `${app.price} kr/mo` :
                   app.pricingType === "ONE_TIME" ? `${app.price} kr` :
                   t("usageBased")}
                </span>
              </div>
              {app.pricingType !== "FREE" && (
                <div className="flex items-center justify-between border-t border-border-light pt-2 text-sm">
                  <span className="font-semibold text-text-primary">{t("total")}</span>
                  <span className="font-bold text-primary-deep">{app.price} kr</span>
                </div>
              )}
            </div>
            {app.priceDescription && (
              <p className="text-xs text-text-muted">{app.priceDescription}</p>
            )}
            {app.pricingType === "FREE" && (
              <div className="rounded-lg bg-green-50 px-3 py-2">
                <p className="text-xs text-green-700">{t("freeAppNote")}</p>
              </div>
            )}
          </div>

          {/* Features quick list */}
          {app.features && app.features.length > 0 && (
            <div className="mt-6 space-y-2 border-t border-border-light pt-6">
              <h3 className="text-sm font-semibold text-text-primary">{t("included")}</h3>
              <ul className="space-y-1.5">
                {app.features.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6">
          <Link
            href={`/apps/${slug}` as "/apps"}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary-deep transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("backToApp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
