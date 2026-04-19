"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { UPDATE_SITE_DATA, SAVE_DRAFT, LOAD_DRAFT } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";

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
  const [updateSiteData] = useMutation(UPDATE_SITE_DATA);
  const [saveDraftMut] = useMutation(SAVE_DRAFT);
  const [loadDraftMut] = useMutation<{ loadDraft: { siteId: string; draftData: Record<string, unknown>; updatedAt: string } | null }>(LOAD_DRAFT);

  const [siteData, setSiteData] = useState<Record<string, unknown>>({});
  const [activeFile, setActiveFile] = useState("meta");
  const [editorContent, setEditorContent] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
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
      setEditorContent(JSON.stringify(section ?? null, null, 2));
      setParseError(null);
    } catch {
      setEditorContent("");
    }
  }, [activeFile, siteData]);

  // Parse and validate on content change
  const handleContentChange = useCallback((value: string) => {
    setEditorContent(value);
    setSaved(false);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e: unknown) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, []);

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

  // Publish all changes
  const handlePublish = useCallback(async () => {
    if (!saveCurrentFile()) return;
    setSaving(true);
    try {
      const merged = { ...siteData, [activeFile]: JSON.parse(editorContent) };
      await updateSiteData({
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
  }, [siteId, siteData, activeFile, editorContent, saveCurrentFile, updateSiteData, t]);

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
            href={`/dashboard/pages/${siteId}` as "/dashboard"}
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
            disabled={saving || !!parseError}
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
              ) : (
                <span className="text-emerald-400">{t("validJson")}</span>
              )}
              <span>UTF-8</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
