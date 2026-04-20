"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { usePathname } from "@/i18n/routing";
import { trackEvent } from "@/lib/tracking";

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  const isHomePage = pathname === "/" || pathname === "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (isHomePage) {
      e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const navLinkClass =
    "rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-white/10";

  const dropdownItems = [
    { key: "builder", section: "builder", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" },
    { key: "showcase", section: "showcase", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" },
    { key: "seo", section: "seo", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
    { key: "howItWorks", section: "how-it-works", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
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
                      href={isHomePage ? `#${item.section}` : `/#${item.section}`}
                      onClick={(e) => scrollToSection(e, item.section)}
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

              <Link
                href="/pricing"
                className={`${navLinkClass} text-white`}
                onClick={() =>
                  trackEvent("cta_click", {
                    target: "/pricing",
                    location: "navbar",
                  })
                }
              >
                {t("pricing")}
              </Link>

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
                    href="/create-site"
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
                    href={isHomePage ? `#${item.section}` : `/#${item.section}`}
                    onClick={(e) => scrollToSection(e, item.section)}
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

            <Link
              href="/pricing"
              onClick={() => {
                trackEvent("cta_click", {
                  target: "/pricing",
                  location: "navbar_mobile",
                });
                setMobileOpen(false);
              }}
              className="rounded-xl px-4 py-3 text-lg font-medium text-white transition hover:bg-white/10"
            >
              {t("pricing")}
            </Link>

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
                    href="/create-site"
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
