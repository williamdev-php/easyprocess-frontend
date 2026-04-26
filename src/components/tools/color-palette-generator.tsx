"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/tracking";
import { PALETTE_PRESETS, CATEGORY_RANGES, CATEGORIES, type Palette, type Category } from "@/lib/palette-presets";

function ColorSwatch({ color, label, onCopy, copied }: { color: string; label: string; onCopy: () => void; copied: boolean }) {
  return (
    <button onClick={onCopy} className="group flex flex-col items-center gap-1.5 cursor-pointer" title={color}>
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-black/10 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
      <span className={`text-[10px] font-mono transition-all duration-150 ${copied ? "text-success font-semibold" : "text-text-muted"}`}>
        {copied ? "Copied!" : color}
      </span>
    </button>
  );
}

function PalettePreview({ palette, t }: { palette: Palette; t: (key: string) => string }) {
  return (
    <div
      className="rounded-xl border overflow-hidden shadow-sm"
      style={{ backgroundColor: palette.background, borderColor: palette.primary + "30" }}
    >
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: palette.primary }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
        </div>
        <div className="flex-1 mx-4 h-2.5 rounded-full" style={{ backgroundColor: palette.secondary }} />
      </div>
      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-bold" style={{ color: palette.primary }}>
          {t("previewHeading")}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: palette.text }}>
          {t("previewText")}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <span
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: palette.primary }}
          >
            {t("previewButton")}
          </span>
          <span
            className="inline-block px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: palette.accent, color: palette.background }}
          >
            {t("previewAccent")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ColorPaletteGenerator() {
  const t = useTranslations("colorPalette");

  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [activePalette, setActivePalette] = useState<Palette>(PALETTE_PRESETS[0]);
  const [showAll, setShowAll] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [randomizing, setRandomizing] = useState(false);

  const filteredPalettes = useMemo(() => {
    if (selectedCategory === "all") return PALETTE_PRESETS;
    const [start, end] = CATEGORY_RANGES[selectedCategory];
    return PALETTE_PRESETS.slice(start, end + 1);
  }, [selectedCategory]);

  const displayedPalettes = showAll ? filteredPalettes : filteredPalettes.slice(0, 12);

  function copyColor(color: string) {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    trackEvent("tool_use", { tool: "color_palette_generator", action: "copy_color" });
    setTimeout(() => setCopiedColor(null), 1500);
  }

  function handleRandomize() {
    setRandomizing(true);
    trackEvent("tool_use", { tool: "color_palette_generator", action: "randomize" });
    setTimeout(() => {
      const palette = PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];
      setActivePalette(palette);
      setTimeout(() => setRandomizing(false), 500);
    }, 150);
  }

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            {t.raw("meta.title").toString().includes("Gratis") ? "Gratis verktyg" : "Free tool"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-text-theme tracking-tight">
            {t("h1")}
          </h1>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Active palette + preview */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-12">
        <div className="bg-surface rounded-2xl shadow-lg border border-border-light p-6 sm:p-8">
          {/* Color strip */}
          <div className="flex rounded-xl overflow-hidden h-16 sm:h-20 shadow-inner mb-6">
            {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
              <div
                key={key}
                className="flex-1 cursor-pointer hover:flex-[1.3] transition-all duration-300"
                style={{ backgroundColor: activePalette[key] }}
                onClick={() => copyColor(activePalette[key])}
                title={`${t(key)}: ${activePalette[key]}`}
              />
            ))}
          </div>

          {/* Swatches */}
          <div className="flex justify-center gap-4 sm:gap-6 mb-6">
            {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
              <ColorSwatch
                key={key}
                color={activePalette[key]}
                label={t(key)}
                onCopy={() => copyColor(activePalette[key])}
                copied={copiedColor === activePalette[key]}
              />
            ))}
          </div>

          {/* Randomize button */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRandomize} disabled={randomizing}>
              <svg
                className={`w-4 h-4 mr-2 ${randomizing ? "animate-spin-once" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t("randomize")}
            </Button>
          </div>

          {/* Preview */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              {t("preview")}
            </h3>
            <PalettePreview palette={activePalette} t={t} />
          </div>
        </div>
      </section>

      {/* Category filters */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowAll(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface border border-border-light text-text-secondary hover:border-primary/30 hover:text-primary"
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Palette grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedPalettes.map((palette, i) => {
            const isActive =
              palette.primary === activePalette.primary &&
              palette.background === activePalette.background;

            return (
              <button
                key={`${palette.primary}-${palette.background}-${i}`}
                onClick={() => setActivePalette(palette)}
                className={`group bg-surface rounded-xl border overflow-hidden text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                  isActive
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-border-light hover:border-primary/30"
                }`}
              >
                {/* Color strip */}
                <div className="flex h-12">
                  {(["primary", "secondary", "accent", "background", "text"] as const).map((key) => (
                    <div
                      key={key}
                      className="flex-1"
                      style={{ backgroundColor: palette[key] }}
                    />
                  ))}
                </div>
                {/* Labels */}
                <div className="px-3 py-2.5 flex gap-1.5 flex-wrap">
                  {(["primary", "secondary", "accent"] as const).map((key) => (
                    <span
                      key={key}
                      className="text-[10px] font-mono text-text-muted bg-background rounded px-1.5 py-0.5"
                    >
                      {palette[key]}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Show all / Show less */}
        {filteredPalettes.length > 12 && (
          <div className="flex justify-center mt-8">
            <Button variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? t("showLess") : t("showAll")}
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${showAll ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
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
            onClick={() => trackEvent("cta_click", { target: "/create-site", location: "color_palette_generator" })}
          >
            {t("ctaButton")}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* FAQ */}
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
