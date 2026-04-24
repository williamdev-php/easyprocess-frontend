"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { SAVE_DRAFT, LOAD_DRAFT, PUBLISH_SITE_DATA, DISCARD_DRAFT } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";
import { MediaPickerField } from "@/components/media-picker";
import { FontSelector } from "@/components/ui/font-selector";
import { ColorPicker } from "@/components/ui/color-picker";
import RichTextEditor from "@/components/rich-text-editor";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SiteData {
  meta?: { title?: string; description?: string; keywords?: string[]; language?: string };
  section_order?: string[];
  theme?: string;
  style_variant?: number;
  nav_style?: string;
  footer_style?: string;
  branding?: {
    logo_url?: string | null;
    colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
    fonts?: { heading?: string; body?: string };
  };
  business?: {
    name?: string; tagline?: string; email?: string | null; phone?: string | null;
    address?: string | null; org_number?: string | null; social_links?: Record<string, string>;
  };
  hero?: { headline: string; subtitle?: string; cta?: { label: string; href: string } | null; background_image?: string | null; show_cta?: boolean; fullscreen?: boolean; show_gradient?: boolean } | null;
  about?: { title?: string; text?: string; image?: string | null; highlights?: { label: string; value: string }[] | null; show_highlights?: boolean } | null;
  features?: { title?: string; subtitle?: string; items?: { title: string; description: string; icon?: string }[] } | null;
  stats?: { title?: string; items?: { value: string; label: string }[] } | null;
  services?: { title?: string; subtitle?: string; items?: { title: string; description: string }[] } | null;
  process?: { title?: string; subtitle?: string; steps?: { title: string; description: string; step_number?: number }[] } | null;
  gallery?: { title?: string; subtitle?: string; images?: { url: string; alt?: string; caption?: string }[] } | null;
  team?: { title?: string; subtitle?: string; members?: { name: string; role?: string; image?: string | null; bio?: string }[] } | null;
  testimonials?: { title?: string; subtitle?: string; items?: { text: string; author: string; role?: string }[]; show_ratings?: boolean } | null;
  faq?: { title?: string; subtitle?: string; items?: { question: string; answer: string }[] } | null;
  cta?: { title?: string; text?: string; button?: { label: string; href: string } | null; show_button?: boolean } | null;
  contact?: { title?: string; text?: string; show_form?: boolean; show_info?: boolean } | null;
  pricing?: { title?: string; subtitle?: string; tiers?: { name: string; price: string; description?: string; features?: string[]; highlighted?: boolean; cta?: { label: string; href: string } | null }[] } | null;
  video?: { title?: string; subtitle?: string; video_url?: string; caption?: string } | null;
  logo_cloud?: { title?: string; subtitle?: string; logos?: { name: string; image_url?: string }[] } | null;
  custom_content?: { title?: string; subtitle?: string; layout?: string; blocks?: { type: string; content?: string; url?: string; alt?: string; label?: string; href?: string }[] } | null;
  banner?: { text?: string; button?: { label: string; href: string } | null; background_color?: string } | null;
  ranking?: { title?: string; subtitle?: string; items?: { rank?: number; title: string; description?: string; image?: string | null; link?: { label: string; href: string } | null }[] } | null;
  page_content?: { title?: string; content?: string } | null;
  extra_sections?: Record<string, { type: string; data: Record<string, unknown> }>;
  section_settings?: Record<string, { animation?: string; background_color?: string; show_gradient?: boolean }>;
  seo?: { structured_data?: Record<string, unknown>; robots?: string };
  pages?: {
    slug: string;
    title: string;
    meta?: { title?: string; description?: string; og_image?: string | null };
    sections: { type: string; data: Record<string, unknown> }[];
    parent_slug?: string | null;
    show_in_nav?: boolean;
    nav_order?: number;
  }[] | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Check if a section key is a duplicate instance (e.g. "about__dup_1700000000") */
function isDuplicateKey(key: string): boolean {
  return key.includes("__dup_");
}

/** Extract the section type from a key (handles both "about" and "about__dup_xxx") */
function getSectionType(key: string): string {
  return key.includes("__dup_") ? key.split("__dup_")[0] : key;
}

/** Get section data for a key — works for both originals and duplicates */
function getSectionData(data: SiteData, key: string): Record<string, unknown> | null {
  if (isDuplicateKey(key)) {
    return (data.extra_sections?.[key]?.data as Record<string, unknown>) || null;
  }
  const val = (data as Record<string, unknown>)[key];
  return (val && typeof val === "object") ? val as Record<string, unknown> : null;
}

/**
 * Create editor props for a duplicate section.
 * The editor reads/writes data[type] but we redirect to extra_sections[key].
 */
function makeDuplicateEditorProps(
  siteData: SiteData,
  dupKey: string,
  sectionType: string,
  handleChange: (d: SiteData) => void,
): { data: SiteData; onChange: (d: SiteData) => void } {
  const dupData = siteData.extra_sections?.[dupKey]?.data || {};
  // Virtual SiteData where data[sectionType] points to the duplicate's data
  const virtualData = { ...siteData, [sectionType]: dupData };

  const virtualOnChange = (newData: SiteData) => {
    const newSectionData = (newData as Record<string, unknown>)[sectionType];
    handleChange({
      ...siteData,
      extra_sections: {
        ...siteData.extra_sections,
        [dupKey]: { type: sectionType, data: (newSectionData as Record<string, unknown>) || {} },
      },
    });
  };

  return { data: virtualData, onChange: virtualOnChange };
}

// ---------------------------------------------------------------------------
// Section components
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  open,
  onToggle,
  enabled,
  onToggleEnabled,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  enabled?: boolean;
  onToggleEnabled?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 transition-colors duration-150 hover:bg-white/[0.04]">
      {onToggleEnabled !== undefined && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleEnabled(); }}
          className={`h-5 w-5 shrink-0 rounded border transition-colors ${
            enabled ? "border-blue-500 bg-blue-500 text-white" : "border-white/20 bg-white/5"
          }`}
        >
          {enabled && (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="flex flex-1 items-center justify-between"
      >
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        <svg
          className={`h-4 w-4 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-white/50">{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 placeholder:text-white/20"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 placeholder:text-white/20 resize-y"
    />
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(!checked); } }}
      className="flex items-center justify-between gap-2 py-1 cursor-pointer select-none"
    >
      <span className="text-xs font-medium text-white/50">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-blue-500" : "bg-white/20"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </span>
    </div>
  );
}


// ---------------------------------------------------------------------------
// List editor for items (services, features, FAQ, etc.)
// ---------------------------------------------------------------------------

function CollapsibleListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  addLabel,
  createDefault,
  titleKey,
  titleFallback,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: keyof T; label: string; type: "text" | "textarea" }[];
  addLabel: string;
  createDefault: () => T;
  titleKey: keyof T;
  titleFallback?: string;
}) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const update = (idx: number, key: keyof T, val: unknown) => {
    const next = deepClone(items);
    (next[idx] as Record<string, unknown>)[key as string] = val;
    onChange(next);
  };
  const remove = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    setOpenItems((prev) => { const n = new Set<number>(); prev.forEach((v) => { if (v < idx) n.add(v); else if (v > idx) n.add(v - 1); }); return n; });
  };
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = deepClone(items);
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
    setOpenItems((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) { n.delete(idx); n.add(target); }
      else if (n.has(target)) { n.delete(target); n.add(idx); }
      return n;
    });
  };
  const add = () => {
    const newIdx = items.length;
    onChange([...items, createDefault()]);
    setOpenItems((prev) => new Set(prev).add(newIdx));
  };
  const toggle = (idx: number) => {
    setOpenItems((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => {
        const isOpen = openItems.has(idx);
        const title = (item[titleKey] as string) || `${titleFallback || "Objekt"} #${idx + 1}`;
        return (
          <div key={idx} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button type="button" onClick={() => toggle(idx)} className="flex flex-1 items-center gap-2 min-w-0 text-left">
                <svg className={`h-3 w-3 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-medium text-white/80 truncate">{title}</span>
              </button>
              <div className="flex gap-0.5 shrink-0">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                  className="rounded p-0.5 text-white/40 hover:bg-white/10 disabled:opacity-20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx >= items.length - 1}
                  className="rounded p-0.5 text-white/40 hover:bg-white/10 disabled:opacity-20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button type="button" onClick={() => remove(idx)}
                  className="rounded p-0.5 text-red-400 hover:bg-red-500/10 hover:text-red-400">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="border-t border-white/10 px-3 py-2.5 space-y-2">
                {fields.map((f) => (
                  <div key={f.key as string}>
                    <label className="mb-0.5 block text-xs text-white/50">{f.label}</label>
                    {f.type === "textarea" ? (
                      <TextArea value={(item[f.key] as string) || ""} onChange={(v) => update(idx, f.key, v)} rows={2} />
                    ) : (
                      <TextInput value={(item[f.key] as string) || ""} onChange={(v) => update(idx, f.key, v)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {addLabel}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isValidEmail(v: string): boolean {
  return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string): boolean {
  return !v || /^[+\d\s()-]{3,20}$/.test(v);
}

function isValidUrl(v: string): boolean {
  if (!v) return true;
  try { new URL(v); return true; } catch { return false; }
}

function ValidatedInput({
  value,
  onChange,
  placeholder,
  validate,
  errorText,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  validate: (v: string) => boolean;
  errorText: string;
}) {
  const isValid = validate(value);
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white/90 outline-none transition-colors focus:ring-1 placeholder:text-white/20 ${
          !isValid
            ? "border-red-500/50 focus:border-red-400 focus:ring-red-500/20"
            : "border-white/10 focus:border-blue-500 focus:ring-blue-500/20"
        }`}
      />
      {!isValid && (
        <p className="mt-0.5 text-[10px] text-red-500">{errorText}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section editors
// ---------------------------------------------------------------------------

function BusinessEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const b = data.business || {};
  const set = (key: string, val: unknown) => {
    onChange({ ...data, business: { ...b, [key]: val } });
  };
  const socialLinks = b.social_links || {};
  const setSocial = (platform: string, val: string) => {
    const next = { ...socialLinks, [platform]: val };
    if (!val) delete next[platform];
    set("social_links", next);
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Företagsnamn"><TextInput value={b.name || ""} onChange={(v) => set("name", v)} /></FieldGroup>
      <FieldGroup label="Tagline"><TextInput value={b.tagline || ""} onChange={(v) => set("tagline", v)} /></FieldGroup>
      <FieldGroup label="E-post">
        <ValidatedInput value={b.email || ""} onChange={(v) => set("email", v)} validate={isValidEmail} errorText="Ogiltig e-postadress" placeholder="namn@foretag.se" />
      </FieldGroup>
      <FieldGroup label="Telefon">
        <ValidatedInput value={b.phone || ""} onChange={(v) => set("phone", v)} validate={isValidPhone} errorText="Ogiltigt telefonnummer" placeholder="+46 70 123 45 67" />
      </FieldGroup>
      <FieldGroup label="Adress"><TextInput value={b.address || ""} onChange={(v) => set("address", v)} /></FieldGroup>
      <FieldGroup label="Org.nummer"><TextInput value={b.org_number || ""} onChange={(v) => set("org_number", v)} /></FieldGroup>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <span className="text-xs font-medium text-white/50">Sociala medier</span>
        <FieldGroup label="Facebook">
          <ValidatedInput value={socialLinks.facebook || ""} onChange={(v) => setSocial("facebook", v)} validate={isValidUrl} errorText="Ogiltig URL" placeholder="https://facebook.com/foretag" />
        </FieldGroup>
        <FieldGroup label="Instagram">
          <ValidatedInput value={socialLinks.instagram || ""} onChange={(v) => setSocial("instagram", v)} validate={isValidUrl} errorText="Ogiltig URL" placeholder="https://instagram.com/foretag" />
        </FieldGroup>
        <FieldGroup label="LinkedIn">
          <ValidatedInput value={socialLinks.linkedin || ""} onChange={(v) => setSocial("linkedin", v)} validate={isValidUrl} errorText="Ogiltig URL" placeholder="https://linkedin.com/company/foretag" />
        </FieldGroup>
      </div>
    </div>
  );
}

function BrandingEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const colors = data.branding?.colors || {};
  const fonts = data.branding?.fonts || {};
  const setColor = (key: string, val: string) => {
    onChange({
      ...data,
      branding: { ...data.branding, colors: { ...colors, [key]: val } },
    });
  };
  const setBranding = (key: string, val: unknown) => {
    onChange({ ...data, branding: { ...data.branding, [key]: val } });
  };
  const setFont = (key: string, val: string) => {
    onChange({
      ...data,
      branding: { ...data.branding, fonts: { ...fonts, [key]: val } },
    });
  };
  const setTheme = (val: string) => onChange({ ...data, theme: val });
  const selectCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-blue-500";
  return (
    <div className="space-y-3 p-4">
      <MediaPickerField
        value={data.branding?.logo_url || ""}
        onChange={(url) => setBranding("logo_url", url || null)}
        label="Logotyp"
        folder="branding"
      />
      <FieldGroup label="Tema">
        <select value={data.theme || "modern"} onChange={(e) => setTheme(e.target.value)} className={selectCls}>
          <option value="modern">Modern</option>
          <option value="bold">Bold</option>
          <option value="elegant">Elegant</option>
          <option value="minimal">Minimal</option>
        </select>
      </FieldGroup>
      <FieldGroup label="Designstil">
        <select
          value={data.style_variant ?? 0}
          onChange={(e) => onChange({ ...data, style_variant: Number(e.target.value) })}
          className={selectCls}
        >
          <option value={0}>Original</option>
          <option value={1}>Modern Cards</option>
          <option value={2}>Clean &amp; Minimal</option>
          <option value={3}>Bold &amp; Filled</option>
        </select>
      </FieldGroup>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <span className="text-xs font-medium text-white/50">Layout</span>
        <FieldGroup label="Navbar-stil">
          <select
            value={data.nav_style || ""}
            onChange={(e) => onChange({ ...data, nav_style: e.target.value })}
            className={selectCls}
          >
            <option value="">Standard (från designstil)</option>
            <option value="floating">Flytande (pill)</option>
            <option value="sticky">Sticky (fast)</option>
            <option value="minimal">Minimal</option>
          </select>
        </FieldGroup>
        <FieldGroup label="Footer-stil">
          <select
            value={data.footer_style || ""}
            onChange={(e) => onChange({ ...data, footer_style: e.target.value })}
            className={selectCls}
          >
            <option value="">Standard (från designstil)</option>
            <option value="columns">Kolumner</option>
            <option value="centered">Centrerad</option>
            <option value="minimal">Minimal</option>
          </select>
        </FieldGroup>
      </div>
      <FontSelector value={fonts.heading || "Inter"} onChange={(v) => setFont("heading", v)} label="Rubrik-typsnitt" />
      <FontSelector value={fonts.body || "Inter"} onChange={(v) => setFont("body", v)} label="Brödtext-typsnitt" />
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        <ColorPicker value={colors.primary || "#2563eb"} onChange={(v) => setColor("primary", v)} label="Primär" />
        <ColorPicker value={colors.secondary || "#1e40af"} onChange={(v) => setColor("secondary", v)} label="Sekundär" />
        <ColorPicker value={colors.accent || "#f59e0b"} onChange={(v) => setColor("accent", v)} label="Accent" />
        <ColorPicker value={colors.background || "#ffffff"} onChange={(v) => setColor("background", v)} label="Bakgrund" />
        <ColorPicker value={colors.text || "#111827"} onChange={(v) => setColor("text", v)} label="Text" />
      </div>
    </div>
  );
}

function HeroEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const hero = data.hero || { headline: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, hero: { ...hero, [key]: val } });
  };
  const showCta = hero.show_cta !== false;
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={hero.headline || ""} onChange={(v) => set("headline", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextArea value={hero.subtitle || ""} onChange={(v) => set("subtitle", v)} rows={2} /></FieldGroup>
      <MediaPickerField
        value={hero.background_image || ""}
        onChange={(url) => set("background_image", url || null)}
        label="Bakgrundsbild"
        folder="hero"
      />
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <ToggleSwitch label="Visa CTA-knapp" checked={showCta} onChange={(v) => set("show_cta", v)} />
        {showCta && (
          <>
            <FieldGroup label="CTA-knapp text"><TextInput value={hero.cta?.label || ""} onChange={(v) => set("cta", { ...hero.cta, label: v, href: hero.cta?.href || "#contact" })} /></FieldGroup>
            <FieldGroup label="CTA-knapp länk"><TextInput value={hero.cta?.href || ""} onChange={(v) => set("cta", { ...hero.cta, label: hero.cta?.label || "", href: v })} /></FieldGroup>
          </>
        )}
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <ToggleSwitch label="Fullskärm" checked={hero.fullscreen !== false} onChange={(v) => set("fullscreen", v)} />
        <ToggleSwitch label="Visa gradient-effekt" checked={hero.show_gradient !== false} onChange={(v) => set("show_gradient", v)} />
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const about = data.about || { title: "Om oss", text: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, about: { ...about, [key]: val } });
  };
  const showHighlights = about.show_highlights !== false;
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={about.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Text"><TextArea value={about.text || ""} onChange={(v) => set("text", v)} rows={5} /></FieldGroup>
      <MediaPickerField
        value={about.image || ""}
        onChange={(url) => set("image", url || null)}
        label="Bild"
        folder="about"
      />
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <ToggleSwitch label="Visa höjdpunkter" checked={showHighlights} onChange={(v) => set("show_highlights", v)} />
        {showHighlights && (
          <CollapsibleListEditor
            items={about.highlights || []}
            onChange={(items) => set("highlights", items)}
            fields={[
              { key: "label", label: "Etikett", type: "text" },
              { key: "value", label: "Värde", type: "text" },
            ]}
            addLabel="Lägg till höjdpunkt"
            createDefault={() => ({ label: "", value: "" })}
            titleKey="label"
            titleFallback="Höjdpunkt"
          />
        )}
      </div>
    </div>
  );
}

function ServicesEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const services = data.services || { title: "Våra tjänster", subtitle: "", items: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, services: { ...services, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={services.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={services.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Tjänster">
        <CollapsibleListEditor
          items={services.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "title", label: "Namn", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till tjänst"
          createDefault={() => ({ title: "", description: "" })}
          titleKey="title"
          titleFallback="Tjänst"
        />
      </FieldGroup>
    </div>
  );
}

function FeaturesEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const features = data.features || { title: "Varför välja oss", subtitle: "", items: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, features: { ...features, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={features.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={features.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Egenskaper">
        <CollapsibleListEditor
          items={features.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "icon", label: "Ikon (emoji)", type: "text" },
            { key: "title", label: "Titel", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till egenskap"
          createDefault={() => ({ title: "", description: "", icon: "" })}
          titleKey="title"
          titleFallback="Egenskap"
        />
      </FieldGroup>
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const testimonials = data.testimonials || { title: "Omdömen", subtitle: "", items: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, testimonials: { ...testimonials, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={testimonials.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <ToggleSwitch label="Visa stjärnbetyg" checked={testimonials.show_ratings !== false} onChange={(v) => set("show_ratings", v)} />
      <FieldGroup label="Omdömen">
        <CollapsibleListEditor
          items={testimonials.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "author", label: "Namn", type: "text" },
            { key: "role", label: "Roll/Titel", type: "text" },
            { key: "text", label: "Omdöme", type: "textarea" },
          ]}
          addLabel="Lägg till omdöme"
          createDefault={() => ({ text: "", author: "", role: "" })}
          titleKey="author"
          titleFallback="Omdöme"
        />
      </FieldGroup>
    </div>
  );
}

function FAQEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const faq = data.faq || { title: "Vanliga frågor", subtitle: "", items: [] };
  const items = faq.items || [];
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const set = (key: string, val: unknown) => {
    onChange({ ...data, faq: { ...faq, [key]: val } });
  };
  const updateItem = (idx: number, key: string, val: string) => {
    const next = deepClone(items);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("items", next);
  };
  const removeItem = (idx: number) => {
    set("items", items.filter((_, i) => i !== idx));
    setOpenItems((prev) => { const n = new Set<number>(); prev.forEach((v) => { if (v < idx) n.add(v); else if (v > idx) n.add(v - 1); }); return n; });
  };
  const moveItem = (idx: number, dir: -1 | 1) => {
    const next = deepClone(items);
    const target = idx + dir;
    [next[idx], next[target]] = [next[target], next[idx]];
    set("items", next);
    setOpenItems((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) { n.delete(idx); n.add(target); }
      else if (n.has(target)) { n.delete(target); n.add(idx); }
      return n;
    });
  };
  const addItem = () => {
    const newIdx = items.length;
    set("items", [...items, { question: "", answer: "" }]);
    setOpenItems((prev) => new Set(prev).add(newIdx));
  };

  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={faq.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <div className="space-y-1.5">
        <label className="mb-0.5 block text-xs font-medium text-white/50">Frågor & Svar</label>
        {items.map((item, idx) => {
          const isOpen = openItems.has(idx);
          return (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpenItems((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; })}
                  className="flex flex-1 items-center gap-2 min-w-0 text-left"
                >
                  <svg className={`h-3 w-3 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-medium text-white/80 truncate">
                    {item.question || `Fråga #${idx + 1}`}
                  </span>
                </button>
                <div className="flex gap-0.5 shrink-0">
                  <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                    className="rounded p-0.5 text-white/40 hover:bg-white/10 disabled:opacity-20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx >= items.length - 1}
                    className="rounded p-0.5 text-white/40 hover:bg-white/10 disabled:opacity-20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button type="button" onClick={() => removeItem(idx)}
                    className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-white/10 px-3 py-2.5 space-y-2">
                  <FieldGroup label="Fråga"><TextInput value={item.question || ""} onChange={(v) => updateItem(idx, "question", v)} /></FieldGroup>
                  <FieldGroup label="Svar"><TextArea value={item.answer || ""} onChange={(v) => updateItem(idx, "answer", v)} rows={3} /></FieldGroup>
                </div>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Lägg till fråga
        </button>
      </div>
    </div>
  );
}

function GalleryEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const gallery = data.gallery || { title: "Galleri", subtitle: "", images: [] };
  const images = gallery.images || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, gallery: { ...gallery, [key]: val } });
  };
  const updateImage = (idx: number, key: string, val: string) => {
    const next = deepClone(images);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("images", next);
  };
  const removeImage = (idx: number) => {
    set("images", images.filter((_, i) => i !== idx));
  };
  const addImage = () => {
    set("images", [...images, { url: "", alt: "", caption: "" }]);
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={gallery.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Bilder">
        <div className="space-y-2">
          {images.map((img, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <MediaPickerField
                  value={img.url || ""}
                  onChange={(url) => updateImage(idx, "url", url)}
                  label={`Bild #${idx + 1}`}
                  folder="gallery"
                />
                <button type="button" onClick={() => removeImage(idx)}
                  className="mt-5 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FieldGroup label="Alt-text"><TextInput value={img.alt || ""} onChange={(v) => updateImage(idx, "alt", v)} /></FieldGroup>
              <FieldGroup label="Bildtext"><TextInput value={img.caption || ""} onChange={(v) => updateImage(idx, "caption", v)} /></FieldGroup>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Lägg till bild
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function ProcessEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const process = data.process || { title: "Så fungerar det", subtitle: "", steps: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, process: { ...process, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={process.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={process.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Steg">
        <CollapsibleListEditor
          items={process.steps || []}
          onChange={(items) => set("steps", items.map((s, i) => ({ ...s, step_number: i + 1 })))}
          fields={[
            { key: "title", label: "Rubrik", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till steg"
          createDefault={() => ({ title: "", description: "", step_number: 0 })}
          titleKey="title"
          titleFallback="Steg"
        />
      </FieldGroup>
    </div>
  );
}

function CTAEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const cta = data.cta || { title: "", text: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, cta: { ...cta, [key]: val } });
  };
  const showButton = cta.show_button !== false;
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={cta.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Text"><TextArea value={cta.text || ""} onChange={(v) => set("text", v)} rows={2} /></FieldGroup>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <ToggleSwitch label="Visa knapp" checked={showButton} onChange={(v) => set("show_button", v)} />
        {showButton && (
          <>
            <FieldGroup label="Knapptext"><TextInput value={cta.button?.label || ""} onChange={(v) => set("button", { ...cta.button, label: v, href: cta.button?.href || "#contact" })} /></FieldGroup>
            <FieldGroup label="Knapplänk"><TextInput value={cta.button?.href || ""} onChange={(v) => set("button", { ...cta.button, label: cta.button?.label || "", href: v })} /></FieldGroup>
          </>
        )}
      </div>
    </div>
  );
}

function ContactEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const contact = data.contact || { title: "Kontakta oss", text: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, contact: { ...contact, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={contact.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Text"><TextArea value={contact.text || ""} onChange={(v) => set("text", v)} rows={2} /></FieldGroup>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1">
        <ToggleSwitch label="Visa kontaktformulär" checked={contact.show_form !== false} onChange={(v) => set("show_form", v)} />
        <ToggleSwitch label="Visa kontaktuppgifter" checked={contact.show_info !== false} onChange={(v) => set("show_info", v)} />
      </div>
    </div>
  );
}

function PricingEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const pricing = data.pricing || { title: "Priser", subtitle: "", tiers: [] };
  const tiers = pricing.tiers || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, pricing: { ...pricing, [key]: val } });
  };
  const updateTier = (idx: number, key: string, val: unknown) => {
    const next = deepClone(tiers);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("tiers", next);
  };
  const removeTier = (idx: number) => set("tiers", tiers.filter((_, i) => i !== idx));
  const addTier = () => set("tiers", [...tiers, { name: "", price: "", description: "", features: [], highlighted: false, cta: null }]);

  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={pricing.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={pricing.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Prisplaner">
        <div className="space-y-2">
          {tiers.map((tier, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/80">{tier.name || `Plan #${idx + 1}`}</span>
                <button type="button" onClick={() => removeTier(idx)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <FieldGroup label="Namn"><TextInput value={tier.name || ""} onChange={(v) => updateTier(idx, "name", v)} /></FieldGroup>
              <FieldGroup label="Pris"><TextInput value={tier.price || ""} onChange={(v) => updateTier(idx, "price", v)} placeholder="t.ex. 299 kr/mån" /></FieldGroup>
              <FieldGroup label="Beskrivning"><TextArea value={tier.description || ""} onChange={(v) => updateTier(idx, "description", v)} rows={2} /></FieldGroup>
              <FieldGroup label="Funktioner (en per rad)">
                <TextArea
                  value={(tier.features || []).join("\n")}
                  onChange={(v) => updateTier(idx, "features", v.split("\n").filter(Boolean))}
                  rows={3}
                  placeholder="Funktion 1&#10;Funktion 2&#10;Funktion 3"
                />
              </FieldGroup>
              <ToggleSwitch label="Markera som populär" checked={tier.highlighted || false} onChange={(v) => updateTier(idx, "highlighted", v)} />
              <div className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-2">
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-wide">CTA-knapp</span>
                <FieldGroup label="Knapptext"><TextInput value={tier.cta?.label || ""} onChange={(v) => updateTier(idx, "cta", { ...tier.cta, label: v, href: tier.cta?.href || "#contact" })} /></FieldGroup>
                <FieldGroup label="Knapplänk"><TextInput value={tier.cta?.href || ""} onChange={(v) => updateTier(idx, "cta", { ...tier.cta, label: tier.cta?.label || "", href: v })} /></FieldGroup>
              </div>
            </div>
          ))}
          <button type="button" onClick={addTier} className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Lägg till prisplan
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function VideoEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const video = data.video || { title: "", subtitle: "", video_url: "", caption: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, video: { ...video, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={video.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={video.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Video-URL">
        <ValidatedInput value={video.video_url || ""} onChange={(v) => set("video_url", v)} validate={isValidUrl} errorText="Ogiltig URL" placeholder="https://youtube.com/watch?v=..." />
      </FieldGroup>
      <FieldGroup label="Bildtext"><TextInput value={video.caption || ""} onChange={(v) => set("caption", v)} /></FieldGroup>
    </div>
  );
}

function LogoCloudEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const logoCloud = data.logo_cloud || { title: "", subtitle: "", logos: [] };
  const logos = logoCloud.logos || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, logo_cloud: { ...logoCloud, [key]: val } });
  };
  const updateLogo = (idx: number, key: string, val: unknown) => {
    const next = deepClone(logos);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("logos", next);
  };
  const removeLogo = (idx: number) => set("logos", logos.filter((_, i) => i !== idx));
  const addLogo = () => set("logos", [...logos, { name: "", image_url: "" }]);

  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={logoCloud.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={logoCloud.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Logotyper">
        <div className="space-y-2">
          {logos.map((logo, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/80">{logo.name || `Logo #${idx + 1}`}</span>
                <button type="button" onClick={() => removeLogo(idx)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <FieldGroup label="Namn"><TextInput value={logo.name || ""} onChange={(v) => updateLogo(idx, "name", v)} /></FieldGroup>
              <MediaPickerField
                value={logo.image_url || ""}
                onChange={(url) => updateLogo(idx, "image_url", url)}
                label="Logotyp"
                folder="logos"
              />
            </div>
          ))}
          <button type="button" onClick={addLogo} className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Lägg till logotyp
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function CustomContentEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const cc = data.custom_content || { title: "", subtitle: "", layout: "default", blocks: [] };
  const blocks = cc.blocks || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, custom_content: { ...cc, [key]: val } });
  };
  const selectCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-blue-500";
  const updateBlock = (idx: number, key: string, val: unknown) => {
    const next = deepClone(blocks);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("blocks", next);
  };
  const removeBlock = (idx: number) => set("blocks", blocks.filter((_, i) => i !== idx));
  const addBlock = () => set("blocks", [...blocks, { type: "text", content: "" }]);

  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={cc.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={cc.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Layout">
        <select value={cc.layout || "default"} onChange={(e) => set("layout", e.target.value)} className={selectCls}>
          <option value="default">Standard</option>
          <option value="grid">Rutnät</option>
          <option value="columns">Kolumner</option>
        </select>
      </FieldGroup>
      <FieldGroup label="Innehållsblock">
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/80">Block #{idx + 1} ({block.type})</span>
                <button type="button" onClick={() => removeBlock(idx)} className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <FieldGroup label="Typ">
                <select value={block.type || "text"} onChange={(e) => updateBlock(idx, "type", e.target.value)} className={selectCls}>
                  <option value="text">Text</option>
                  <option value="image">Bild</option>
                  <option value="button">Knapp</option>
                </select>
              </FieldGroup>
              {block.type === "text" && (
                <FieldGroup label="Innehåll"><TextArea value={block.content || ""} onChange={(v) => updateBlock(idx, "content", v)} rows={3} /></FieldGroup>
              )}
              {block.type === "image" && (
                <>
                  <MediaPickerField value={block.url || ""} onChange={(url) => updateBlock(idx, "url", url)} label="Bild" folder="custom" />
                  <FieldGroup label="Alt-text"><TextInput value={block.alt || ""} onChange={(v) => updateBlock(idx, "alt", v)} /></FieldGroup>
                </>
              )}
              {block.type === "button" && (
                <>
                  <FieldGroup label="Knapptext"><TextInput value={block.label || ""} onChange={(v) => updateBlock(idx, "label", v)} /></FieldGroup>
                  <FieldGroup label="Knapplänk"><TextInput value={block.href || ""} onChange={(v) => updateBlock(idx, "href", v)} /></FieldGroup>
                </>
              )}
            </div>
          ))}
          <button type="button" onClick={addBlock} className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Lägg till block
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function BannerEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const banner = data.banner || { text: "", button: null, background_color: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, banner: { ...banner, [key]: val } });
  };
  const hasButton = !!banner.button;
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Text"><TextInput value={banner.text || ""} onChange={(v) => set("text", v)} /></FieldGroup>
      <div className="flex justify-center">
        <ColorPicker value={banner.background_color || "#2563eb"} onChange={(v) => set("background_color", v)} label="Bakgrundsfärg" />
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <ToggleSwitch label="Visa knapp" checked={hasButton} onChange={(v) => set("button", v ? { label: "", href: "#contact" } : null)} />
        {hasButton && (
          <>
            <FieldGroup label="Knapptext"><TextInput value={banner.button?.label || ""} onChange={(v) => set("button", { ...banner.button, label: v, href: banner.button?.href || "#contact" })} /></FieldGroup>
            <FieldGroup label="Knapplänk"><TextInput value={banner.button?.href || ""} onChange={(v) => set("button", { ...banner.button, label: banner.button?.label || "", href: v })} /></FieldGroup>
          </>
        )}
      </div>
    </div>
  );
}

function StatsEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const stats = data.stats || { title: "", items: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, stats: { ...stats, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={stats.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Statistik">
        <CollapsibleListEditor
          items={stats.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "value", label: "Värde (t.ex. 500+)", type: "text" },
            { key: "label", label: "Etikett", type: "text" },
          ]}
          addLabel="Lägg till statistik"
          createDefault={() => ({ value: "", label: "" })}
          titleKey="label"
          titleFallback="Statistik"
        />
      </FieldGroup>
    </div>
  );
}

function TeamEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const team = data.team || { title: "Vårt team", subtitle: "", members: [] };
  const members = team.members || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, team: { ...team, [key]: val } });
  };
  const updateMember = (idx: number, key: string, val: unknown) => {
    const next = deepClone(members);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("members", next);
  };
  const removeMember = (idx: number) => {
    set("members", members.filter((_, i) => i !== idx));
  };
  const addMember = () => {
    set("members", [...members, { name: "", role: "", bio: "", image: null }]);
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={team.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Medlemmar">
        <div className="space-y-2">
          {members.map((member, idx) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/80">{member.name || `Medlem #${idx + 1}`}</span>
                <button type="button" onClick={() => removeMember(idx)}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MediaPickerField
                value={member.image || ""}
                onChange={(url) => updateMember(idx, "image", url || null)}
                label="Profilbild"
                folder="team"
              />
              <FieldGroup label="Namn"><TextInput value={member.name || ""} onChange={(v) => updateMember(idx, "name", v)} /></FieldGroup>
              <FieldGroup label="Roll"><TextInput value={member.role || ""} onChange={(v) => updateMember(idx, "role", v)} /></FieldGroup>
              <FieldGroup label="Bio"><TextArea value={member.bio || ""} onChange={(v) => updateMember(idx, "bio", v)} rows={2} /></FieldGroup>
            </div>
          ))}
          <button
            type="button"
            onClick={addMember}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Lägg till medlem
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function RankingEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const ranking = data.ranking || { title: "Topplista", subtitle: "", items: [] };
  const items = ranking.items || [];
  const set = (key: string, val: unknown) => {
    onChange({ ...data, ranking: { ...ranking, [key]: val } });
  };
  const updateItem = (idx: number, key: string, val: unknown) => {
    const next = deepClone(items);
    (next[idx] as Record<string, unknown>)[key] = val;
    set("items", next);
  };
  const removeItem = (idx: number) => {
    set("items", items.filter((_: unknown, i: number) => i !== idx));
  };
  const addItem = () => {
    set("items", [...items, { rank: items.length + 1, title: "", description: "", image: null, link: null }]);
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={ranking.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextInput value={ranking.subtitle || ""} onChange={(v) => set("subtitle", v)} /></FieldGroup>
      <FieldGroup label="Rankade objekt">
        <div className="space-y-2">
          {items.map((item: NonNullable<NonNullable<SiteData["ranking"]>["items"]>[number], idx: number) => (
            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white/80">#{item.rank || idx + 1} {item.title || `Objekt #${idx + 1}`}</span>
                <button type="button" onClick={() => removeItem(idx)}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FieldGroup label="Rankning"><TextInput value={String(item.rank || idx + 1)} onChange={(v) => updateItem(idx, "rank", parseInt(v) || idx + 1)} /></FieldGroup>
              <FieldGroup label="Titel"><TextInput value={item.title || ""} onChange={(v) => updateItem(idx, "title", v)} /></FieldGroup>
              <FieldGroup label="Beskrivning"><TextArea value={item.description || ""} onChange={(v) => updateItem(idx, "description", v)} rows={2} /></FieldGroup>
              <MediaPickerField
                value={item.image || ""}
                onChange={(url) => updateItem(idx, "image", url || null)}
                label="Bild"
                folder="ranking"
              />
              <div className="rounded-lg border border-white/10 bg-white/5 p-2 space-y-2">
                <ToggleSwitch label="Extern länk" checked={!!item.link} onChange={(v) => updateItem(idx, "link", v ? { label: "Besök", href: "" } : null)} />
                {item.link && (
                  <>
                    <FieldGroup label="Knapptext"><TextInput value={item.link.label || ""} onChange={(v) => updateItem(idx, "link", { ...item.link, label: v, href: item.link?.href || "" })} /></FieldGroup>
                    <FieldGroup label="URL"><TextInput value={item.link.href || ""} onChange={(v) => updateItem(idx, "link", { ...item.link, label: item.link?.label || "", href: v })} /></FieldGroup>
                  </>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:border-blue-500 hover:text-blue-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Lägg till objekt
          </button>
        </div>
      </FieldGroup>
    </div>
  );
}

function PageContentEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const pc = data.page_content || { title: "", content: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, page_content: { ...pc, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={pc.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Innehåll">
        <div className="rounded-lg border border-white/10 bg-white p-1">
          <RichTextEditor
            content={pc.content || ""}
            onChange={(v) => set("content", v)}
            placeholder="Skriv sidans innehåll här..."
          />
        </div>
      </FieldGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section config
// ---------------------------------------------------------------------------

const DEFAULT_SECTION_ORDER = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
  "pricing", "video", "logo_cloud", "custom_content", "banner",
  "ranking", "page_content",
];

const SECTION_MAP: Record<string, { label: string; Editor: React.ComponentType<{ data: SiteData; onChange: (d: SiteData) => void }>; toggleable: boolean }> = {
  business: { label: "Företagsinformation", Editor: BusinessEditor, toggleable: false },
  branding: { label: "Varumärke & Färger", Editor: BrandingEditor, toggleable: false },
  hero: { label: "Hero-sektion", Editor: HeroEditor, toggleable: true },
  about: { label: "Om oss", Editor: AboutEditor, toggleable: true },
  features: { label: "Egenskaper", Editor: FeaturesEditor, toggleable: true },
  stats: { label: "Statistik", Editor: StatsEditor, toggleable: true },
  services: { label: "Tjänster", Editor: ServicesEditor, toggleable: true },
  process: { label: "Process / Steg", Editor: ProcessEditor, toggleable: true },
  gallery: { label: "Galleri", Editor: GalleryEditor, toggleable: true },
  team: { label: "Team", Editor: TeamEditor, toggleable: true },
  testimonials: { label: "Omdömen", Editor: TestimonialsEditor, toggleable: true },
  faq: { label: "Vanliga frågor", Editor: FAQEditor, toggleable: true },
  cta: { label: "Call-to-action", Editor: CTAEditor, toggleable: true },
  contact: { label: "Kontakt", Editor: ContactEditor, toggleable: true },
  pricing: { label: "Priser", Editor: PricingEditor, toggleable: true },
  video: { label: "Video", Editor: VideoEditor, toggleable: true },
  logo_cloud: { label: "Logotyper (partners)", Editor: LogoCloudEditor, toggleable: true },
  custom_content: { label: "Eget innehåll", Editor: CustomContentEditor, toggleable: true },
  banner: { label: "Banner", Editor: BannerEditor, toggleable: true },
  ranking: { label: "Topplista", Editor: RankingEditor, toggleable: true },
  page_content: { label: "Sidinnehåll", Editor: PageContentEditor, toggleable: true },
};

// Non-content sections always appear first (not draggable)
const FIXED_SECTIONS = ["business", "branding"];

function DraggableSectionItem({
  sectionKey,
  label,
  Editor,
  toggleable,
  isOpen,
  isEnabled,
  isDuplicate: isDup,
  isFirst,
  isLast,
  onToggle,
  onToggleEnabled,
  onDuplicate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragOver,
  siteData,
  handleChange,
}: {
  sectionKey: string;
  label: string;
  Editor: React.ComponentType<{ data: SiteData; onChange: (d: SiteData) => void }>;
  toggleable: boolean;
  isOpen: boolean;
  isEnabled: boolean;
  isDuplicate?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onToggleEnabled?: () => void;
  onDuplicate?: () => void;
  onRemove?: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  siteData: SiteData;
  handleChange: (d: SiteData) => void;
}) {
  // For duplicates, wrap the editor props to redirect data to extra_sections
  const editorProps = isDup
    ? makeDuplicateEditorProps(siteData, sectionKey, getSectionType(sectionKey), handleChange)
    : { data: siteData, onChange: handleChange };

  return (
    <div
      id={`editor-section-${sectionKey}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`rounded-lg mx-2 mb-1.5 border bg-white/[0.06] transition-all duration-150 hover:shadow-md hover:shadow-black/20 hover:border-white/20 ${isDragOver ? "border-t-2 border-t-blue-500" : "border-white/10"} ${isDup ? "border-l-2 border-l-blue-500/40" : ""}`}
    >
      <div className="flex items-center gap-0">
        {/* Drag handle */}
        <div className="flex flex-col items-center shrink-0 w-8 self-stretch justify-center gap-0.5 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors rounded-l-lg">
          <svg className="h-4 w-4 pointer-events-none" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>

        {/* Up/down buttons */}
        <div className="flex flex-col shrink-0">
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={isFirst}
            className="p-0.5 text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-default transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
            className="p-0.5 text-white/40 hover:text-white/80 disabled:opacity-20 disabled:cursor-default transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 pr-2">
            <div className="flex-1 min-w-0">
              <SectionHeader
                title={label}
                open={isOpen}
                onToggle={onToggle}
                enabled={isDup ? undefined : (toggleable ? isEnabled : undefined)}
                onToggleEnabled={isDup ? undefined : onToggleEnabled}
              />
            </div>
            {/* Duplicate button */}
            {toggleable && onDuplicate && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="shrink-0 rounded p-1 text-white/30 hover:text-blue-400 hover:bg-white/5 transition-colors"
                title="Duplicera sektion"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </button>
            )}
            {/* Remove button for duplicates */}
            {isDup && onRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="shrink-0 rounded p-1 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Ta bort kopia"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Slide animation wrapper */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen && isEnabled ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <Editor data={editorProps.data} onChange={editorProps.onChange} />
          {toggleable && (
            <SectionSettingsPanel sectionKey={sectionKey} data={siteData} onChange={handleChange} />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionSettingsPanel({ sectionKey, data, onChange }: { sectionKey: string; data: SiteData; onChange: (d: SiteData) => void }) {
  const settings = data.section_settings?.[sectionKey] || {};
  const setField = (key: string, val: unknown) => {
    const next = {
      ...data,
      section_settings: {
        ...data.section_settings,
        [sectionKey]: { ...settings, [key]: val },
      },
    };
    onChange(next);
  };
  const hasBgColor = !!settings.background_color;
  const showGradient = settings.show_gradient !== false;
  const selectCls = "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none focus:border-blue-500";
  return (
    <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Sektionsinställningar</span>
      <FieldGroup label="Animation">
        <select value={settings.animation || "fade-up"} onChange={(e) => setField("animation", e.target.value)} className={selectCls}>
          <option value="fade-up">Fade up</option>
          <option value="fade-in">Fade in</option>
          <option value="slide-left">Slide left</option>
          <option value="slide-right">Slide right</option>
          <option value="scale">Scale</option>
          <option value="none">Ingen</option>
        </select>
      </FieldGroup>
      <ToggleSwitch label="Visa gradient-effekt" checked={showGradient} onChange={(v) => setField("show_gradient", v)} />
      <ToggleSwitch label="Egen bakgrundsfärg" checked={hasBgColor} onChange={(v) => setField("background_color", v ? "#ffffff" : "")} />
      {hasBgColor && (
        <div className="flex justify-center">
          <ColorPicker
            value={settings.background_color || "#ffffff"}
            onChange={(v) => setField("background_color", v)}
            label="Bakgrundsfärg"
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SiteEditorPage() {
  const params = useParams();
  const siteId = params.id as string;
  const t = useTranslations("siteEditor");
  const searchParams = useSearchParams();
  const nextRouter = useNextRouter();

  const { data, loading, error } = useQuery<any>(MY_SITE, { variables: { id: siteId } });
  const [saveDraftMutation] = useMutation(SAVE_DRAFT);
  const [loadDraftMutation] = useMutation<{ loadDraft: { siteId: string; draftData: any; updatedAt: string } }>(LOAD_DRAFT);
  const [publishSiteDataMutation] = useMutation(PUBLISH_SITE_DATA);
  const [discardDraftMutation] = useMutation(DISCARD_DRAFT);

  // Read initial page from ?page= URL parameter
  const initialPage = searchParams.get("page") || null;

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<"idle" | "draft_saving" | "draft_saved" | "publishing" | "published" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isDraggingSection, setIsDraggingSection] = useState(false);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [activePage, setActivePage] = useState<string | null>(initialPage); // null = home, string = page slug

  /** Update activePage state AND sync to URL search params. */
  const changeActivePage = useCallback((pageSlug: string | null) => {
    setActivePage(pageSlug);
    const url = new URL(window.location.href);
    if (pageSlug) {
      url.searchParams.set("page", pageSlug);
    } else {
      url.searchParams.delete("page");
    }
    nextRouter.replace(url.pathname + url.search, { scroll: false });
  }, [nextRouter]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disabledSectionsCache = useRef<Record<string, unknown>>({});
  const siteDataRef = useRef<SiteData | null>(null);
  const publishedDataRef = useRef<SiteData | null>(null);
  const dragSourceRef = useRef<string | null>(null);
  siteDataRef.current = siteData;

  // Init: load published data, then check for draft
  useEffect(() => {
    if (data?.mySite?.siteData && !siteData) {
      const published = deepClone(data.mySite.siteData);
      publishedDataRef.current = published;
      setSiteData(published);

      // Try loading draft
      loadDraftMutation({ variables: { siteId } })
        .then((res) => {
          const draft = res.data?.loadDraft;
          if (draft?.draftData) {
            setSiteData(deepClone(draft.draftData));
            setHasDraft(true);
            setHasUnsavedChanges(true);
          }
        })
        .catch(() => { /* no draft */ });
    }
  }, [data, siteData, siteId, loadDraftMutation]);

  // When siteData first loads and there's a ?page= param, push it to the iframe
  const didPushInitialPage = useRef(false);
  useEffect(() => {
    if (siteData && initialPage && !didPushInitialPage.current) {
      didPushInitialPage.current = true;
      // Small delay to let iframe load
      setTimeout(() => pushToIframe(siteData, initialPage), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteData, initialPage]);

  // Known viewer origins for postMessage validation. Use "*" for sending
  // since the iframe URL is determined at runtime (may be qvickosite.com in
  // production even when the env var says localhost). Incoming messages are
  // validated against a known-good list instead.
  const knownViewerOrigins = useMemo(() => new Set([
    "https://preview.qvickosite.com",
    "https://qvickosite.com",
    "https://www.qvickosite.com",
    "http://localhost:3001",
  ].map((u) => { try { return new URL(u).origin; } catch { return u; } })), []);

  // Send current data to iframe
  const pushToIframe = useCallback((d: SiteData, pageSlug?: string | null) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SITE_DATA_UPDATE", siteData: d, activePage: pageSlug ?? null },
        "*"
      );
    }
  }, []);

  // Listen for messages from the viewer iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Validate origin against known viewer origins
      if (!knownViewerOrigins.has(event.origin)) return;

      const msg = event.data;
      if (!msg?.type) return;

      if (msg.type === "PREVIEW_READY") {
        const current = siteDataRef.current;
        if (current) pushToIframe(current, activePage);
        return;
      }

      if (msg.type === "SECTION_CLICKED" && msg.section) {
        const section = msg.section as string;
        setOpenSections((prev) => {
          const next = new Set(prev);
          next.add(section);
          return next;
        });
        setTimeout(() => {
          const el = document.getElementById(`editor-section-${section}`);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pushToIframe, knownViewerOrigins]);

  // Handle changes: update preview + auto-save draft
  const handleChange = useCallback(
    (newData: SiteData) => {
      setSiteData(newData);
      setHasUnsavedChanges(true);
      setHasDraft(true);

      // Immediate preview update
      pushToIframe(newData, activePage);

      // Debounced draft auto-save (every 3 seconds)
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(async () => {
        setSaveStatus("draft_saving");
        try {
          await saveDraftMutation({
            variables: { input: { siteId, draftData: newData } },
          });
          setSaveStatus("draft_saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        } catch {
          setSaveStatus("error");
        }
      }, 3000);
    },
    [siteId, saveDraftMutation, pushToIframe]
  );

  // Publish: save to site_data, delete draft, invalidate caches
  const handlePublish = useCallback(async () => {
    const current = siteDataRef.current;
    if (!current) return;

    // Cancel pending draft save
    if (draftTimer.current) clearTimeout(draftTimer.current);

    setSaveStatus("publishing");
    try {
      await publishSiteDataMutation({
        variables: { input: { siteId, siteData: current } },
      });
      publishedDataRef.current = deepClone(current);
      setHasUnsavedChanges(false);
      setHasDraft(false);
      setSaveStatus("published");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
    }
  }, [siteId, publishSiteDataMutation]);

  // Discard draft: revert to published data
  const handleDiscardDraft = useCallback(async () => {
    if (!publishedDataRef.current) return;
    try {
      await discardDraftMutation({ variables: { siteId } });
    } catch { /* ignore */ }
    const published = deepClone(publishedDataRef.current);
    setSiteData(published);
    pushToIframe(published);
    setHasUnsavedChanges(false);
    setHasDraft(false);
    setSaveStatus("idle");
  }, [siteId, discardDraftMutation, pushToIframe]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSectionEnabled = (key: string) => {
    if (!siteData) return;
    const next = deepClone(siteData);
    const current = (next as Record<string, unknown>)[key];
    if (current) {
      // Disabling — cache the current data so we can restore it
      disabledSectionsCache.current[key] = deepClone(current);
      (next as Record<string, unknown>)[key] = null;
    } else {
      // Re-enabling — restore from cache, fall back to empty defaults
      const cached = disabledSectionsCache.current[key];
      if (cached) {
        (next as Record<string, unknown>)[key] = deepClone(cached);
      } else {
        const defaults: Record<string, unknown> = {
          hero: { headline: "", subtitle: "", show_cta: true },
          about: { title: "Om oss", text: "", show_highlights: true },
          features: { title: "Varför välja oss", subtitle: "", items: [{ title: "Egenskap 1", description: "Beskriv en fördel", icon: "" }] },
          stats: { title: "Statistik", items: [{ value: "100+", label: "Nöjda kunder" }, { value: "10 år", label: "Erfarenhet" }, { value: "98%", label: "Kundnöjdhet" }] },
          services: { title: "Våra tjänster", subtitle: "", items: [{ title: "Tjänst 1", description: "Beskriv tjänsten" }] },
          process: { title: "Så fungerar det", subtitle: "", steps: [{ title: "Steg 1", description: "Beskriv första steget", step_number: 1 }, { title: "Steg 2", description: "Beskriv andra steget", step_number: 2 }, { title: "Steg 3", description: "Beskriv tredje steget", step_number: 3 }] },
          gallery: { title: "Galleri", subtitle: "", images: [] },
          team: { title: "Vårt team", subtitle: "", members: [{ name: "Namn", role: "Roll", bio: "", image: null }] },
          testimonials: { title: "Omdömen", subtitle: "", items: [], show_ratings: true },
          faq: { title: "Vanliga frågor", subtitle: "", items: [] },
          cta: { title: "", text: "", show_button: true },
          contact: { title: "Kontakta oss", text: "", show_form: true, show_info: true },
          pricing: { title: "Priser", subtitle: "", tiers: [{ name: "Bas", price: "0 kr", description: "Kom igång gratis", features: ["Grundläggande funktioner"], highlighted: false, cta: { label: "Välj plan", href: "#contact" } }] },
          video: { title: "Video", subtitle: "", video_url: "https://youtube.com/watch?v=dQw4w9WgXcQ", caption: "" },
          logo_cloud: { title: "Våra partners", subtitle: "", logos: [{ name: "Partner 1", image_url: "" }, { name: "Partner 2", image_url: "" }] },
          custom_content: { title: "Innehåll", subtitle: "", layout: "default", blocks: [{ type: "text", content: "Skriv ditt innehåll här..." }] },
          banner: { text: "Välkommen! Kontakta oss idag.", button: { label: "Kontakta oss", href: "#contact" }, background_color: "" },
          ranking: { title: "Topplista", subtitle: "", items: [{ rank: 1, title: "Objekt 1", description: "Beskriv det första objektet", image: null, link: null }] },
        };
        (next as Record<string, unknown>)[key] = defaults[key] || {};
      }

      // Ensure the section is in section_order so the preview renders it
      const order = next.section_order && Array.isArray(next.section_order) && next.section_order.length > 0
        ? [...next.section_order]
        : [...DEFAULT_SECTION_ORDER];
      if (!order.includes(key)) {
        order.push(key);
      }
      next.section_order = order;
    }
    handleChange(next);
  };

  // Current section order from data, falling back to default.
  // Includes both regular and duplicate keys.
  const sectionOrder = useMemo(() => {
    const order = siteData?.section_order;
    if (!order || !Array.isArray(order) || order.length === 0) return [...DEFAULT_SECTION_ORDER];
    const known = new Set(DEFAULT_SECTION_ORDER);
    // Keep all entries: regular keys that are known, plus any duplicate keys
    const result = order.filter((k: string) => known.has(k) || isDuplicateKey(k));
    for (const k of DEFAULT_SECTION_ORDER) {
      if (!result.includes(k)) result.push(k);
    }
    return result;
  }, [siteData?.section_order]);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    const current = siteDataRef.current;
    if (!current) return;
    const order = [...(current.section_order && Array.isArray(current.section_order) && current.section_order.length > 0
      ? current.section_order
      : DEFAULT_SECTION_ORDER)];
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= order.length || toIndex >= order.length) return;
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    handleChange({ ...current, section_order: order });
  }, [handleChange]);

  /** Duplicate a section: copy its data into extra_sections with a new key */
  const duplicateSection = useCallback((sourceKey: string) => {
    const current = siteDataRef.current;
    if (!current) return;

    const sectionType = getSectionType(sourceKey);
    const sourceData = getSectionData(current, sourceKey);
    if (!sourceData) return;

    const dupKey = `${sectionType}__dup_${Date.now()}`;
    const order = [...(current.section_order && Array.isArray(current.section_order) && current.section_order.length > 0
      ? current.section_order
      : DEFAULT_SECTION_ORDER)];

    // Insert duplicate right after the source
    const sourceIdx = order.indexOf(sourceKey);
    if (sourceIdx !== -1) {
      order.splice(sourceIdx + 1, 0, dupKey);
    } else {
      order.push(dupKey);
    }

    const next: SiteData = {
      ...current,
      section_order: order,
      extra_sections: {
        ...current.extra_sections,
        [dupKey]: { type: sectionType, data: deepClone(sourceData) },
      },
    };

    handleChange(next);
    setOpenSections((prev) => new Set(prev).add(dupKey));

    // Scroll to the new duplicate
    setTimeout(() => {
      const el = document.getElementById(`editor-section-${dupKey}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [handleChange]);

  /** Remove a duplicate section entirely */
  const removeDuplicate = useCallback((dupKey: string) => {
    const current = siteDataRef.current;
    if (!current || !isDuplicateKey(dupKey)) return;

    const order = [...(current.section_order || [])].filter((k) => k !== dupKey);
    const extras = { ...current.extra_sections };
    delete extras[dupKey];

    const settings = { ...current.section_settings };
    delete settings[dupKey];

    handleChange({
      ...current,
      section_order: order,
      extra_sections: extras,
      section_settings: settings,
    });
  }, [handleChange]);

  const viewerUrl = "https://preview.qvickosite.com";
  const subdomain = data?.mySite?.subdomain;

  const previewIframeUrl = `${viewerUrl}/preview/${siteId}`;

  // "Open preview" link uses the public site URL
  const publicSiteUrl = (() => {
    if (subdomain && viewerUrl) {
      try {
        const u = new URL(viewerUrl);
        const host = u.hostname.replace(/^www\./, "");
        return `${u.protocol}//${subdomain}.${host}`;
      } catch {
        return `${viewerUrl}/${siteId}`;
      }
    }
    return `${viewerUrl}/${siteId}`;
  })();

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.mySite) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-12 text-center">
        <h3 className="text-lg font-semibold text-white/90">{t("notFound")}</h3>
        <p className="mt-2 text-sm text-white/50">{t("notFoundDesc")}</p>
        <Link href={`/dashboard/sites/${siteId}/general` as "/dashboard"} className="mt-4 inline-block text-sm font-medium text-blue-400 hover:underline">
          &larr; {t("backToPages")}
        </Link>
      </div>
    );
  }

  if (!siteData) return null;

  const siteName = data.mySite.businessName || (siteData.business?.name) || "Sida";

  const editorContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#1e1e2e] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#1e1e2e] px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/sites/${siteId}/general` as "/dashboard"} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-white/90 leading-tight">{siteName}</h1>
            <p className="text-[11px] text-white/40">{t("editingLabel")}</p>
          </div>

          {/* Page selector dropdown */}
          {siteData.pages && siteData.pages.length > 0 && (
            <div className="ml-2 border-l border-white/10 pl-3">
              <select
                value={activePage || "__home__"}
                onChange={(e) => {
                  const val = e.target.value === "__home__" ? null : e.target.value;
                  changeActivePage(val);
                  pushToIframe(siteData, val);
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors cursor-pointer"
              >
                <option value="__home__" className="bg-[#1e1e2e] text-white">Startsida</option>
                {siteData.pages
                  .filter(p => !p.parent_slug)
                  .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
                  .map(p => (
                    <option key={p.slug} value={p.slug} className="bg-[#1e1e2e] text-white">
                      {p.title}
                    </option>
                  ))}
                {siteData.pages
                  .filter(p => p.parent_slug)
                  .sort((a, b) => (a.nav_order ?? 0) - (b.nav_order ?? 0))
                  .map(p => (
                    <option key={`${p.parent_slug}/${p.slug}`} value={`${p.parent_slug}/${p.slug}`} className="bg-[#1e1e2e] text-white">
                      &nbsp;&nbsp;↳ {p.title}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Draft / save status */}
          <span className={`text-xs font-medium ${
            saveStatus === "draft_saving" ? "text-amber-400" :
            saveStatus === "draft_saved" ? "text-white/40" :
            saveStatus === "publishing" ? "text-amber-400" :
            saveStatus === "published" ? "text-emerald-400" :
            saveStatus === "error" ? "text-red-400" :
            hasUnsavedChanges ? "text-amber-400" :
            "text-white/40"
          }`}>
            {saveStatus === "draft_saving" && "Sparar utkast..."}
            {saveStatus === "draft_saved" && "Utkast sparat"}
            {saveStatus === "publishing" && "Publicerar..."}
            {saveStatus === "published" && "Publicerad!"}
            {saveStatus === "error" && "Fel vid sparning"}
            {saveStatus === "idle" && hasUnsavedChanges && "Opublicerade ändringar"}
            {saveStatus === "idle" && !hasUnsavedChanges && "Inga ändringar"}
          </span>

          {/* Discard draft */}
          {hasDraft && (
            <button
              onClick={handleDiscardDraft}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
            >
              Ångra
            </button>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={!hasUnsavedChanges || saveStatus === "publishing"}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saveStatus === "publishing" ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
            Publicera
          </button>

          {/* Preview mode toggle */}
          <div className="hidden md:flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "desktop" ? "bg-white/10 shadow-sm text-white" : "text-white/40"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode("tablet")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "tablet" ? "bg-white/10 shadow-sm text-white" : "text-white/40"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "mobile" ? "bg-white/10 shadow-sm text-white" : "text-white/40"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </button>
          </div>

          {/* Site settings */}
          <Link
            href={`/dashboard/pages/${siteId}/settings`}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            title={t("settings")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>

          {/* Open preview in new tab */}
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            title={t("openPreview")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Editor + Preview split — takes all remaining height */}
      <div className="flex flex-1 min-h-0">
        {/* Editor panel */}
        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto border-r border-white/10 bg-[#1e1e2e]">
          {/* Site settings label */}
          <div className="px-4 pt-4 pb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Webbplatsinställningar</span>
          </div>

          {/* Fixed sections (business, branding) — not draggable */}
          {FIXED_SECTIONS.map((key) => {
            const section = SECTION_MAP[key];
            if (!section) return null;
            const { label, Editor, toggleable } = section;
            const isOpen = openSections.has(key);
            const isEnabled = toggleable ? (siteData as Record<string, unknown>)[key] !== null && (siteData as Record<string, unknown>)[key] !== undefined : true;
            return (
              <div key={key} id={`editor-section-${key}`} className="rounded-lg mx-2 mb-1.5 border border-white/10 bg-white/[0.06] transition-all duration-150 hover:shadow-md hover:shadow-black/20 hover:border-white/20">
                <SectionHeader
                  title={label}
                  open={isOpen}
                  onToggle={() => toggleSection(key)}
                  enabled={toggleable ? isEnabled : undefined}
                  onToggleEnabled={toggleable ? () => toggleSectionEnabled(key) : undefined}
                />
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen && isEnabled ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <Editor data={siteData} onChange={handleChange} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Separator between site settings and content sections */}
          <div className="px-4 pt-5 pb-1.5 border-t-2 border-white/10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              {activePage ? `Sektioner — ${siteData.pages?.find(p => {
                if (activePage.includes("/")) {
                  const [parent, slug] = activePage.split("/");
                  return p.parent_slug === parent && p.slug === slug;
                }
                return p.slug === activePage && !p.parent_slug;
              })?.title || activePage}` : "Sektioner"}
            </span>
          </div>

          {/* Page sections editor — when a page is selected */}
          {activePage && (() => {
            const pageObj = siteData.pages?.find(p => {
              if (activePage.includes("/")) {
                const [parent, slug] = activePage.split("/");
                return p.parent_slug === parent && p.slug === slug;
              }
              return p.slug === activePage && !p.parent_slug;
            });
            if (!pageObj) return (
              <div className="px-4 py-8 text-center text-sm text-white/40">Sidan hittades inte</div>
            );
            const pageIdx = siteData.pages!.indexOf(pageObj);
            return (
              <>
                {/* Page meta editor */}
                <div className="rounded-lg mx-2 mb-1.5 border border-white/10 bg-white/[0.06]">
                  <SectionHeader
                    title="Sidans SEO"
                    open={openSections.has("__page_meta__")}
                    onToggle={() => toggleSection("__page_meta__")}
                  />
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: openSections.has("__page_meta__") ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden px-4 pb-4">
                      <label className="mt-3 block text-xs font-medium text-white/60">Sidtitel</label>
                      <input
                        type="text"
                        value={pageObj.meta?.title || pageObj.title || ""}
                        onChange={(e) => {
                          const pages = [...(siteData.pages || [])];
                          pages[pageIdx] = {
                            ...pages[pageIdx],
                            meta: { ...pages[pageIdx].meta, title: e.target.value },
                          };
                          handleChange({ ...siteData, pages });
                        }}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50"
                        placeholder="SEO-titel"
                      />
                      <label className="mt-3 block text-xs font-medium text-white/60">Beskrivning</label>
                      <textarea
                        value={pageObj.meta?.description || ""}
                        onChange={(e) => {
                          const pages = [...(siteData.pages || [])];
                          pages[pageIdx] = {
                            ...pages[pageIdx],
                            meta: { ...pages[pageIdx].meta, description: e.target.value },
                          };
                          handleChange({ ...siteData, pages });
                        }}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-500/50"
                        placeholder="Meta-beskrivning"
                      />
                    </div>
                  </div>
                </div>

                {/* Page sections list */}
                {pageObj.sections.map((section, secIdx) => {
                  const sectionDef = SECTION_MAP[section.type];
                  if (!sectionDef) return null;
                  const { label, Editor } = sectionDef;
                  const secKey = `__page_sec_${secIdx}`;
                  const isOpen = openSections.has(secKey);

                  // Create virtual SiteData where data[type] points to this section's data
                  const virtualData = { ...siteData, [section.type]: section.data };
                  const virtualOnChange = (newData: SiteData) => {
                    const newSectionData = (newData as Record<string, unknown>)[section.type];
                    const pages = [...(siteData.pages || [])];
                    const newSections = [...pages[pageIdx].sections];
                    newSections[secIdx] = { ...newSections[secIdx], data: (newSectionData as Record<string, unknown>) || {} };
                    pages[pageIdx] = { ...pages[pageIdx], sections: newSections };
                    handleChange({ ...siteData, pages });
                  };

                  return (
                    <div key={secKey} className="rounded-lg mx-2 mb-1.5 border border-white/10 bg-white/[0.06]">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <SectionHeader title={label} open={isOpen} onToggle={() => toggleSection(secKey)} />
                        </div>
                        <button
                          onClick={() => {
                            const pages = [...(siteData.pages || [])];
                            const newSections = pages[pageIdx].sections.filter((_, i) => i !== secIdx);
                            pages[pageIdx] = { ...pages[pageIdx], sections: newSections };
                            handleChange({ ...siteData, pages });
                          }}
                          className="mr-2 rounded p-1 text-white/30 hover:text-red-400 hover:bg-white/10 transition-colors"
                          title="Ta bort sektion"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div
                        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                      >
                        <div className="overflow-hidden">
                          <Editor data={virtualData} onChange={virtualOnChange} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add section to page */}
                <div className="relative mx-2 mt-2 mb-4">
                  <select
                    onChange={(e) => {
                      const type = e.target.value;
                      if (!type) return;
                      e.target.value = "";
                      const pages = [...(siteData.pages || [])];
                      const section = SECTION_MAP[type];
                      if (!section) return;
                      const newSections = [...pages[pageIdx].sections, { type, data: {} }];
                      pages[pageIdx] = { ...pages[pageIdx], sections: newSections };
                      handleChange({ ...siteData, pages });
                    }}
                    className="w-full rounded-lg border-2 border-dashed border-white/10 bg-transparent px-4 py-3 text-sm font-medium text-white/50 transition-all hover:border-blue-500 hover:text-blue-400 cursor-pointer outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-[#1e1e2e]">+ Lägg till sektion...</option>
                    {Object.entries(SECTION_MAP)
                      .filter(([k, v]) => v.toggleable)
                      .map(([key, val]) => (
                        <option key={key} value={key} className="bg-[#1e1e2e] text-white">{val.label}</option>
                      ))}
                  </select>
                </div>
              </>
            );
          })()}

          {/* Home page: Draggable content sections — only show enabled (including duplicates) */}
          {!activePage && sectionOrder.filter((key: string) => {
            // Duplicate section: check if it exists in extra_sections
            if (isDuplicateKey(key)) {
              return !!siteData.extra_sections?.[key];
            }
            // Regular section: must be toggleable and enabled
            const section = SECTION_MAP[key];
            if (!section || !section.toggleable) return false;
            const val = (siteData as Record<string, unknown>)[key];
            return val !== null && val !== undefined;
          }).map((key: string) => {
            const isDup = isDuplicateKey(key);
            const sectionType = getSectionType(key);
            const section = SECTION_MAP[sectionType];
            if (!section) return null;
            const { label, Editor, toggleable } = section;
            const displayLabel = isDup ? `${label} (kopia)` : label;
            const isOpen = openSections.has(key);
            const isEnabled = true;
            const enabledKeys = sectionOrder.filter((k: string) => {
              if (isDuplicateKey(k)) return !!siteData.extra_sections?.[k];
              const s = SECTION_MAP[k];
              if (!s || !s.toggleable) return false;
              const val = (siteData as Record<string, unknown>)[k];
              return val !== null && val !== undefined;
            });
            const idx = enabledKeys.indexOf(key);
            return (
              <DraggableSectionItem
                key={key}
                sectionKey={key}
                label={displayLabel}
                Editor={Editor}
                toggleable={toggleable}
                isDuplicate={isDup}
                isOpen={isOpen}
                isEnabled={isEnabled}
                isFirst={idx === 0}
                isLast={idx === enabledKeys.length - 1}
                onToggle={() => toggleSection(key)}
                onToggleEnabled={toggleable && !isDup ? () => toggleSectionEnabled(key) : undefined}
                onDuplicate={() => duplicateSection(key)}
                onRemove={isDup ? () => removeDuplicate(key) : undefined}
                onMoveUp={() => {
                  const orderIdx = sectionOrder.indexOf(key);
                  if (orderIdx > 0) moveSection(orderIdx, orderIdx - 1);
                }}
                onMoveDown={() => {
                  const orderIdx = sectionOrder.indexOf(key);
                  if (orderIdx < sectionOrder.length - 1) moveSection(orderIdx, orderIdx + 1);
                }}
                onDragStart={(e) => {
                  dragSourceRef.current = key;
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", key);
                  setIsDraggingSection(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverKey(key);
                }}
                onDragEnd={() => {
                  dragSourceRef.current = null;
                  setDragOverKey(null);
                  setIsDraggingSection(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverKey(null);
                  const source = dragSourceRef.current;
                  dragSourceRef.current = null;
                  if (!source || source === key) return;
                  const current = siteDataRef.current;
                  if (!current) return;
                  const order = [...(current.section_order && Array.isArray(current.section_order) && current.section_order.length > 0
                    ? current.section_order
                    : DEFAULT_SECTION_ORDER)];
                  const fromIdx = order.indexOf(source);
                  const toIdx = order.indexOf(key);
                  if (fromIdx === -1 || toIdx === -1) return;
                  const [moved] = order.splice(fromIdx, 1);
                  order.splice(toIdx, 0, moved);
                  handleChange({ ...current, section_order: order });
                }}
                isDragOver={dragOverKey === key}
                siteData={siteData}
                handleChange={handleChange}
              />
            );
          })}

          {/* Add section dropdown (home page only) */}
          {!activePage && (() => {
            const disabledSections = DEFAULT_SECTION_ORDER.filter((key) => {
              const section = SECTION_MAP[key];
              if (!section || !section.toggleable) return false;
              const val = (siteData as Record<string, unknown>)[key];
              return val === null || val === undefined;
            });
            if (disabledSections.length === 0) return null;
            return (
              <div className="relative mx-2 mt-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAddSectionOpen((v) => !v)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/10 px-4 py-3 text-sm font-medium text-white/50 transition-all hover:border-blue-500 hover:text-blue-400 hover:bg-white/[0.03]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Lägg till sektion
                  <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${addSectionOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {addSectionOpen && (
                  <div className="mt-1.5 rounded-lg border border-white/10 bg-[#252535] shadow-lg overflow-hidden">
                    {disabledSections.map((key) => {
                      const section = SECTION_MAP[key];
                      if (!section) return null;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            toggleSectionEnabled(key);
                            setOpenSections((prev) => new Set(prev).add(key));
                            setAddSectionOpen(false);
                            setTimeout(() => {
                              const el = document.getElementById(`editor-section-${key}`);
                              el?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                        >
                          <svg className="h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          {section.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
          {/* End: Home page sections conditional */}
        </div>

        {/* Preview panel — full remaining width */}
        <div className="hidden md:flex flex-1 flex-col items-center bg-black/20 p-3 overflow-hidden min-h-0">
          <div
            className={`rounded-xl border border-white/10 bg-white shadow-lg overflow-hidden transition-all duration-300 origin-top ${
              previewMode === "mobile" ? "w-[375px]" :
              previewMode === "tablet" ? "w-[768px]" :
              "w-full"
            } ${isDraggingSection ? "scale-[0.65] h-[140%]" : `flex-1 ${previewMode === "desktop" ? "w-full" : ""}`}`}
            style={{ minHeight: 0 }}
          >
            <iframe
              ref={iframeRef}
              src={previewIframeUrl}
              className="h-full w-full border-0"
              title="Site preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              style={{ pointerEvents: isDraggingSection ? "none" : "auto", minHeight: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(editorContent, document.body);
}
