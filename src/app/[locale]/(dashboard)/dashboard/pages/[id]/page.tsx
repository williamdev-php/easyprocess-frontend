"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { UPDATE_SITE_DATA } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SiteData {
  meta?: { title?: string; description?: string; keywords?: string[]; language?: string };
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
  hero?: { headline: string; subtitle?: string; cta?: { label: string; href: string } | null; background_image?: string | null } | null;
  about?: { title?: string; text?: string; image?: string | null; highlights?: { label: string; value: string }[] | null } | null;
  features?: { title?: string; subtitle?: string; items?: { title: string; description: string; icon?: string }[] } | null;
  stats?: { title?: string; items?: { value: string; label: string }[] } | null;
  services?: { title?: string; subtitle?: string; items?: { title: string; description: string }[] } | null;
  process?: { title?: string; subtitle?: string; steps?: { title: string; description: string; step_number?: number }[] } | null;
  gallery?: { title?: string; subtitle?: string; images?: { url: string; alt?: string; caption?: string }[] } | null;
  team?: { title?: string; subtitle?: string; members?: { name: string; role?: string; image?: string | null; bio?: string }[] } | null;
  testimonials?: { title?: string; subtitle?: string; items?: { text: string; author: string; role?: string }[] } | null;
  faq?: { title?: string; subtitle?: string; items?: { question: string; answer: string }[] } | null;
  cta?: { title?: string; text?: string; button?: { label: string; href: string } | null } | null;
  contact?: { title?: string; text?: string } | null;
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

function ListEditor<T extends Record<string, unknown>>({
  items,
  onChange,
  fields,
  addLabel,
  createDefault,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: keyof T; label: string; type: "text" | "textarea" }[];
  addLabel: string;
  createDefault: () => T;
}) {
  const add = () => onChange([...items, createDefault()]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, key: keyof T, val: unknown) => {
    const next = deepClone(items);
    (next[idx] as Record<string, unknown>)[key as string] = val;
    onChange(next);
  };
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = deepClone(items);
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const moveDown = (idx: number) => {
    if (idx >= items.length - 1) return;
    const next = deepClone(items);
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-lg border border-border-light bg-gray-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-muted">#{idx + 1}</span>
            <div className="flex gap-1">
              <button type="button" onClick={() => moveUp(idx)} disabled={idx === 0}
                className="rounded p-1 text-text-muted hover:bg-white disabled:opacity-30">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button type="button" onClick={() => moveDown(idx)} disabled={idx >= items.length - 1}
                className="rounded p-1 text-text-muted hover:bg-white disabled:opacity-30">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button type="button" onClick={() => remove(idx)}
                className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          {fields.map((f) => (
            <div key={f.key as string}>
              <label className="mb-0.5 block text-xs text-text-muted">{f.label}</label>
              {f.type === "textarea" ? (
                <TextArea
                  value={(item[f.key] as string) || ""}
                  onChange={(v) => update(idx, f.key, v)}
                  rows={2}
                />
              ) : (
                <TextInput
                  value={(item[f.key] as string) || ""}
                  onChange={(v) => update(idx, f.key, v)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
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
      <FieldGroup label="E-post"><TextInput value={b.email || ""} onChange={(v) => set("email", v)} /></FieldGroup>
      <FieldGroup label="Telefon"><TextInput value={b.phone || ""} onChange={(v) => set("phone", v)} /></FieldGroup>
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
  const setTheme = (val: string) => onChange({ ...data, theme: val });
  return (
    <div className="space-y-3 p-4">
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
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={hero.headline || ""} onChange={(v) => set("headline", v)} /></FieldGroup>
      <FieldGroup label="Underrubrik"><TextArea value={hero.subtitle || ""} onChange={(v) => set("subtitle", v)} rows={2} /></FieldGroup>
      <FieldGroup label="CTA-knapp text"><TextInput value={hero.cta?.label || ""} onChange={(v) => set("cta", { ...hero.cta, label: v, href: hero.cta?.href || "#kontakt" })} /></FieldGroup>
      <FieldGroup label="CTA-knapp länk"><TextInput value={hero.cta?.href || ""} onChange={(v) => set("cta", { ...hero.cta, label: hero.cta?.label || "", href: v })} /></FieldGroup>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const about = data.about || { title: "Om oss", text: "" };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, about: { ...about, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={about.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Text"><TextArea value={about.text || ""} onChange={(v) => set("text", v)} rows={5} /></FieldGroup>
      <FieldGroup label="Höjdpunkter">
        <ListEditor
          items={about.highlights || []}
          onChange={(items) => set("highlights", items)}
          fields={[
            { key: "label", label: "Etikett", type: "text" },
            { key: "value", label: "Värde", type: "text" },
          ]}
          addLabel="Lägg till höjdpunkt"
          createDefault={() => ({ label: "", value: "" })}
        />
      </FieldGroup>
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
        <ListEditor
          items={services.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "title", label: "Namn", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till tjänst"
          createDefault={() => ({ title: "", description: "" })}
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
        <ListEditor
          items={features.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "icon", label: "Ikon (emoji)", type: "text" },
            { key: "title", label: "Titel", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till egenskap"
          createDefault={() => ({ title: "", description: "", icon: "" })}
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
      <FieldGroup label="Omdömen">
        <ListEditor
          items={testimonials.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "author", label: "Namn", type: "text" },
            { key: "role", label: "Roll/Titel", type: "text" },
            { key: "text", label: "Omdöme", type: "textarea" },
          ]}
          addLabel="Lägg till omdöme"
          createDefault={() => ({ text: "", author: "", role: "" })}
        />
      </FieldGroup>
    </div>
  );
}

function FAQEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const faq = data.faq || { title: "Vanliga frågor", subtitle: "", items: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, faq: { ...faq, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={faq.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Frågor & Svar">
        <ListEditor
          items={faq.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "question", label: "Fråga", type: "text" },
            { key: "answer", label: "Svar", type: "textarea" },
          ]}
          addLabel="Lägg till fråga"
          createDefault={() => ({ question: "", answer: "" })}
        />
      </FieldGroup>
    </div>
  );
}

function GalleryEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const gallery = data.gallery || { title: "Galleri", subtitle: "", images: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, gallery: { ...gallery, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={gallery.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Bilder">
        <ListEditor
          items={gallery.images || []}
          onChange={(items) => set("images", items)}
          fields={[
            { key: "url", label: "Bild-URL", type: "text" },
            { key: "alt", label: "Alt-text", type: "text" },
            { key: "caption", label: "Bildtext", type: "text" },
          ]}
          addLabel="Lägg till bild"
          createDefault={() => ({ url: "", alt: "", caption: "" })}
        />
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
        <ListEditor
          items={process.steps || []}
          onChange={(items) => set("steps", items.map((s, i) => ({ ...s, step_number: i + 1 })))}
          fields={[
            { key: "title", label: "Rubrik", type: "text" },
            { key: "description", label: "Beskrivning", type: "textarea" },
          ]}
          addLabel="Lägg till steg"
          createDefault={() => ({ title: "", description: "", step_number: 0 })}
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
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={cta.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Text"><TextArea value={cta.text || ""} onChange={(v) => set("text", v)} rows={2} /></FieldGroup>
      <FieldGroup label="Knapptext"><TextInput value={cta.button?.label || ""} onChange={(v) => set("button", { ...cta.button, label: v, href: cta.button?.href || "#kontakt" })} /></FieldGroup>
      <FieldGroup label="Knapplänk"><TextInput value={cta.button?.href || ""} onChange={(v) => set("button", { ...cta.button, label: cta.button?.label || "", href: v })} /></FieldGroup>
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
        <ListEditor
          items={stats.items || []}
          onChange={(items) => set("items", items)}
          fields={[
            { key: "value", label: "Värde (t.ex. 500+)", type: "text" },
            { key: "label", label: "Etikett", type: "text" },
          ]}
          addLabel="Lägg till statistik"
          createDefault={() => ({ value: "", label: "" })}
        />
      </FieldGroup>
    </div>
  );
}

function TeamEditor({ data, onChange }: { data: SiteData; onChange: (d: SiteData) => void }) {
  const team = data.team || { title: "Vårt team", subtitle: "", members: [] };
  const set = (key: string, val: unknown) => {
    onChange({ ...data, team: { ...team, [key]: val } });
  };
  return (
    <div className="space-y-3 p-4">
      <FieldGroup label="Rubrik"><TextInput value={team.title || ""} onChange={(v) => set("title", v)} /></FieldGroup>
      <FieldGroup label="Medlemmar">
        <ListEditor
          items={team.members || []}
          onChange={(items) => set("members", items)}
          fields={[
            { key: "name", label: "Namn", type: "text" },
            { key: "role", label: "Roll", type: "text" },
            { key: "bio", label: "Bio", type: "textarea" },
          ]}
          addLabel="Lägg till medlem"
          createDefault={() => ({ name: "", role: "", bio: "", image: null })}
        />
      </FieldGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section config
// ---------------------------------------------------------------------------

const SECTIONS = [
  { key: "business", label: "Företagsinformation", Editor: BusinessEditor, toggleable: false },
  { key: "branding", label: "Varumärke & Färger", Editor: BrandingEditor, toggleable: false },
  { key: "hero", label: "Hero-sektion", Editor: HeroEditor, toggleable: true },
  { key: "about", label: "Om oss", Editor: AboutEditor, toggleable: true },
  { key: "features", label: "Egenskaper", Editor: FeaturesEditor, toggleable: true },
  { key: "stats", label: "Statistik", Editor: StatsEditor, toggleable: true },
  { key: "services", label: "Tjänster", Editor: ServicesEditor, toggleable: true },
  { key: "process", label: "Process / Steg", Editor: ProcessEditor, toggleable: true },
  { key: "gallery", label: "Galleri", Editor: GalleryEditor, toggleable: true },
  { key: "team", label: "Team", Editor: TeamEditor, toggleable: true },
  { key: "testimonials", label: "Omdömen", Editor: TestimonialsEditor, toggleable: true },
  { key: "faq", label: "Vanliga frågor", Editor: FAQEditor, toggleable: true },
  { key: "cta", label: "Call-to-action", Editor: CTAEditor, toggleable: true },
  { key: "contact", label: "Kontakt", Editor: ContactEditor, toggleable: true },
] as const;

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SiteEditorPage() {
  const params = useParams();
  const siteId = params.id as string;
  const t = useTranslations("siteEditor");

  const { data, loading, error } = useQuery<any>(MY_SITE, { variables: { id: siteId } });
  const [updateSiteData, { loading: saving }] = useMutation(UPDATE_SITE_DATA);

  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["business", "hero"]));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disabledSectionsCache = useRef<Record<string, unknown>>({});

  // Init site data from query
  useEffect(() => {
    if (data?.mySite?.siteData && !siteData) {
      setSiteData(deepClone(data.mySite.siteData));
    }
  }, [data, siteData]);

  // Listen for section-click messages from the viewer iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "SECTION_CLICKED" && event.data.section) {
        const section = event.data.section as string;
        setOpenSections((prev) => {
          const next = new Set(prev);
          next.add(section);
          return next;
        });
        // Scroll the section header into view in the editor panel
        setTimeout(() => {
          const el = document.getElementById(`editor-section-${section}`);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Auto-save with debounce + send to iframe for live preview
  const handleChange = useCallback(
    (newData: SiteData) => {
      setSiteData(newData);

      // Send to iframe for live preview
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: "SITE_DATA_UPDATE", siteData: newData },
          "*"
        );
      }

      // Debounced save
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveStatus("idle");
      saveTimer.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await updateSiteData({
            variables: { input: { siteId, siteData: newData } },
          });
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 1500);
    },
    [siteId, updateSiteData]
  );

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
          hero: { headline: "", subtitle: "" },
          about: { title: "Om oss", text: "" },
          features: { title: "Varför välja oss", subtitle: "", items: [] },
          stats: { title: "", items: [] },
          services: { title: "Våra tjänster", subtitle: "", items: [] },
          process: { title: "Så fungerar det", subtitle: "", steps: [] },
          gallery: { title: "Galleri", subtitle: "", images: [] },
          team: { title: "Vårt team", subtitle: "", members: [] },
          testimonials: { title: "Omdömen", subtitle: "", items: [] },
          faq: { title: "Vanliga frågor", subtitle: "", items: [] },
          cta: { title: "", text: "" },
          contact: { title: "Kontakta oss", text: "" },
        };
        (next as Record<string, unknown>)[key] = defaults[key] || {};
      }
    }
    handleChange(next);
  };

  const viewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL || "http://localhost:3001";

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
          {/* Save status */}
          <span className={`text-xs font-medium ${
            saveStatus === "saving" ? "text-yellow-600" :
            saveStatus === "saved" ? "text-green-600" :
            saveStatus === "error" ? "text-red-600" :
            "text-text-muted"
          }`}>
            {saveStatus === "saving" && t("saving")}
            {saveStatus === "saved" && t("saved")}
            {saveStatus === "error" && t("saveError")}
            {saveStatus === "idle" && t("autoSave")}
          </span>

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
            href={`${viewerUrl}/${siteId}`}
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
          {SECTIONS.map(({ key, label, Editor, toggleable }) => {
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
        </div>

        {/* Preview panel — full remaining width */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-100/80 p-3 overflow-hidden">
          <div
            className={`h-full rounded-xl border border-border-light bg-white shadow-lg overflow-hidden transition-all duration-300 ${
              previewMode === "mobile" ? "w-[375px]" :
              previewMode === "tablet" ? "w-[768px]" :
              "w-full"
            }`}
          >
            <iframe
              ref={iframeRef}
              src={`${viewerUrl}/${siteId}`}
              className="h-full w-full"
              title="Site preview"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(editorContent, document.body);
}
