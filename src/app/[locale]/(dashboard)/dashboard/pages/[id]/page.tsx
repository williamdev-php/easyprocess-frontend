"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { SAVE_DRAFT, LOAD_DRAFT, PUBLISH_SITE_DATA, DISCARD_DRAFT } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";
import { MediaPickerField } from "@/components/media-picker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SiteData {
  meta?: { title?: string; description?: string; keywords?: string[]; language?: string };
  section_order?: string[];
  theme?: string;
  branding?: {
    logo_url?: string | null;
    colors?: { primary?: string; secondary?: string; accent?: string; background?: string; text?: string };
    fonts?: { heading?: string; body?: string };
  };
  business?: {
    name?: string; tagline?: string; email?: string | null; phone?: string | null;
    address?: string | null; org_number?: string | null; social_links?: Record<string, string>;
  };
  hero?: { headline: string; subtitle?: string; cta?: { label: string; href: string } | null; background_image?: string | null; show_cta?: boolean } | null;
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
  seo?: { structured_data?: Record<string, unknown>; robots?: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
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
    <div className="flex items-center gap-2 border-b border-border-light bg-white/50 px-4 py-3">
      {onToggleEnabled !== undefined && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleEnabled(); }}
          className={`h-5 w-5 shrink-0 rounded border transition-colors ${
            enabled ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"
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
        <h3 className="text-sm font-semibold text-primary-deep">{title}</h3>
        <svg
          className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
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
      <label className="mb-1 block text-xs font-medium text-text-muted">{label}</label>
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
      className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
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
      className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20 resize-y"
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
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-300"
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

function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border-light"
      />
      <div className="flex-1">
        <span className="text-xs text-text-muted">{label}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded border border-border-light bg-white px-2 py-1 text-xs font-mono outline-none focus:border-primary"
        />
      </div>
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
          <div key={idx} className="rounded-lg border border-border-light bg-gray-50/50 overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button type="button" onClick={() => toggle(idx)} className="flex flex-1 items-center gap-2 min-w-0 text-left">
                <svg className={`h-3 w-3 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-medium text-primary-deep truncate">{title}</span>
              </button>
              <div className="flex gap-0.5 shrink-0">
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0}
                  className="rounded p-0.5 text-text-muted hover:bg-white disabled:opacity-20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx >= items.length - 1}
                  className="rounded p-0.5 text-text-muted hover:bg-white disabled:opacity-20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <button type="button" onClick={() => remove(idx)}
                  className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="border-t border-border-light px-3 py-2.5 space-y-2">
                {fields.map((f) => (
                  <div key={f.key as string}>
                    <label className="mb-0.5 block text-xs text-text-muted">{f.label}</label>
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
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-light px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
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
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:ring-1 ${
          !isValid
            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
            : "border-border-light focus:border-primary focus:ring-primary/20"
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
  const set = (key: string, val: string) => {
    onChange({ ...data, business: { ...b, [key]: val } });
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
    </div>
  );
}

function BrandingEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const colors = data.branding?.colors || {};
  const setColor = (key: string, val: string) => {
    onChange({
      ...data,
      branding: { ...data.branding, colors: { ...colors, [key]: val } },
    });
  };
  const setBranding = (key: string, val: unknown) => {
    onChange({ ...data, branding: { ...data.branding, [key]: val } });
  };
  const setTheme = (val: string) => onChange({ ...data, theme: val });
  return (
    <div className="space-y-3 p-4">
      <MediaPickerField
        value={data.branding?.logo_url || ""}
        onChange={(url) => setBranding("logo_url", url || null)}
        label="Logotyp"
        folder="branding"
      />
      <FieldGroup label="Tema">
        <select
          value={data.theme || "modern"}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full rounded-lg border border-border-light bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="modern">Modern</option>
          <option value="bold">Bold</option>
          <option value="elegant">Elegant</option>
          <option value="minimal">Minimal</option>
        </select>
      </FieldGroup>
      <div className="grid grid-cols-2 gap-3">
        <ColorInput value={colors.primary || "#2563eb"} onChange={(v) => setColor("primary", v)} label="Primär" />
        <ColorInput value={colors.secondary || "#1e40af"} onChange={(v) => setColor("secondary", v)} label="Sekundär" />
        <ColorInput value={colors.accent || "#f59e0b"} onChange={(v) => setColor("accent", v)} label="Accent" />
        <ColorInput value={colors.background || "#ffffff"} onChange={(v) => setColor("background", v)} label="Bakgrund" />
        <ColorInput value={colors.text || "#111827"} onChange={(v) => setColor("text", v)} label="Text" />
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
      <div className="rounded-lg border border-border-light bg-gray-50/80 p-3 space-y-2">
        <ToggleSwitch label="Visa CTA-knapp" checked={showCta} onChange={(v) => set("show_cta", v)} />
        {showCta && (
          <>
            <FieldGroup label="CTA-knapp text"><TextInput value={hero.cta?.label || ""} onChange={(v) => set("cta", { ...hero.cta, label: v, href: hero.cta?.href || "#contact" })} /></FieldGroup>
            <FieldGroup label="CTA-knapp länk"><TextInput value={hero.cta?.href || ""} onChange={(v) => set("cta", { ...hero.cta, label: hero.cta?.label || "", href: v })} /></FieldGroup>
          </>
        )}
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
      <div className="rounded-lg border border-border-light bg-gray-50/80 p-3 space-y-2">
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
        <label className="mb-0.5 block text-xs font-medium text-text-muted">Frågor & Svar</label>
        {items.map((item, idx) => {
          const isOpen = openItems.has(idx);
          return (
            <div key={idx} className="rounded-lg border border-border-light bg-gray-50/50 overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setOpenItems((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; })}
                  className="flex flex-1 items-center gap-2 min-w-0 text-left"
                >
                  <svg className={`h-3 w-3 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-medium text-primary-deep truncate">
                    {item.question || `Fråga #${idx + 1}`}
                  </span>
                </button>
                <div className="flex gap-0.5 shrink-0">
                  <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                    className="rounded p-0.5 text-text-muted hover:bg-white disabled:opacity-20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button type="button" onClick={() => moveItem(idx, 1)} disabled={idx >= items.length - 1}
                    className="rounded p-0.5 text-text-muted hover:bg-white disabled:opacity-20">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <button type="button" onClick={() => removeItem(idx)}
                    className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border-light px-3 py-2.5 space-y-2">
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
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-light px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
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
            <div key={idx} className="rounded-lg border border-border-light bg-gray-50/50 p-3 space-y-2">
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
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-light px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
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
      <div className="rounded-lg border border-border-light bg-gray-50/80 p-3 space-y-2">
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
      <div className="rounded-lg border border-border-light bg-gray-50/80 p-3 space-y-1">
        <ToggleSwitch label="Visa kontaktformulär" checked={contact.show_form !== false} onChange={(v) => set("show_form", v)} />
        <ToggleSwitch label="Visa kontaktuppgifter" checked={contact.show_info !== false} onChange={(v) => set("show_info", v)} />
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
            <div key={idx} className="rounded-lg border border-border-light bg-gray-50/50 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-primary-deep">{member.name || `Medlem #${idx + 1}`}</span>
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
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-light px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-primary"
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

// ---------------------------------------------------------------------------
// Section config
// ---------------------------------------------------------------------------

const DEFAULT_SECTION_ORDER = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
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
  isFirst,
  isLast,
  onToggle,
  onToggleEnabled,
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
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onToggleEnabled?: () => void;
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
  return (
    <div
      id={`editor-section-${sectionKey}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      className={`border-b border-border-light bg-white transition-colors ${isDragOver ? "border-t-2 border-t-primary" : ""}`}
    >
      <div className="flex items-center gap-0">
        {/* Drag handle + reorder buttons */}
        <div className="flex flex-col items-center shrink-0 w-8 self-stretch justify-center gap-0.5 cursor-grab active:cursor-grabbing text-text-muted/50 hover:text-primary-deep hover:bg-primary/5 transition-colors">
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
            className="p-0.5 text-text-muted hover:text-primary-deep disabled:opacity-20 disabled:cursor-default transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={isLast}
            className="p-0.5 text-text-muted hover:text-primary-deep disabled:opacity-20 disabled:cursor-default transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <SectionHeader
            title={label}
            open={isOpen}
            onToggle={onToggle}
            enabled={toggleable ? isEnabled : undefined}
            onToggleEnabled={onToggleEnabled}
          />
        </div>
      </div>
      {isOpen && isEnabled && (
        <Editor data={siteData} onChange={handleChange} />
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

  const { data, loading, error } = useQuery<any>(MY_SITE, { variables: { id: siteId } });
  const [saveDraftMutation] = useMutation(SAVE_DRAFT);
  const [loadDraftMutation] = useMutation<{ loadDraft: { siteId: string; draftData: any; updatedAt: string } }>(LOAD_DRAFT);
  const [publishSiteDataMutation] = useMutation(PUBLISH_SITE_DATA);
  const [discardDraftMutation] = useMutation(DISCARD_DRAFT);

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["business", "hero"]));
  const [saveStatus, setSaveStatus] = useState<"idle" | "draft_saving" | "draft_saved" | "publishing" | "published" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isDraggingSection, setIsDraggingSection] = useState(false);

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

  // Send current data to iframe
  const pushToIframe = useCallback((d: SiteData) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "SITE_DATA_UPDATE", siteData: d },
        "*"
      );
    }
  }, []);

  // Listen for messages from the viewer iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg?.type) return;

      if (msg.type === "PREVIEW_READY") {
        const current = siteDataRef.current;
        if (current) pushToIframe(current);
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
  }, [pushToIframe]);

  // Handle changes: update preview + auto-save draft
  const handleChange = useCallback(
    (newData: SiteData) => {
      setSiteData(newData);
      setHasUnsavedChanges(true);
      setHasDraft(true);

      // Immediate preview update
      pushToIframe(newData);

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
          features: { title: "Varför välja oss", subtitle: "", items: [] },
          stats: { title: "", items: [] },
          services: { title: "Våra tjänster", subtitle: "", items: [] },
          process: { title: "Så fungerar det", subtitle: "", steps: [] },
          gallery: { title: "Galleri", subtitle: "", images: [] },
          team: { title: "Vårt team", subtitle: "", members: [] },
          testimonials: { title: "Omdömen", subtitle: "", items: [], show_ratings: true },
          faq: { title: "Vanliga frågor", subtitle: "", items: [] },
          cta: { title: "", text: "", show_button: true },
          contact: { title: "Kontakta oss", text: "", show_form: true, show_info: true },
        };
        (next as Record<string, unknown>)[key] = defaults[key] || {};
      }
    }
    handleChange(next);
  };

  // Current section order from data, falling back to default
  const sectionOrder = useMemo(() => {
    const order = siteData?.section_order;
    if (!order || !Array.isArray(order) || order.length === 0) return DEFAULT_SECTION_ORDER;
    const known = new Set(DEFAULT_SECTION_ORDER);
    const result = order.filter((k: string) => known.has(k));
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

  const viewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL ?? "";
  const subdomain = data?.mySite?.subdomain;
  const isDev = process.env.NODE_ENV === "development";

  // Editor iframe always uses /preview/{siteId} — no caching, no layout
  const previewIframeUrl = `${viewerUrl}/preview/${siteId}`;

  // "Open preview" link uses the public site URL
  const publicSiteUrl = (() => {
    if (subdomain && viewerUrl && !isDev) {
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !data?.mySite) {
    return (
      <div className="rounded-2xl border border-border-light bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-primary-deep">{t("notFound")}</h3>
        <p className="mt-2 text-sm text-text-muted">{t("notFoundDesc")}</p>
        <Link href="/dashboard/pages" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          &larr; {t("backToPages")}
        </Link>
      </div>
    );
  }

  if (!siteData) return null;

  const siteName = data.mySite.businessName || (siteData.business?.name) || "Sida";

  const editorContent = (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border-light bg-white px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pages" className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-bold text-primary-deep leading-tight">{siteName}</h1>
            <p className="text-[11px] text-text-muted">{t("editingLabel")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Draft / save status */}
          <span className={`text-xs font-medium ${
            saveStatus === "draft_saving" ? "text-yellow-600" :
            saveStatus === "draft_saved" ? "text-text-muted" :
            saveStatus === "publishing" ? "text-yellow-600" :
            saveStatus === "published" ? "text-green-600" :
            saveStatus === "error" ? "text-red-600" :
            hasUnsavedChanges ? "text-yellow-600" :
            "text-text-muted"
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
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-red-300 hover:text-red-600 hover:bg-red-50"
            >
              Ångra
            </button>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={!hasUnsavedChanges || saveStatus === "publishing"}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="hidden md:flex items-center gap-0.5 rounded-lg border border-border-light bg-gray-50 p-0.5">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "desktop" ? "bg-white shadow-sm text-primary-deep" : "text-text-muted"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode("tablet")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "tablet" ? "bg-white shadow-sm text-primary-deep" : "text-text-muted"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`rounded-md p-1.5 transition-colors ${
                previewMode === "mobile" ? "bg-white shadow-sm text-primary-deep" : "text-text-muted"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </button>
          </div>

          {/* Open preview in new tab */}
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-deep"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            {t("openPreview")}
          </a>
        </div>
      </div>

      {/* Editor + Preview split — takes all remaining height */}
      <div className="flex flex-1 min-h-0">
        {/* Editor panel */}
        <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 overflow-y-auto border-r border-border-light bg-gray-50/50">
          {/* Fixed sections (business, branding) — not draggable */}
          {FIXED_SECTIONS.map((key) => {
            const section = SECTION_MAP[key];
            if (!section) return null;
            const { label, Editor, toggleable } = section;
            const isOpen = openSections.has(key);
            const isEnabled = toggleable ? (siteData as Record<string, unknown>)[key] !== null && (siteData as Record<string, unknown>)[key] !== undefined : true;
            return (
              <div key={key} id={`editor-section-${key}`} className="border-b border-border-light">
                <SectionHeader
                  title={label}
                  open={isOpen}
                  onToggle={() => toggleSection(key)}
                  enabled={toggleable ? isEnabled : undefined}
                  onToggleEnabled={toggleable ? () => toggleSectionEnabled(key) : undefined}
                />
                {isOpen && isEnabled && (
                  <Editor data={siteData} onChange={handleChange} />
                )}
              </div>
            );
          })}

          {/* Draggable content sections */}
          {sectionOrder.map((key: string, idx: number) => {
            const section = SECTION_MAP[key];
            if (!section) return null;
            const { label, Editor, toggleable } = section;
            const isOpen = openSections.has(key);
            const isEnabled = toggleable ? (siteData as Record<string, unknown>)[key] !== null && (siteData as Record<string, unknown>)[key] !== undefined : true;
            return (
              <DraggableSectionItem
                key={key}
                sectionKey={key}
                label={label}
                Editor={Editor}
                toggleable={toggleable}
                isOpen={isOpen}
                isEnabled={isEnabled}
                isFirst={idx === 0}
                isLast={idx === sectionOrder.length - 1}
                onToggle={() => toggleSection(key)}
                onToggleEnabled={toggleable ? () => toggleSectionEnabled(key) : undefined}
                onMoveUp={() => moveSection(idx, idx - 1)}
                onMoveDown={() => moveSection(idx, idx + 1)}
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
        </div>

        {/* Preview panel — full remaining width */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-100/80 p-3 overflow-hidden">
          <div
            className={`rounded-xl border border-border-light bg-white shadow-lg overflow-hidden transition-all duration-300 origin-center ${
              previewMode === "mobile" ? "w-[375px]" :
              previewMode === "tablet" ? "w-[768px]" :
              "w-full"
            } ${isDraggingSection ? "scale-[0.65] h-[140%]" : "h-full"}`}
          >
            <iframe
              ref={iframeRef}
              src={previewIframeUrl}
              className="h-full w-full"
              title="Site preview"
              style={{ pointerEvents: isDraggingSection ? "none" : "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(editorContent, document.body);
}
