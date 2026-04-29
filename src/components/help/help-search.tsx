"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { helpCategories } from "@/lib/help-content/registry";
import type { Locale } from "@/i18n/config";

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
}

export default function HelpSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const locale = useLocale() as Locale;
  const t = useTranslations("helpCenter");
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allArticles = useMemo(() => {
    const results: SearchResult[] = [];
    for (const cat of helpCategories) {
      for (const article of cat.articles) {
        const content = article.content[locale];
        results.push({
          title: content.title,
          description: content.description,
          href: `/help/${cat.slug}/${article.slug}`,
          category: cat.label[locale].title,
        });
      }
    }
    return results;
  }, [locale]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [query, allArticles]);

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full rounded-2xl border border-border-theme bg-surface py-3.5 pl-12 pr-4 text-sm text-primary-deep shadow-sm outline-none transition placeholder:text-text-muted focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border-theme bg-surface p-2 shadow-lg">
          {filtered.map((result) => (
            <button
              key={result.href}
              onClick={() => {
                router.push(result.href);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full flex-col rounded-xl px-4 py-3 text-left transition hover:bg-primary/5"
            >
              <span className="text-xs font-medium text-primary">{result.category}</span>
              <span className="text-sm font-semibold text-primary-deep">{result.title}</span>
              <span className="mt-0.5 text-xs text-text-muted line-clamp-1">{result.description}</span>
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-2xl border border-border-theme bg-surface p-6 text-center shadow-lg">
          <p className="text-sm text-text-muted">{t("noResults")}</p>
        </div>
      )}
    </div>
  );
}
