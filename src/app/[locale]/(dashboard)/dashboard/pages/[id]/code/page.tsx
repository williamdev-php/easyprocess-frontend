"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { PUBLISH_SITE_DATA, SAVE_DRAFT, LOAD_DRAFT } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";

// ---------------------------------------------------------------------------
// Section schema validation (mirrors backend Pydantic SiteSchema)
// ---------------------------------------------------------------------------

const VALID_SECTION_KEYS = [
  "hero", "about", "features", "stats", "services", "process",
  "gallery", "team", "testimonials", "faq", "cta", "contact",
  "pricing", "video", "logo_cloud", "custom_content", "banner",
];

type FieldRule = {
  field: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
};

type SectionRule = {
  nullable: boolean;
  fields?: FieldRule[];
  /** Name of the list field + required fields per item */
  items?: { list: string; fields: FieldRule[] };
};

const SECTION_RULES: Record<string, SectionRule> = {
  meta: {
    nullable: false,
    fields: [
      { field: "title", type: "string" },
      { field: "description", type: "string" },
      { field: "keywords", type: "array" },
      { field: "language", type: "string" },
    ],
  },
  branding: {
    nullable: false,
    fields: [
      { field: "colors", type: "object" },
      { field: "fonts", type: "object" },
    ],
  },
  business: {
    nullable: false,
    fields: [
      { field: "name", type: "string" },
      { field: "tagline", type: "string" },
    ],
  },
  seo: {
    nullable: false,
    fields: [
      { field: "structured_data", type: "object" },
      { field: "robots", type: "string" },
    ],
  },
  hero: {
    nullable: true,
    fields: [{ field: "headline", type: "string", required: true }],
  },
  about: {
    nullable: true,
    fields: [{ field: "title", type: "string" }, { field: "text", type: "string" }],
  },
  features: {
    nullable: true,
    items: { list: "items", fields: [{ field: "title", type: "string", required: true }, { field: "description", type: "string", required: true }] },
  },
  stats: {
    nullable: true,
    items: { list: "items", fields: [{ field: "value", type: "string", required: true }, { field: "label", type: "string", required: true }] },
  },
  services: {
    nullable: true,
    items: { list: "items", fields: [{ field: "title", type: "string", required: true }, { field: "description", type: "string", required: true }] },
  },
  process: {
    nullable: true,
    items: { list: "steps", fields: [{ field: "title", type: "string", required: true }, { field: "description", type: "string", required: true }] },
  },
  gallery: {
    nullable: true,
    items: { list: "images", fields: [{ field: "url", type: "string", required: true }] },
  },
  team: {
    nullable: true,
    items: { list: "members", fields: [{ field: "name", type: "string", required: true }] },
  },
  testimonials: {
    nullable: true,
    items: { list: "items", fields: [{ field: "text", type: "string", required: true }, { field: "author", type: "string", required: true }] },
  },
  faq: {
    nullable: true,
    items: { list: "items", fields: [{ field: "question", type: "string", required: true }, { field: "answer", type: "string", required: true }] },
  },
  cta: {
    nullable: true,
    fields: [{ field: "title", type: "string", required: true }],
  },
  contact: {
    nullable: true,
    fields: [{ field: "title", type: "string" }],
  },
  pricing: {
    nullable: true,
    items: { list: "tiers", fields: [{ field: "name", type: "string", required: true }, { field: "price", type: "string", required: true }] },
  },
  video: {
    nullable: true,
    fields: [{ field: "video_url", type: "string" }],
  },
  logo_cloud: {
    nullable: true,
    items: { list: "logos", fields: [{ field: "name", type: "string", required: true }] },
  },
  custom_content: {
    nullable: true,
    items: { list: "blocks", fields: [{ field: "type", type: "string", required: true }] },
  },
  banner: {
    nullable: true,
    fields: [{ field: "text", type: "string", required: true }],
  },
};

function checkType(value: unknown, expected: FieldRule["type"]): boolean {
  if (value === null || value === undefined) return true; // optional fields
  switch (expected) {
    case "string": return typeof value === "string";
    case "number": return typeof value === "number";
    case "boolean": return typeof value === "boolean";
    case "array": return Array.isArray(value);
    case "object": return typeof value === "object" && !Array.isArray(value);
  }
}

/** Validate a single section value against its schema rules. Returns error string or null. */
function validateSection(key: string, value: unknown): string | null {
  // section_order is a special case
  if (key === "section_order") {
    if (!Array.isArray(value)) return "section_order must be an array";
    for (const item of value) {
      if (typeof item !== "string" || !VALID_SECTION_KEYS.includes(item)) {
        return `Invalid section in section_order: "${item}". Valid: ${VALID_SECTION_KEYS.join(", ")}`;
      }
    }
    return null;
  }

  const rule = SECTION_RULES[key];
  if (!rule) return null; // unknown key — no validation

  // null check
  if (value === null || value === undefined) {
    return rule.nullable ? null : `"${key}" cannot be null`;
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    return "Section must be an object or null";
  }

  const obj = value as Record<string, unknown>;

  // Check top-level fields
  if (rule.fields) {
    for (const f of rule.fields) {
      if (f.required && (obj[f.field] === undefined || obj[f.field] === null || obj[f.field] === "")) {
        return `Required: "${f.field}"`;
      }
      if (obj[f.field] !== undefined && obj[f.field] !== null && !checkType(obj[f.field], f.type)) {
        return `"${f.field}" must be ${f.type}`;
      }
    }
  }

  // Check list items
  if (rule.items) {
    const list = obj[rule.items.list];
    if (list !== undefined && list !== null) {
      if (!Array.isArray(list)) {
        return `"${rule.items.list}" must be an array`;
      }
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return `${rule.items.list}[${i}] must be an object`;
        }
        for (const f of rule.items.fields) {
          const val = (item as Record<string, unknown>)[f.field];
          if (f.required && (val === undefined || val === null || val === "")) {
            return `"${f.field}" required in ${rule.items.list}[${i}]`;
          }
          if (val !== undefined && val !== null && !checkType(val, f.type)) {
            return `${rule.items.list}[${i}].${f.field} must be ${f.type}`;
          }
        }
      }
    }
  }

  return null;
}

// Section keys that map to top-level site_data keys
const SECTION_FILES = [
  { key: "meta", label: "meta.json", icon: "M" },
  { key: "branding", label: "branding.json", icon: "B" },
  { key: "business", label: "business.json", icon: "B" },
  { key: "hero", label: "hero.json", icon: "H" },
  { key: "about", label: "about.json", icon: "A" },
  { key: "features", label: "features.json", icon: "F" },
  { key: "stats", label: "stats.json", icon: "S" },
  { key: "services", label: "services.json", icon: "S" },
  { key: "process", label: "process.json", icon: "P" },
  { key: "gallery", label: "gallery.json", icon: "G" },
  { key: "team", label: "team.json", icon: "T" },
  { key: "testimonials", label: "testimonials.json", icon: "T" },
  { key: "faq", label: "faq.json", icon: "F" },
  { key: "cta", label: "cta.json", icon: "C" },
  { key: "contact", label: "contact.json", icon: "C" },
  { key: "pricing", label: "pricing.json", icon: "P" },
  { key: "video", label: "video.json", icon: "V" },
  { key: "logo_cloud", label: "logo_cloud.json", icon: "L" },
  { key: "custom_content", label: "custom_content.json", icon: "X" },
  { key: "banner", label: "banner.json", icon: "B" },
  { key: "section_settings", label: "section_settings.json", icon: "⚙" },
  { key: "seo", label: "seo.json", icon: "S" },
  { key: "section_order", label: "section_order.json", icon: "O" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`} />
  );
}

export default function CodeEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations("codeEditor");
  const siteId = params.id;

  const { data, loading } = useQuery<{ mySite: { siteData: Record<string, unknown>; businessName?: string } | null }>(MY_SITE, { variables: { id: siteId } });
  const [publishSiteData] = useMutation(PUBLISH_SITE_DATA);
  const [saveDraftMut] = useMutation(SAVE_DRAFT);
  const [loadDraftMut] = useMutation<{ loadDraft: { siteId: string; draftData: Record<string, unknown>; updatedAt: string } | null }>(LOAD_DRAFT);

  const [siteData, setSiteData] = useState<Record<string, unknown>>({});
  const [activeFile, setActiveFile] = useState("meta");
  const [editorContent, setEditorContent] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Load site data
  useEffect(() => {
    if (data?.mySite?.siteData) {
      const sd = data.mySite.siteData;
      setSiteData(sd);
      // Also try to load draft
      loadDraftMut({ variables: { siteId } })
        .then((res) => {
          if (res.data?.loadDraft?.draftData) {
            setSiteData(res.data.loadDraft.draftData);
            setHasDraft(true);
          }
        })
        .catch(() => {});
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update editor content when file changes
  useEffect(() => {
    const section = siteData[activeFile];
    try {
      const content = JSON.stringify(section ?? null, null, 2);
      setEditorContent(content);
      setParseError(null);
      setSchemaError(validateSection(activeFile, section ?? null));
    } catch {
      setEditorContent("");
      setSchemaError(null);
    }
  }, [activeFile, siteData]);

  // Parse and validate on content change
  const handleContentChange = useCallback((value: string) => {
    setEditorContent(value);
    setSaved(false);
    try {
      const parsed = JSON.parse(value);
      setParseError(null);
      // Schema validation
      const sError = validateSection(activeFile, parsed);
      setSchemaError(sError);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
      setSchemaError(null);
    }
  }, [activeFile]);

  // Save current file back to siteData
  const saveCurrentFile = useCallback(() => {
    if (parseError) return false;
    try {
      const parsed = JSON.parse(editorContent);
      setSiteData((prev) => ({ ...prev, [activeFile]: parsed }));
      return true;
    } catch {
      return false;
    }
  }, [editorContent, parseError, activeFile]);

  // Auto-save draft
  const handleSaveDraft = useCallback(async () => {
    if (!saveCurrentFile()) return;
    setSaving(true);
    try {
      const merged = { ...siteData, [activeFile]: JSON.parse(editorContent) };
      await saveDraftMut({
        variables: { input: { siteId, draftData: merged } },
      });
      setHasDraft(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [siteId, siteData, activeFile, editorContent, saveCurrentFile, saveDraftMut]);

  // Publish all changes — also validates ALL sections before sending
  const handlePublish = useCallback(async () => {
    if (!saveCurrentFile()) return;
    setSaving(true);
    try {
      const merged = { ...siteData, [activeFile]: JSON.parse(editorContent) };

      // Validate every section client-side before publishing
      for (const sectionFile of SECTION_FILES) {
        const sErr = validateSection(sectionFile.key, merged[sectionFile.key] ?? null);
        if (sErr) {
          setMessage({ type: "error", text: `${sectionFile.label}: ${sErr}` });
          setTimeout(() => setMessage(null), 5000);
          setSaving(false);
          return;
        }
      }

      await publishSiteData({
        variables: { input: { siteId, siteData: merged } },
      });
      setHasDraft(false);
      setMessage({ type: "success", text: t("publishSuccess") });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Validation error" });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  }, [siteId, siteData, activeFile, editorContent, saveCurrentFile, publishSiteData, t]);

  // Keyboard shortcut: Ctrl+S to save draft
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft]);

  const siteName = (data?.mySite?.siteData as Record<string, unknown> | undefined)?.business
    ? ((data?.mySite?.siteData as Record<string, Record<string, unknown>>)?.business?.name as string) || data?.mySite?.businessName || "Hemsida"
    : data?.mySite?.businessName || "Hemsida";

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#1e1e2e]">
        <div className="flex h-14 items-center border-b border-white/10 px-4">
          <Skeleton className="h-6 w-40 !bg-white/10" />
        </div>
        <div className="flex flex-1">
          <div className="w-56 border-r border-white/10 p-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="mb-2 h-8 w-full !bg-white/10" />)}
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full !bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  const activeSection = SECTION_FILES.find((f) => f.key === activeFile);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1e1e2e] text-white">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/sites/${siteId}/general` as "/dashboard"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="h-5 w-px bg-white/20" />
          <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <span className="text-sm font-medium text-white/80">{siteName}</span>
          <span className="text-xs text-white/40">/ {activeSection?.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicators */}
          {parseError && (
            <span className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-2.5 py-1 text-xs text-red-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              JSON-fel
            </span>
          )}
          {!parseError && schemaError && (
            <span className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs text-amber-400" title={schemaError}>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              {t("schemaError")}
            </span>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {t("saved")}
            </span>
          )}
          {hasDraft && (
            <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs text-amber-400">
              {t("draft")}
            </span>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={saving || !!parseError}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 disabled:opacity-40"
          >
            {saving ? t("saving") : t("saveDraft")}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !!parseError || !!schemaError}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
          >
            {t("publish")}
          </button>
        </div>
      </header>

      {/* Message toast */}
      {message && (
        <div className={`absolute top-16 left-1/2 z-50 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg ${
          message.type === "success"
            ? "border-emerald-500/30 bg-emerald-900/80 text-emerald-300"
            : "border-red-500/30 bg-red-900/80 text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <aside className="w-56 shrink-0 border-r border-white/10 overflow-y-auto">
          <div className="px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {t("explorer")}
            </span>
          </div>
          <nav className="px-1.5 pb-2">
            {SECTION_FILES.map((file) => {
              const isActive = file.key === activeFile;
              const sectionData = siteData[file.key];
              const isNull = sectionData === null || sectionData === undefined;

              return (
                <button
                  key={file.key}
                  type="button"
                  onClick={() => {
                    // Save current before switching
                    saveCurrentFile();
                    setActiveFile(file.key);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold ${
                    isActive ? "bg-blue-500 text-white" : "bg-white/10 text-white/50"
                  }`}>
                    {file.icon}
                  </span>
                  <span className="truncate">{file.label}</span>
                  {isNull && (
                    <span className="ml-auto text-[10px] text-white/30">null</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex h-9 shrink-0 items-center border-b border-white/10 bg-white/[0.03] px-2">
            <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/80">
              <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              {activeSection?.label}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <textarea
              ref={editorRef}
              value={editorContent}
              onChange={(e) => handleContentChange(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 text-white/90 placeholder:text-white/20 focus:outline-none"
              style={{ tabSize: 2 }}
            />
          </div>

          {/* Status bar */}
          <div className="flex h-6 shrink-0 items-center justify-between border-t border-white/10 bg-white/[0.03] px-3 text-[11px] text-white/40">
            <div className="flex items-center gap-3">
              <span>JSON</span>
              <span>{editorContent.split("\n").length} {t("lines")}</span>
            </div>
            <div className="flex items-center gap-3">
              {parseError ? (
                <span className="text-red-400">{parseError}</span>
              ) : schemaError ? (
                <span className="text-amber-400">{schemaError}</span>
              ) : (
                <span className="text-emerald-400">{t("validSchema")}</span>
              )}
              <span>UTF-8</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
