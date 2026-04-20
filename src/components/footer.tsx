"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
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
            <p className="mt-4 text-sm text-white/60">{t("tagline")}</p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("company")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="/#services" className="text-sm text-white/60 transition hover:text-white">
                  {t("aboutLink")}
                </a>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/60 transition hover:text-white">
                  {t("pricingLink")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-white/60 transition hover:text-white">
                  {t("helpCenter")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("contact")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${t("email")}`}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {t("email")}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${t("phone").replace(/\s/g, "")}`}
                  className="text-sm text-white/60 transition hover:text-white"
                >
                  {t("phone")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-white/40">{t("copyright")}</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-white/40 transition hover:text-white/60">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-white/40 transition hover:text-white/60">
              {t("terms")}
            </Link>
            <Link href="/terms" className="text-sm text-white/40 transition hover:text-white/60">
              {t("cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
