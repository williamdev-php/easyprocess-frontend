"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth-context";
import { Button, Input, Label, Alert, ColorPicker } from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Color palette presets & randomizer
// ---------------------------------------------------------------------------

const PALETTE_PRESETS = [
  { primary: "#326586", secondary: "#24506E", accent: "#F4E9D4", background: "#FDFAF5", text: "#1A1A1A" },
  { primary: "#2563EB", secondary: "#1E40AF", accent: "#F59E0B", background: "#FFFFFF", text: "#111827" },
  { primary: "#059669", secondary: "#047857", accent: "#FBBF24", background: "#F9FAFB", text: "#111827" },
  { primary: "#7C3AED", secondary: "#6D28D9", accent: "#F472B6", background: "#FAFAFA", text: "#18181B" },
  { primary: "#DC2626", secondary: "#B91C1C", accent: "#FCD34D", background: "#FFFBEB", text: "#1F2937" },
  { primary: "#0891B2", secondary: "#0E7490", accent: "#FB923C", background: "#F0FDFA", text: "#134E4A" },
  { primary: "#4F46E5", secondary: "#4338CA", accent: "#34D399", background: "#F5F3FF", text: "#1E1B4B" },
  { primary: "#D97706", secondary: "#B45309", accent: "#3B82F6", background: "#FFFBEB", text: "#292524" },
];

function randomPalette() {
  return PALETTE_PRESETS[Math.floor(Math.random() * PALETTE_PRESETS.length)];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "email" | "choose" | "new-details" | "transform-url" | "generating" | "done" | "failed";

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep, mode }: { currentStep: Step; mode: "new" | "transform" | null }) {
  const t = useTranslations("createSite");

  const steps = [
    { key: "email", label: t("stepEmail") },
    { key: "choose", label: t("stepChoose") },
    { key: "details", label: t("stepDetails") },
    { key: "generate", label: t("stepGenerate") },
  ];

  const stepOrder: Record<Step, number> = {
    email: 0,
    choose: 1,
    "new-details": 2,
    "transform-url": 2,
    generating: 3,
    done: 4,
    failed: 3,
  };

  const currentIndex = stepOrder[currentStep] ?? 0;

  return (
    <div className="mb-10 flex items-center gap-3">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3 flex-1 last:flex-none">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < currentIndex
                  ? "bg-primary-deep text-white"
                  : i === currentIndex
                    ? "bg-primary-deep text-white"
                    : "bg-border-theme text-text-muted"
              }`}
            >
              {i < currentIndex ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden text-xs font-medium sm:block ${
                i <= currentIndex ? "text-primary-deep" : "text-text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 transition-colors ${i < currentIndex ? "bg-primary-deep" : "bg-border-theme"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton shimmer for loading
// ---------------------------------------------------------------------------

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-shimmer rounded bg-gradient-to-r from-border-theme via-accent/30 to-border-theme bg-[length:200%_100%] ${className}`} />;
}

function GeneratingAnimation({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="relative mb-8">
        <div className="h-20 w-20 rounded-full border-4 border-border-theme border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
      </div>
      <h2 className="mb-2 text-xl font-bold text-primary-deep">{title}</h2>
      <p className="mb-8 text-text-muted">{subtitle}</p>
      <div className="w-full max-w-md space-y-3">
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-5/6" />
        <SkeletonLine className="h-4 w-4/6" />
        <div className="pt-4" />
        <SkeletonLine className="h-32 w-full rounded-xl" />
        <div className="flex gap-3">
          <SkeletonLine className="h-20 flex-1 rounded-xl" />
          <SkeletonLine className="h-20 flex-1 rounded-xl" />
          <SkeletonLine className="h-20 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CreateSiteWizardProps {
  /** When true, skip the email step and hide login/register links (user is already authenticated) */
  embedded?: boolean;
  /** Called when site creation is done and user should proceed to dashboard */
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

export default function CreateSiteWizard({ embedded = false, onComplete }: CreateSiteWizardProps) {
  const t = useTranslations("createSite");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get("token");

  // State
  const [step, setStep] = useState<Step>(embedded ? "choose" : "email");
  const [mode, setMode] = useState<"new" | "transform" | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New site form
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [context, setContext] = useState("");
  const [colors, setColors] = useState<Colors>(randomPalette());
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Transform form
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Generation tracking
  const [leadId, setLeadId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState("");
  const [siteId, setSiteId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [siteClaimToken, setSiteClaimToken] = useState<string | null>(null);

  // If claim token in URL, handle it
  useEffect(() => {
    if (claimToken && isAuthenticated) {
      const token = getAccessToken();
      fetch(`${API_URL}/api/sites/claim/${claimToken}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.ok) {
            if (onComplete) {
              onComplete();
            } else {
              router.push("/dashboard/pages");
            }
          }
        })
        .catch(() => {});
    }
  }, [claimToken, isAuthenticated, router, onComplete]);

  // Auto-skip email step if logged in (only for non-embedded mode)
  useEffect(() => {
    if (!embedded && !authLoading && isAuthenticated && step === "email") {
      setStep("choose");
    }
  }, [embedded, authLoading, isAuthenticated, step]);

  // Poll generation status
  useEffect(() => {
    if (!leadId || step !== "generating") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/sites/create-status/${leadId}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setGenerationStatus(data.status);

        if (data.status === "GENERATED" && data.site_id) {
          setSiteId(data.site_id);
          setSubdomain(data.subdomain);
          setSiteClaimToken(data.claim_token);
          setStep("done");
          clearInterval(interval);
        } else if (data.status === "FAILED") {
          setError(data.error_message || "");
          setStep("failed");
          clearInterval(interval);
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [leadId, step]);

  // Helper: make API call with optional auth
  const apiCall = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Request failed");
      }
      return res.json();
    },
    [],
  );

  // Handle logo file upload
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Logo file must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setLogoUrl("");
    };
    reader.readAsDataURL(file);
  }

  // Submit: email step
  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || !email.includes(".")) {
      setError("Ange en giltig e-postadress");
      return;
    }
    setStep("choose");
  }

  // Submit: create new site
  async function handleCreateNew(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!businessName.trim()) return;

    setLoading(true);
    try {
      const data = await apiCall("/api/sites/create", {
        business_name: businessName,
        industry: industry || null,
        context: context || null,
        colors,
        logo_url: logoUrl || null,
        email: isAuthenticated ? user?.email : email,
      });
      setLeadId(data.lead_id);
      setStep("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Submit: transform existing site
  async function handleTransform(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!websiteUrl.trim()) return;

    setLoading(true);
    try {
      const data = await apiCall("/api/sites/create-from-url", {
        website_url: websiteUrl,
      });
      setLeadId(data.lead_id);
      setStep("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Handle retry
  function handleRetry() {
    setError("");
    setLeadId(null);
    setSiteId(null);
    if (mode === "new") {
      setStep("new-details");
    } else {
      setStep("transform-url");
    }
  }

  // Handle done -> navigate
  function handleGoToDashboard() {
    if (onComplete) {
      onComplete();
    } else {
      router.push("/dashboard/pages");
    }
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "qvickosite.com";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="mb-2 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-deep sm:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-text-muted">{t("pageSubtitle")}</p>
      </div>

      {/* Step indicator */}
      {step !== "done" && step !== "failed" && (
        <StepIndicator currentStep={step} mode={mode} />
      )}

      {/* Card wrapper */}
      <div className="rounded-2xl border border-border-theme bg-white p-6 shadow-sm sm:p-8">
        {error && step !== "generating" && <Alert className="mb-6">{error}</Alert>}

        {/* Step 1: Email / Auth */}
        {step === "email" && !authLoading && (
          <>
            {isAuthenticated ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep/10">
                  <svg className="h-8 w-8 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted">{t("loggedInAs")}</p>
                <p className="font-semibold text-primary-deep">{user?.fullName || user?.email}</p>
                <Button className="mt-6" onClick={() => setStep("choose")}>
                  {t("emailContinue")}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" required>{t("emailLabel")}</Label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">{t("emailNote")}</p>
                </div>
                <Button type="submit" fullWidth size="lg">
                  {t("emailContinue")}
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>

                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border-theme" />
                  <span className="text-xs text-text-muted">eller</span>
                  <div className="h-px flex-1 bg-border-theme" />
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex flex-1 items-center justify-center rounded-xl border-2 border-border-theme px-4 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
                  >
                    Logga in
                  </Link>
                  <Link
                    href="/register"
                    className="flex flex-1 items-center justify-center rounded-xl border-2 border-border-theme px-4 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
                  >
                    Skapa konto
                  </Link>
                </div>
              </form>
            )}
          </>
        )}

        {/* Step 2: Choose mode */}
        {step === "choose" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-primary-deep">{t("chooseTitle")}</h2>

            <button
              onClick={() => { setMode("new"); setStep("new-details"); }}
              className="group w-full rounded-xl border-2 border-border-theme p-5 text-left transition hover:border-primary hover:bg-primary-deep/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-deep/10 transition group-hover:bg-primary-deep/20">
                  <svg className="h-6 w-6 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-deep">{t("optionNew")}</h3>
                  <p className="mt-1 text-sm text-text-muted">{t("optionNewDesc")}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => { setMode("transform"); setStep("transform-url"); }}
              className="group w-full rounded-xl border-2 border-border-theme p-5 text-left transition hover:border-primary hover:bg-primary-deep/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-deep/10 transition group-hover:bg-primary-deep/20">
                  <svg className="h-6 w-6 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865H9.02" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-deep">{t("optionTransform")}</h3>
                  <p className="mt-1 text-sm text-text-muted">{t("optionTransformDesc")}</p>
                </div>
              </div>
            </button>

            {!embedded && !isAuthenticated && (
              <button
                onClick={() => setStep("email")}
                className="mt-2 flex items-center gap-1 text-sm text-text-muted hover:text-primary-deep transition"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {t("back")}
              </button>
            )}
          </div>
        )}

        {/* Step 3a: New site details */}
        {step === "new-details" && (
          <form onSubmit={handleCreateNew} className="space-y-6">
            <h2 className="text-lg font-bold text-primary-deep">{t("newSiteTitle")}</h2>

            <div>
              <Label htmlFor="businessName" required>{t("businessName")}</Label>
              <Input
                id="businessName"
                required
                placeholder={t("businessNamePlaceholder")}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="industry">{t("industry")}</Label>
              <Input
                id="industry"
                placeholder={t("industryPlaceholder")}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="context">{t("context")}</Label>
              <textarea
                id="context"
                rows={4}
                placeholder={t("contextPlaceholder")}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1.5 w-full rounded-xl border-2 border-border-theme bg-white px-4 py-3 text-sm text-primary-deep placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <p className="mt-1 text-xs text-text-muted">{t("contextHint")}</p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-primary-deep">{t("colorsTitle")}</h3>
                  <p className="text-xs text-text-muted">{t("colorsSubtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setColors(randomPalette())}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-theme px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary-deep transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865H9.02" />
                  </svg>
                  {t("randomizeColors")}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-border-theme p-4">
                <ColorPicker label={t("colorPrimary")} value={colors.primary} onChange={(v) => setColors({ ...colors, primary: v })} />
                <ColorPicker label={t("colorSecondary")} value={colors.secondary} onChange={(v) => setColors({ ...colors, secondary: v })} />
                <ColorPicker label={t("colorAccent")} value={colors.accent} onChange={(v) => setColors({ ...colors, accent: v })} />
                <ColorPicker label={t("colorBackground")} value={colors.background} onChange={(v) => setColors({ ...colors, background: v })} />
                <ColorPicker label={t("colorText")} value={colors.text} onChange={(v) => setColors({ ...colors, text: v })} />
              </div>
              <div className="mt-2 flex h-8 overflow-hidden rounded-lg border border-border-theme">
                <div className="flex-1" style={{ backgroundColor: colors.primary }} />
                <div className="flex-1" style={{ backgroundColor: colors.secondary }} />
                <div className="flex-1" style={{ backgroundColor: colors.accent }} />
                <div className="flex-1" style={{ backgroundColor: colors.background }} />
                <div className="flex-1" style={{ backgroundColor: colors.text }} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-primary-deep">{t("logoTitle")}</h3>
              <p className="text-xs text-text-muted">{t("logoSubtitle")}</p>
              <div className="mt-3">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-border-theme bg-white">
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-2" />
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLogoPreview(""); setLogoUrl(""); }}
                      className="text-sm text-error hover:underline"
                    >
                      {t("removeLogo")}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-border-theme px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-primary hover:text-primary-deep"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      {t("uploadLogo")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="flex items-center justify-center rounded-xl border-2 border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary-deep"
              >
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {t("back")}
              </button>
              <Button type="submit" disabled={loading || !businessName.trim()} fullWidth size="lg">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("generating")}
                  </span>
                ) : (
                  <>
                    {t("generateButton")}
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 3b: Transform URL */}
        {step === "transform-url" && (
          <form onSubmit={handleTransform} className="space-y-6">
            <h2 className="text-lg font-bold text-primary-deep">{t("transformTitle")}</h2>

            <div>
              <Label htmlFor="websiteUrl" required>{t("urlLabel")}</Label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <Input
                  id="websiteUrl"
                  required
                  placeholder={t("urlPlaceholder")}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="flex items-center justify-center rounded-xl border-2 border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary-deep"
              >
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                {t("back")}
              </button>
              <Button type="submit" disabled={loading || !websiteUrl.trim()} fullWidth size="lg">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("generating")}
                  </span>
                ) : (
                  <>
                    {t("startTransform")}
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Step 4: Generating */}
        {step === "generating" && (
          <GeneratingAnimation
            title={
              generationStatus === "SCRAPING" || generationStatus === "SCRAPED" || generationStatus === "NEW"
                ? t("scrapingTitle")
                : t("generatingTitle")
            }
            subtitle={
              generationStatus === "SCRAPING" || generationStatus === "SCRAPED" || generationStatus === "NEW"
                ? t("scrapingSubtitle")
                : t("generatingSubtitle")
            }
          />
        )}

        {/* Step 5: Done */}
        {step === "done" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-deep/10">
              <svg className="h-10 w-10 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-deep">{t("successTitle")}</h2>
            <p className="mt-2 text-text-muted">{t("successSubtitle")}</p>

            {subdomain && (
              <div className="mt-4 rounded-xl border border-primary/20 bg-primary-deep/5 p-4">
                <p className="text-sm text-text-muted">Din hemsida:</p>
                <p className="font-mono text-sm font-semibold text-primary-deep">
                  {subdomain}.{baseDomain}
                </p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {isAuthenticated ? (
                <>
                  {subdomain && (
                    <a
                      href={`https://${subdomain}.${baseDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-xl border-2 border-border-theme px-6 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
                    >
                      {t("viewSite")}
                      <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  )}
                  <Button fullWidth size="lg" onClick={handleGoToDashboard}>
                    {t("goToDashboard")}
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href={siteClaimToken ? `/login?redirect=/create-site?token=${siteClaimToken}` : "/login"}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-deep"
                  >
                    {t("loginToView")}
                  </Link>
                  <Link
                    href={siteClaimToken ? `/register?claim=${siteClaimToken}` : "/register"}
                    className="flex w-full items-center justify-center rounded-xl border-2 border-border-theme px-6 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
                  >
                    {t("createAccountToView")}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step: Failed */}
        {step === "failed" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
              <svg className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-deep">{t("failedTitle")}</h2>
            <p className="mt-2 text-text-muted">{t("failedSubtitle")}</p>
            {error && (
              <p className="mt-2 rounded-lg bg-error/5 p-3 text-sm text-error">{error}</p>
            )}
            <Button className="mt-6" size="lg" onClick={handleRetry}>
              {t("tryAgain")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
