"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");
  const pathname = usePathname();

  return (
    <footer className="animate-fade-in bg-primary-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo-sand-mist.png"
                alt="Qvicko"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-white/80">{t("tagline")}</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              {t("company")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/#services" className="text-sm text-white/80 transition hover:text-white">
                  {t("aboutLink")}
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/80 transition hover:text-white">
                  {t("pricingLink")}
                </Link>
              </li>
              <li>
                <Link href={{ pathname: "/help", query: { from: pathname } }} className="text-sm text-white/80 transition hover:text-white">
                  {t("helpCenter")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Free Tools */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              {t("tools")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/tools/business-name-generator" className="text-sm text-white/80 transition hover:text-white">
                  {t("nameGenerator")}
                </Link>
              </li>
              <li>
                <Link href="/tools/color-palette-generator" className="text-sm text-white/80 transition hover:text-white">
                  {t("colorPalette")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">
              {t("contact")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  {t("email")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("phone").replace(/\s/g, "")}`}
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  {t("phone")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/70">{t("copyright")}</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-white/70 transition hover:text-white">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-white/70 transition hover:text-white">
              {t("terms")}
            </Link>
            <Link href="/terms" className="text-sm text-white/70 transition hover:text-white">
              {t("cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
