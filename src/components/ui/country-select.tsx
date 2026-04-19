"use client";

import { useState, useRef, useEffect, useMemo } from "react";

// ISO 3166-1 alpha-2 countries with flag emoji and Swedish names
const COUNTRIES = [
  { code: "SE", flag: "🇸🇪", name: "Sverige", nameEn: "Sweden" },
  { code: "NO", flag: "🇳🇴", name: "Norge", nameEn: "Norway" },
  { code: "DK", flag: "🇩🇰", name: "Danmark", nameEn: "Denmark" },
  { code: "FI", flag: "🇫🇮", name: "Finland", nameEn: "Finland" },
  { code: "IS", flag: "🇮🇸", name: "Island", nameEn: "Iceland" },
  { code: "DE", flag: "🇩🇪", name: "Tyskland", nameEn: "Germany" },
  { code: "GB", flag: "🇬🇧", name: "Storbritannien", nameEn: "United Kingdom" },
  { code: "US", flag: "🇺🇸", name: "USA", nameEn: "United States" },
  { code: "FR", flag: "🇫🇷", name: "Frankrike", nameEn: "France" },
  { code: "ES", flag: "🇪🇸", name: "Spanien", nameEn: "Spain" },
  { code: "IT", flag: "🇮🇹", name: "Italien", nameEn: "Italy" },
  { code: "NL", flag: "🇳🇱", name: "Nederländerna", nameEn: "Netherlands" },
  { code: "BE", flag: "🇧🇪", name: "Belgien", nameEn: "Belgium" },
  { code: "CH", flag: "🇨🇭", name: "Schweiz", nameEn: "Switzerland" },
  { code: "AT", flag: "🇦🇹", name: "Österrike", nameEn: "Austria" },
  { code: "PL", flag: "🇵🇱", name: "Polen", nameEn: "Poland" },
  { code: "PT", flag: "🇵🇹", name: "Portugal", nameEn: "Portugal" },
  { code: "IE", flag: "🇮🇪", name: "Irland", nameEn: "Ireland" },
  { code: "CZ", flag: "🇨🇿", name: "Tjeckien", nameEn: "Czech Republic" },
  { code: "RO", flag: "🇷🇴", name: "Rumänien", nameEn: "Romania" },
  { code: "HU", flag: "🇭🇺", name: "Ungern", nameEn: "Hungary" },
  { code: "GR", flag: "🇬🇷", name: "Grekland", nameEn: "Greece" },
  { code: "HR", flag: "🇭🇷", name: "Kroatien", nameEn: "Croatia" },
  { code: "BG", flag: "🇧🇬", name: "Bulgarien", nameEn: "Bulgaria" },
  { code: "SK", flag: "🇸🇰", name: "Slovakien", nameEn: "Slovakia" },
  { code: "SI", flag: "🇸🇮", name: "Slovenien", nameEn: "Slovenia" },
  { code: "LT", flag: "🇱🇹", name: "Litauen", nameEn: "Lithuania" },
  { code: "LV", flag: "🇱🇻", name: "Lettland", nameEn: "Latvia" },
  { code: "EE", flag: "🇪🇪", name: "Estland", nameEn: "Estonia" },
  { code: "LU", flag: "🇱🇺", name: "Luxemburg", nameEn: "Luxembourg" },
  { code: "MT", flag: "🇲🇹", name: "Malta", nameEn: "Malta" },
  { code: "CY", flag: "🇨🇾", name: "Cypern", nameEn: "Cyprus" },
  { code: "CA", flag: "🇨🇦", name: "Kanada", nameEn: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australien", nameEn: "Australia" },
  { code: "NZ", flag: "🇳🇿", name: "Nya Zeeland", nameEn: "New Zealand" },
  { code: "JP", flag: "🇯🇵", name: "Japan", nameEn: "Japan" },
  { code: "KR", flag: "🇰🇷", name: "Sydkorea", nameEn: "South Korea" },
  { code: "CN", flag: "🇨🇳", name: "Kina", nameEn: "China" },
  { code: "IN", flag: "🇮🇳", name: "Indien", nameEn: "India" },
  { code: "BR", flag: "🇧🇷", name: "Brasilien", nameEn: "Brazil" },
  { code: "MX", flag: "🇲🇽", name: "Mexiko", nameEn: "Mexico" },
  { code: "AR", flag: "🇦🇷", name: "Argentina", nameEn: "Argentina" },
  { code: "CL", flag: "🇨🇱", name: "Chile", nameEn: "Chile" },
  { code: "CO", flag: "🇨🇴", name: "Colombia", nameEn: "Colombia" },
  { code: "ZA", flag: "🇿🇦", name: "Sydafrika", nameEn: "South Africa" },
  { code: "TR", flag: "🇹🇷", name: "Turkiet", nameEn: "Turkey" },
  { code: "IL", flag: "🇮🇱", name: "Israel", nameEn: "Israel" },
  { code: "AE", flag: "🇦🇪", name: "Förenade Arabemiraten", nameEn: "United Arab Emirates" },
  { code: "SA", flag: "🇸🇦", name: "Saudiarabien", nameEn: "Saudi Arabia" },
  { code: "SG", flag: "🇸🇬", name: "Singapore", nameEn: "Singapore" },
  { code: "TH", flag: "🇹🇭", name: "Thailand", nameEn: "Thailand" },
  { code: "ID", flag: "🇮🇩", name: "Indonesien", nameEn: "Indonesia" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", nameEn: "Malaysia" },
  { code: "PH", flag: "🇵🇭", name: "Filippinerna", nameEn: "Philippines" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", nameEn: "Vietnam" },
  { code: "TW", flag: "🇹🇼", name: "Taiwan", nameEn: "Taiwan" },
  { code: "HK", flag: "🇭🇰", name: "Hongkong", nameEn: "Hong Kong" },
  { code: "EG", flag: "🇪🇬", name: "Egypten", nameEn: "Egypt" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", nameEn: "Nigeria" },
  { code: "KE", flag: "🇰🇪", name: "Kenya", nameEn: "Kenya" },
  { code: "UA", flag: "🇺🇦", name: "Ukraina", nameEn: "Ukraine" },
  { code: "RU", flag: "🇷🇺", name: "Ryssland", nameEn: "Russia" },
  { code: "RS", flag: "🇷🇸", name: "Serbien", nameEn: "Serbia" },
  { code: "BA", flag: "🇧🇦", name: "Bosnien och Hercegovina", nameEn: "Bosnia and Herzegovina" },
  { code: "AL", flag: "🇦🇱", name: "Albanien", nameEn: "Albania" },
  { code: "MK", flag: "🇲🇰", name: "Nordmakedonien", nameEn: "North Macedonia" },
  { code: "ME", flag: "🇲🇪", name: "Montenegro", nameEn: "Montenegro" },
  { code: "XK", flag: "🇽🇰", name: "Kosovo", nameEn: "Kosovo" },
  { code: "PE", flag: "🇵🇪", name: "Peru", nameEn: "Peru" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay", nameEn: "Uruguay" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador", nameEn: "Ecuador" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan", nameEn: "Pakistan" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh", nameEn: "Bangladesh" },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka", nameEn: "Sri Lanka" },
  { code: "MM", flag: "🇲🇲", name: "Myanmar", nameEn: "Myanmar" },
  { code: "NP", flag: "🇳🇵", name: "Nepal", nameEn: "Nepal" },
  { code: "MA", flag: "🇲🇦", name: "Marocko", nameEn: "Morocco" },
  { code: "TN", flag: "🇹🇳", name: "Tunisien", nameEn: "Tunisia" },
  { code: "GH", flag: "🇬🇭", name: "Ghana", nameEn: "Ghana" },
  { code: "ET", flag: "🇪🇹", name: "Etiopien", nameEn: "Ethiopia" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania", nameEn: "Tanzania" },
];

export const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));

export function getCountryByCode(code: string) {
  return COUNTRY_MAP[code.toUpperCase()] ?? null;
}

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
}

export function CountrySelect({ value, onChange, disabled, className = "" }: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = value ? getCountryByCode(value) : null;

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  // Close on outside click
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

  // Focus search on open
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation
  const [highlightIdx, setHighlightIdx] = useState(0);
  useEffect(() => {
    setHighlightIdx(0);
  }, [search, open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIdx]) {
        onChange(filtered[highlightIdx].code);
        setOpen(false);
        setSearch("");
      }
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.children;
    if (items[highlightIdx]) {
      (items[highlightIdx] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, open]);

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={`flex w-full items-center gap-2.5 rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-sm text-left transition-all duration-150 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? "border-primary/40 ring-2 ring-primary/20" : ""
        }`}
      >
        {selected ? (
          <>
            <span className="text-lg leading-none">{selected.flag}</span>
            <span className="flex-1 truncate text-primary-deep">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-text-muted">Välj land...</span>
        )}
        <svg
          className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border-light bg-white shadow-lg shadow-black/8 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search */}
          <div className="border-b border-border-light p-2">
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök land..."
                className="w-full rounded-lg border border-border-light bg-background py-2 pl-8 pr-3 text-sm text-primary-deep placeholder:text-text-muted focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Country list */}
          <div ref={listRef} className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-text-muted">
                Inget land hittades
              </div>
            ) : (
              filtered.map((country, idx) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    idx === highlightIdx
                      ? "bg-primary/5 text-primary-deep"
                      : "text-primary-deep hover:bg-primary/5"
                  } ${value === country.code ? "font-medium" : ""}`}
                >
                  <span className="text-lg leading-none">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-xs text-text-muted">{country.code}</span>
                  {value === country.code && (
                    <svg className="h-4 w-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
