"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation } from "@apollo/client/react";
import { MY_SITE } from "@/graphql/queries";
import { UPDATE_SITE_SETTINGS } from "@/graphql/mutations";
import { Link } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaPickerField } from "@/components/media-picker";

interface SiteData {
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    language?: string;
    og_image?: string;
    favicon_url?: string;
  };
  business?: {
    name?: string;
    tagline?: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    org_number?: string | null;
  };
  seo?: {
    robots?: string;
    structured_data?: Record<string, unknown>;
  };
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-xl bg-gradient-to-r from-border-light via-white to-border-light bg-[length:200%_100%] ${className}`} />
  );
}

export default function SiteSettingsPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("siteSettings");
  const siteId = params.id;

  const { data, loading } = useQuery<{ mySite: { siteData: SiteData } | null }>(MY_SITE, { variables: { id: siteId } });
  const [updateSettings, { loading: saving }] = useMutation(UPDATE_SITE_SETTINGS);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [robots, setRobots] = useState("index, follow");

  // Language
  const [language, setLanguage] = useState("sv");

  // Business / Owner
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessOrgNumber, setBusinessOrgNumber] = useState("");

  // Structured data
  const [structuredData, setStructuredData] = useState("");
  const [structuredDataError, setStructuredDataError] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize from site data
  useEffect(() => {
    if (!data?.mySite?.siteData) return;
    const sd = data.mySite.siteData;

    setMetaTitle(sd.meta?.title || "");
    setMetaDescription(sd.meta?.description || "");
    setMetaKeywords((sd.meta?.keywords || []).join(", "));
    setOgImage(sd.meta?.og_image || "");
    setFaviconUrl(sd.meta?.favicon_url || "");
    setLanguage(sd.meta?.language || "sv");
    setRobots(sd.seo?.robots || "index, follow");

    setBusinessName(sd.business?.name || "");
    setBusinessEmail(sd.business?.email || "");
    setBusinessPhone(sd.business?.phone || "");
    setBusinessAddress(sd.business?.address || "");
    setBusinessOrgNumber(sd.business?.org_number || "");

    if (sd.seo?.structured_data && Object.keys(sd.seo.structured_data).length > 0) {
      setStructuredData(JSON.stringify(sd.seo.structured_data, null, 2));
    }
  }, [data]);

  const handleSave = useCallback(async () => {
    try {
      const settings = {
        meta: {
          title: metaTitle,
          description: metaDescription,
          keywords: metaKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          og_image: ogImage || null,
          favicon_url: faviconUrl || null,
          language,
        },
        business: {
          name: businessName,
          email: businessEmail || null,
          phone: businessPhone || null,
          address: businessAddress || null,
          org_number: businessOrgNumber || null,
        },
        seo: {
          robots,
          structured_data: structuredData ? (() => {
            try { return JSON.parse(structuredData); }
            catch { return undefined; }
          })() : undefined,
        },
      };
      await updateSettings({ variables: { siteId, settings } });
      setMessage({ type: "success", text: t("saveSuccess") });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error" });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [
    siteId, metaTitle, metaDescription, metaKeywords, ogImage, faviconUrl,
    language, businessName, businessEmail, businessPhone, businessAddress,
    businessOrgNumber, robots, structuredData, updateSettings, t,
  ]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/pages` as "/dashboard"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-primary/5 hover:text-primary-deep transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-primary-deep">{t("title")}</h2>
            <p className="mt-0.5 text-sm text-text-muted">{businessName || t("subtitle")}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? t("saving") : t("save")}
        </Button>
      </div>

      {/* Message toast */}
      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          message.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* SEO Section */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">{t("seoTitle")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("metaTitle")}</label>
            <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            <p className="mt-1 text-xs text-text-muted">{metaTitle.length}/60 {t("characters")}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("metaDescription")}</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-sm text-primary-deep transition-all duration-150 placeholder:text-text-muted hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            />
            <p className="mt-1 text-xs text-text-muted">{metaDescription.length}/160 {t("characters")}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("metaKeywords")}</label>
            <Input
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder={t("keywordsPlaceholder")}
            />
          </div>
          <div>
            <MediaPickerField
              value={ogImage}
              onChange={(url) => setOgImage(url)}
              label={t("ogImage")}
              folder="seo"
            />
          </div>
          <div>
            <MediaPickerField
              value={faviconUrl}
              onChange={(url) => setFaviconUrl(url)}
              label={t("favicon")}
              folder="branding"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("robots")}</label>
            <select
              value={robots}
              onChange={(e) => setRobots(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-sm text-primary-deep transition-all duration-150 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
            >
              <option value="index, follow">index, follow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
          </div>
        </div>
      </div>

      {/* SERP Preview */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold text-primary-deep">Förhandsgranskning i Google</h3>
        <div className="rounded-xl border border-border-light bg-gray-50 p-4">
          <div className="max-w-xl">
            <p className="text-sm text-text-muted truncate">
              example.com
            </p>
            <h4 className="mt-0.5 text-lg font-medium leading-snug" style={{ color: "#1a0dab" }}>
              {metaTitle || "Sidtitel saknas"}
            </h4>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "#545454" }}>
              {metaDescription || "Ingen meta-beskrivning angiven. Google visar vanligtvis de första ~160 tecknen av sidans innehåll."}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
            <span className={metaTitle.length > 60 ? "text-red-500 font-medium" : metaTitle.length > 50 ? "text-yellow-600" : "text-emerald-600"}>
              Titel: {metaTitle.length}/60
            </span>
            <span className={metaDescription.length > 160 ? "text-red-500 font-medium" : metaDescription.length > 140 ? "text-yellow-600" : "text-emerald-600"}>
              Beskrivning: {metaDescription.length}/160
            </span>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">{t("languageTitle")}</h3>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("siteLanguage")}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full max-w-xs rounded-xl border border-border-light bg-white px-3.5 py-2.5 text-sm text-primary-deep transition-all duration-150 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          >
            <option value="sv">Svenska</option>
            <option value="en">English</option>
            <option value="no">Norsk</option>
            <option value="da">Dansk</option>
            <option value="fi">Suomi</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Owner / Business Section */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <h3 className="mb-5 text-sm font-semibold text-primary-deep">{t("ownerTitle")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("businessName")}</label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("businessEmail")}</label>
            <Input
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              type="email"
              error={!!businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)}
            />
            {businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail) && (
              <p className="mt-1 text-xs text-red-500">Ogiltig e-postadress</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("businessPhone")}</label>
            <Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("businessOrgNumber")}</label>
            <Input value={businessOrgNumber} onChange={(e) => setBusinessOrgNumber(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">{t("businessAddress")}</label>
            <Input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Structured Data (JSON-LD) */}
      <div className="rounded-2xl border border-border-light bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary-deep">Strukturerad data (JSON-LD)</h3>
            <p className="mt-0.5 text-xs text-text-muted">Hjälper sökmotorer förstå ditt innehåll bättre</p>
          </div>
          {!structuredData && (
            <button
              type="button"
              onClick={() => {
                const template = {
                  "@context": "https://schema.org",
                  "@type": "LocalBusiness",
                  name: businessName || "",
                  email: businessEmail || undefined,
                  telephone: businessPhone || undefined,
                  address: businessAddress ? {
                    "@type": "PostalAddress",
                    streetAddress: businessAddress,
                  } : undefined,
                };
                setStructuredData(JSON.stringify(template, null, 2));
              }}
              className="rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
            >
              Skapa mall
            </button>
          )}
        </div>
        <textarea
          value={structuredData}
          onChange={(e) => {
            setStructuredData(e.target.value);
            if (e.target.value.trim()) {
              try {
                JSON.parse(e.target.value);
                setStructuredDataError(null);
              } catch (err) {
                setStructuredDataError(err instanceof Error ? err.message : "Ogiltig JSON");
              }
            } else {
              setStructuredDataError(null);
            }
          }}
          rows={10}
          placeholder='{"@context": "https://schema.org", "@type": "LocalBusiness", ...}'
          spellCheck={false}
          className="w-full rounded-xl border border-border-light bg-gray-50 px-3.5 py-2.5 font-mono text-xs text-primary-deep transition-all duration-150 placeholder:text-text-muted hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
        />
        {structuredDataError && (
          <p className="mt-1.5 text-xs text-red-500">{structuredDataError}</p>
        )}
        {structuredData && !structuredDataError && (
          <p className="mt-1.5 text-xs text-emerald-600">Giltig JSON-LD</p>
        )}
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("saveAll")}
        </Button>
      </div>
    </div>
  );
}
