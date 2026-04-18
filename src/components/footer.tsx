"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
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
            <div className="mt-6 flex gap-3">
              {/* Social placeholders */}
              {["LinkedIn", "GitHub", "X"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
                  aria-label={social}
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("services")}
            </h4>
            <ul className="mt-4 space-y-3">
              {(["automation", "ecommerce", "webdev", "ai"] as const).map((key) => (
                <li key={key}>
                  <a href="#services" className="text-sm text-white/60 transition hover:text-white">
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              {t("company")}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#about" className="text-sm text-white/60 transition hover:text-white">
                  {t("aboutLink")}
                </a>
              </li>
              <li>
                <a href="#process" className="text-sm text-white/60 transition hover:text-white">
                  {t("processLink")}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-white/60 transition hover:text-white">
                  {t("contactLink")}
                </a>
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
