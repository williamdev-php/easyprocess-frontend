"use client";

import { useState, useEffect, FormEvent, ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button, Input } from "@/components/ui";

const STORAGE_KEY = "qvicko_site_unlocked";

export default function PasswordGate({ children }: { children: ReactNode }) {
  const t = useTranslations("passwordGate");

  const isEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_PROTECTION_ENABLED === "true";

  const [unlocked, setUnlocked] = useState(!isEnabled);
  const [hydrated, setHydrated] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      setUnlocked(true);
      setHydrated(true);
      return;
    }
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setUnlocked(true);
    }
    setHydrated(true);
  }, [isEnabled]);

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD || "";
      if (password === sitePassword) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setUnlocked(true);
      } else {
        setError(t("error"));
      }
      setLoading(false);
    }, 400);
  }

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault();
    if (email) {
      setNewsletterSubmitted(true);
    }
  }

  if (!hydrated) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary-deep overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-20 -left-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 h-56 w-56 rounded-full bg-primary-dark/30 blur-2xl" />
      <div className="absolute bottom-1/3 left-1/4 h-40 w-40 rounded-full bg-accent/5 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6 text-center">
        {/* Logo */}
        <Image
          src="/logo-sand-mist.png"
          alt="Qvicko"
          width={180}
          height={60}
          className="h-14"
          style={{ width: "auto" }}
          priority
        />

        {/* Badge */}
        <span className="mt-8 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm border border-white/10">
          {t("badge")}
        </span>

        {/* Title & subtitle */}
        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {t("title")}
        </h1>
        <p className="mt-3 text-base text-white/50 max-w-md">
          {t("subtitle")}
        </p>

        {/* Multi-language CTA tags */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {[
            { lang: "EN", label: "Get early access" },
            { lang: "SV", label: "Få tidig tillgång" },
            { lang: "ES", label: "Obtener acceso anticipado" },
            { lang: "DE", label: "Frühzeitigen Zugang erhalten" },
          ].map((item) => (
            <span
              key={item.lang}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur-sm"
            >
              <span className="font-semibold text-accent">{item.lang}</span>
              {item.label}
            </span>
          ))}
        </div>

        {/* Newsletter email signup */}
        <div className="mt-10 w-full max-w-sm">
          {newsletterSubmitted ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-4">
              <p className="text-sm text-white/80">{t("newsletterThanks")}</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:border-accent/50 focus:ring-accent/20"
              />
              <Button type="submit" size="lg" className="shrink-0">
                {t("cta")}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-white/30">
          {t("footer")}
        </p>

        {/* Hidden small password unlock */}
        <div className="mt-12">
          {!showPasswordField ? (
            <button
              onClick={() => setShowPasswordField(true)}
              className="text-[10px] text-white/15 hover:text-white/30 transition-colors cursor-pointer"
            >
              {t("adminAccess")}
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="flex items-center gap-2">
              <input
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-7 w-40 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-white/60 placeholder:text-white/20 outline-none focus:border-white/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-7 rounded-md bg-white/10 px-3 text-[10px] text-white/40 hover:bg-white/15 hover:text-white/60 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : t("unlock")}
              </button>
              {error && (
                <span className="text-[10px] text-red-400/70">{error}</span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
