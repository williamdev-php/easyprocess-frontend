"use client";

import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES } from "@/graphql/queries";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Dropdown, type DropdownOption } from "@/components/ui/dropdown";

interface SiteItem {
  id: string;
  businessName: string | null;
  subdomain: string;
}

function AppLibraryHeader() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslations("appLibrary");

  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    skip: !isAuthenticated,
    errorPolicy: "all",
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedSiteId(localStorage.getItem("selectedSiteId"));
    }
  }, []);

  const sites = sitesData?.mySites ?? [];
  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? sites[0];

  const handleSiteChange = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    try { localStorage.setItem("selectedSiteId", siteId); } catch {}
    // Notify child pages so they refresh installed-app status
    window.dispatchEvent(new CustomEvent("selectedSiteChanged", { detail: siteId }));
  }, []);

  const siteOptions: DropdownOption[] = sites.map((s) => ({
    value: s.id,
    label: s.businessName || s.subdomain,
    description: `${s.subdomain}.qvickosite.com`,
  }));

  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo + nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-petrol-blue.png"
              alt="Qvicko"
              width={120}
              height={40}
              className="h-8"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/apps"
              className="text-sm font-medium text-primary-deep hover:text-primary transition"
            >
              {t("title")}
            </Link>
          </nav>
        </div>

        {/* Right: Auth state + site selector */}
        <div className="flex items-center gap-4">
          {authLoading ? (
            <div className="h-8 w-24 animate-shimmer rounded-lg bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%]" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Site selector */}
              {sites.length > 0 && (
                <div className="hidden items-center gap-2 sm:flex">
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {t("installingTo")}
                  </span>
                  <Dropdown
                    options={siteOptions}
                    value={selectedSiteId ?? selectedSite?.id}
                    onChange={handleSiteChange}
                    placeholder={t("selectSite")}
                    size="sm"
                    align="right"
                  />
                </div>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="hidden sm:inline">{user.fullName || user.email}</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-primary-deep transition"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-deep px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-deep/90"
              >
                {t("getStarted")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppLibraryHeader />
      {children}
    </div>
  );
}
