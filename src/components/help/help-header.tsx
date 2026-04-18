"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import LocaleSwitcher from "@/components/locale-switcher";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function HelpHeader() {
  const t = useTranslations("helpCenter");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border-theme bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-16 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-petrol-blue.png"
              alt="Qvicko"
              width={100}
              height={32}
              className="h-7 w-auto lg:h-8"
              priority
            />
          </Link>
          <span className="text-border-theme">/</span>
          <Link href="/help" className="text-sm font-semibold text-primary-deep hover:text-primary transition">
            {t("title")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden text-sm text-text-muted transition hover:text-primary-deep sm:block"
          >
            {t("backToSite")}
          </Link>
          <div className="text-primary-deep">
            <LocaleSwitcher />
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => {
              const event = new CustomEvent("toggle-help-sidebar");
              window.dispatchEvent(event);
              setMobileOpen(!mobileOpen);
            }}
            className="rounded-lg p-2 text-text-muted transition hover:bg-primary/5 hover:text-primary-deep lg:hidden"
            aria-label={t("menu")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
