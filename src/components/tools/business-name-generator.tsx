"use client";

import { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/tracking";

export default function BusinessNameGenerator() {
  const t = useTranslations("nameGenerator");
  const locale = useLocale();

  const [description, setDescription] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleGenerate() {
    if (description.trim().length < 3) {
      setError(t("errorMinLength"));
      return;
    }

    setError("");
    setLoading(true);
    trackEvent("tool_use", { tool: "business_name_generator", action: "generate" });

    try {
      const res = await fetch("/api/tools/generate-names", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), language: locale }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setRemaining(0);
          setError(t("limitReached"));
        } else {
          setError(t("errorGeneric"));
        }
        return;
      }

      setNames(data.names);
      setRemaining(data.remaining);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  function copyName(name: string, index: number) {
    navigator.clipboard.writeText(name);
    setCopiedIndex(index);
    trackEvent("tool_use", { tool: "business_name_generator", action: "copy_name" });
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  const limitReached = remaining === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {locale === "sv" ? "Gratis verktyg" : "Free tool"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-theme tracking-tight">
            {t("h1")}
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Generator */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <div className="bg-surface rounded-2xl shadow-lg border border-border-light p-6 sm:p-8">
          <label htmlFor="business-desc" className="block text-sm font-semibold text-text-theme mb-2">
            {t("label")}
          </label>
          <textarea
            id="business-desc"
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full rounded-xl border border-border-theme bg-background px-4 py-3 text-text-theme placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
            disabled={limitReached}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-muted">
              {description.length}/500
            </span>
            {remaining !== null && (
              <span className={`text-xs font-medium ${remaining === 0 ? "text-error" : "text-text-muted"}`}>
                {remaining === 0 ? t("limitReached") : t("remaining", { count: remaining })}
              </span>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-error-bg border border-error/20 px-4 py-2.5 text-sm text-error">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-5"
            onClick={handleGenerate}
            disabled={loading || limitReached || description.trim().length < 3}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("generating")}
              </span>
            ) : (
              t("generate")
            )}
          </Button>
        </div>

        {/* Results */}
        {names.length > 0 && (
          <div ref={resultsRef} className="mt-10 animate-fade-rise">
            <h2 className="text-2xl font-bold text-text-theme mb-6">{t("resultsTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {names.map((name, i) => (
                <button
                  key={`${name}-${i}`}
                  onClick={() => copyName(name, i)}
                  className="group relative bg-surface rounded-xl border border-border-light px-4 py-3 text-left hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <span className="font-medium text-text-theme group-hover:text-primary transition-colors">
                    {name}
                  </span>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIndex === i ? (
                      <span className="text-success">{t("copied")}</span>
                    ) : (
                      <span className="text-text-muted">{t("copy")}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {t("ctaTitle")}
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            {t("ctaDescription")}
          </p>
          <Link
            href="/create-site"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-xl bg-white text-primary font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            onClick={() => trackEvent("cta_click", { target: "/create-site", location: "name_generator" })}
          >
            {t("ctaButton")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ - SEO structured data */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-theme mb-8 text-center">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <details
                key={i}
                className="group bg-surface rounded-xl border border-border-light overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 font-semibold text-text-theme hover:bg-background/50 transition-colors">
                  {t(`faq${i}q`)}
                  <svg
                    className="w-5 h-5 text-text-muted transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-4 text-text-secondary leading-relaxed">
                  {t(`faq${i}a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
