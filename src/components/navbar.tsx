"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";


export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clean up dropdown timeout on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const navLinkClass =
    "rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white/10";

  const dropdownItems = [
    { key: "automation", href: "#services", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
    { key: "ecommerce", href: "#services", icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" },
    { key: "webdev", href: "#services", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
    { key: "expert", href: "#contact", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
  ] as const;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-3 lg:p-4">
      <div
        className={`mx-auto max-w-6xl rounded-2xl border transition-all duration-500 ${
          scrolled
            ? "border-white/20 bg-primary-deep/80 shadow-2xl shadow-primary-deep/10 backdrop-blur-xl"
            : "border-white/10 bg-primary-deep/60 backdrop-blur-md"
        }`}
      >
        <nav className="px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between lg:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-sand-mist.png"
                alt="Qvicko"
                width={120}
                height={40}
                className="h-8 w-auto lg:h-10"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-1 lg:flex">
              <Link href="/" className={`${navLinkClass} text-white`}>
                {t("home")}
              </Link>

              {/* Services dropdown */}
              <div
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className={`${navLinkClass} inline-flex items-center gap-1 text-white`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  {t("services")}
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`absolute left-0 top-full mt-2 w-72 rounded-2xl border border-white/15 bg-primary-deep/90 p-2 shadow-xl backdrop-blur-xl transition-all duration-200 ${
                    dropdownOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-2 opacity-0"
                  }`}
                >
                  {dropdownItems.map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-4 py-3 transition hover:bg-white/10"
                    >
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <div>
                        <span className="block text-sm font-semibold text-white">
                          {t(`servicesDropdown.${item.key}`)}
                        </span>
                        <span className="block text-xs text-white/60">
                          {t(`servicesDropdown.${item.key}Desc`)}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Auth buttons */}
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="ml-1 inline-flex items-center rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-primary-deep transition hover:bg-accent/90"
                >
                  {t("dashboard")}
                </Link>
              ) : (
                <>
                  <Link href="/login" className={`${navLinkClass} text-white`}>
                    {t("login")}
                  </Link>
                  <Link
                    href="/register"
                    className="ml-1 inline-flex items-center rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-primary-deep transition hover:bg-accent/90"
                  >
                    {t("register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-xl p-2 text-white transition hover:bg-white/10"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-primary-deep/98 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-4 py-3 text-lg font-medium text-white transition hover:bg-white/10"
            >
              {t("home")}
            </Link>

            {/* Mobile services section */}
            <div className="px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {t("services")}
              </span>
              <div className="mt-2 flex flex-col gap-1">
                {dropdownItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/10"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <div>
                      <span className="block text-sm font-semibold text-white">
                        {t(`servicesDropdown.${item.key}`)}
                      </span>
                      <span className="block text-xs text-white/50">
                        {t(`servicesDropdown.${item.key}Desc`)}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {isAuthenticated ? (
              <div className="mt-4 px-4">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full rounded-xl bg-accent py-3 text-center text-lg font-semibold text-primary-deep transition hover:bg-accent/90"
                >
                  {t("dashboard")}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-lg font-medium text-white transition hover:bg-white/10"
                >
                  {t("login")}
                </Link>
                <div className="mt-4 px-4">
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-xl bg-accent py-3 text-center text-lg font-semibold text-primary-deep transition hover:bg-accent/90"
                  >
                    {t("register")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
