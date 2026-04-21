"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { GOOGLE_FONTS, googleFontUrl } from "@/lib/fonts";
import type { FontOption } from "@/lib/fonts";

// Track which fonts have been loaded into the page
const loadedFonts = new Set<string>();

function ensureFontLoaded(fontName: string) {
  if (loadedFonts.has(fontName)) return;
  loadedFonts.add(fontName);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = googleFontUrl(fontName);
  document.head.appendChild(link);
}

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  label?: string;
}

export function FontSelector({ value, onChange, label }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load the currently selected font for preview
  useEffect(() => {
    if (value) ensureFontLoaded(value);
  }, [value]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search when opening
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return GOOGLE_FONTS;
    const q = search.toLowerCase();
    return GOOGLE_FONTS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.category.includes(q)
    );
  }, [search]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, FontOption[]> = {};
    for (const f of filtered) {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    }
    return groups;
  }, [filtered]);

  const categoryLabels: Record<string, string> = {
    "sans-serif": "Sans-serif",
    serif: "Serif",
    display: "Display",
    monospace: "Monospace",
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="mb-1 block text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
      >
        <span style={{ fontFamily: `"${value}", sans-serif` }}>
          {value || "Välj typsnitt..."}
        </span>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-border-light bg-white shadow-xl">
          {/* Search */}
          <div className="border-b border-border-light p-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök typsnitt..."
                className="w-full rounded-lg border border-border-light bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Font list */}
          <div ref={listRef} className="max-h-64 overflow-y-auto p-1">
            {Object.entries(grouped).map(([category, fonts]) => (
              <div key={category}>
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  {categoryLabels[category] || category}
                </div>
                {fonts.map((font) => (
                  <FontItem
                    key={font.name}
                    font={font}
                    selected={value === font.name}
                    onSelect={() => {
                      onChange(font.name);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-text-muted">
                Inget typsnitt hittades
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FontItem({
  font,
  selected,
  onSelect,
}: {
  font: FontOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(loadedFonts.has(font.name));

  // Lazy-load font when item becomes visible
  useEffect(() => {
    if (loaded) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          ensureFontLoaded(font.name);
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [font.name, loaded]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
        selected
          ? "bg-primary/10 text-primary-deep"
          : "text-primary-deep hover:bg-gray-50"
      }`}
    >
      <span
        className="text-[15px] truncate"
        style={{
          fontFamily: loaded ? `"${font.name}", ${font.category}` : font.category,
        }}
      >
        {font.name}
      </span>
      {selected && (
        <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
