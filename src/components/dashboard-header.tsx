"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@apollo/client/react";
import { MY_SITES } from "@/graphql/queries";
import NotificationBell from "@/components/notification-bell";

interface SiteItem {
  id: string;
  subdomain: string | null;
}

export default function DashboardHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const t = useTranslations("dashboardHeader");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Resolve selected site's subdomain for preview link
  const { data: sitesData } = useQuery<{ mySites: SiteItem[] }>(MY_SITES, {
    skip: !isAuthenticated || user?.isSuperuser === true,
    fetchPolicy: "cache-first",
  });
  const sites = sitesData?.mySites ?? [];

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    function resolve() {
      if (sites.length === 0) return;
      let siteId: string | null = null;
      try { siteId = localStorage.getItem("selectedSiteId"); } catch {}
      const site = sites.find((s) => s.id === siteId) ?? sites[0];
      if (!site?.subdomain) { setPreviewUrl(null); return; }
      const viewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL ?? "";
      if (!viewerUrl) { setPreviewUrl(null); return; }
      try {
        const u = new URL(viewerUrl);
        const host = u.hostname.replace(/^www\./, "");
        setPreviewUrl(`${u.protocol}//${site.subdomain}.${host}`);
      } catch {
        setPreviewUrl(`${viewerUrl}/${site.id}`);
      }
    }
    resolve();
    window.addEventListener("storage", resolve);
    const interval = setInterval(resolve, 1000);
    return () => { window.removeEventListener("storage", resolve); clearInterval(interval); };
  }, [sites]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-border-light bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center"
        >
          <Image
            src="/logo-petrol-blue.png"
            alt="Qvicko"
            width={120}
            height={40}
            className="h-10 w-auto sm:h-12"
            loading="eager"
            priority
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Help & Contact icons (mobile only) */}
          <Link
            href={{ pathname: "/help", query: { from: pathname } }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep sm:hidden"
            aria-label={t("helpCenter")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </Link>
          <Link
            href="/dashboard/contact"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep sm:hidden"
            aria-label={t("contactUs")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </Link>

          {/* Preview site */}
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-primary-deep/5 hover:text-primary-deep"
              aria-label={t("preview")}
              title={t("preview")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          )}

          {/* Notification bell */}
          <NotificationBell />

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-primary-deep/5"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || ""}
                  className="h-9 w-9 rounded-full object-cover border border-border-light shadow-sm"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-primary-deep leading-tight">
                  {user?.fullName?.split(" ")[0] || "User"}
                </p>
                <p className="text-[11px] text-text-muted leading-tight">
                  {user?.companyName || user?.email}
                </p>
              </div>
              <svg
                className={`hidden h-4 w-4 text-text-muted transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border-light bg-white py-1.5 shadow-xl">
                {/* User info in dropdown (mobile) */}
                <div className="border-b border-border-light px-4 py-3 sm:hidden">
                  <p className="text-sm font-semibold text-primary-deep">
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>

                <Link
                  href="/dashboard/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-primary-deep/5 hover:text-primary-deep"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t("account")}
                </Link>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
