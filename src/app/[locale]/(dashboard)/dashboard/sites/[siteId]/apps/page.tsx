"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { Link } from "@/i18n/routing";
import { useSiteContext } from "@/lib/site-context";
import { GET_APPS, GET_SITE_APPS } from "@/graphql/queries";
import { INSTALL_APP, UNINSTALL_APP } from "@/graphql/mutations";
import { localizedText } from "@/lib/i18n-utils";

interface AppItem {
  id: string;
  slug: string;
  name: string;
  description: Record<string, string> | string | null;
  iconUrl: string | null;
  version: string;
  scopes: string[] | null;
}

export default function AppsPage() {
  const { siteId, installedApps } = useSiteContext();
  const t = useTranslations("apps");
  const locale = useLocale();
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  const { data: appsData, loading, error } = useQuery<{ apps: AppItem[] }>(GET_APPS, {
    errorPolicy: "all",
  });

  const [installApp, { loading: installing }] = useMutation(INSTALL_APP, {
    refetchQueries: [{ query: GET_SITE_APPS, variables: { siteId } }],
  });
  const [uninstallApp, { loading: uninstalling }] = useMutation(UNINSTALL_APP, {
    refetchQueries: [{ query: GET_SITE_APPS, variables: { siteId } }],
  });

  const apps = appsData?.apps ?? [];
  const installedSlugs = new Set(installedApps.map((a) => a.appSlug));

  async function handleInstall(slug: string) {
    try {
      await installApp({ variables: { input: { appSlug: slug, siteId } } });
      setConfirmSlug(null);
    } catch (err) {
      console.error("Install failed:", err);
    }
  }

  async function handleUninstall(slug: string) {
    if (!window.confirm(t("confirmUninstall"))) return;
    try {
      await uninstallApp({ variables: { input: { appSlug: slug, siteId } } });
    } catch (err) {
      console.error("Uninstall failed:", err);
    }
  }

  if (loading && !error) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-sm text-amber-700">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{t("library")}</h2>
        <Link
          href="/apps"
          className="flex items-center gap-2 rounded-lg bg-primary-deep/5 px-4 py-2 text-sm font-medium text-primary-deep transition hover:bg-primary-deep/10"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 00.97-1.599L5.49 3h13.02l1.52 4.75A3 3 0 0021 9.349" />
          </svg>
          {t("browseLibrary")}
        </Link>
      </div>

      {apps.length === 0 ? (
        <p className="text-text-muted">{t("noApps")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {apps.map((app) => {
            const isInstalled = installedSlugs.has(app.slug);
            return (
              <div
                key={app.id}
                className="flex flex-col rounded-xl border border-border-light bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-deep/5 text-primary-deep">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{app.name}</h3>
                    <p className="mt-1 text-sm text-text-muted">{localizedText(app.description, locale)}</p>
                    <p className="mt-1 text-xs text-text-muted">v{app.version}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  {isInstalled ? (
                    <>
                      <Link
                        href={`/dashboard/sites/${siteId}/apps/${app.slug}` as "/dashboard"}
                        className="flex-1 rounded-lg bg-primary-deep px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-primary-deep/90"
                      >
                        {t("open")}
                      </Link>
                      <button
                        onClick={() => handleUninstall(app.slug)}
                        disabled={uninstalling}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {t("uninstall")}
                      </button>
                    </>
                  ) : confirmSlug === app.slug ? (
                    <div className="flex w-full flex-col gap-2">
                      <p className="text-sm text-text-secondary">{t("confirmInstall")}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleInstall(app.slug)}
                          disabled={installing}
                          className="flex-1 rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90 disabled:opacity-50"
                        >
                          {installing ? "..." : t("install")}
                        </button>
                        <button
                          onClick={() => setConfirmSlug(null)}
                          className="rounded-lg border border-border-light px-3 py-2 text-sm text-text-muted transition hover:bg-gray-50"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmSlug(app.slug)}
                      className="w-full rounded-lg border border-primary-deep px-4 py-2 text-sm font-medium text-primary-deep transition hover:bg-primary-deep/5"
                    >
                      {t("install")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
