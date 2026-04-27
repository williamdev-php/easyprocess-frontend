"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth-context";
import { Button, Input, Label, Alert, ColorPicker, FontSelector, Dropdown, Tooltip } from "@/components/ui";
import Confetti from "@/components/confetti";
import { GoogleLoginButton } from "@/components/google-login-button";
import { trackEvent } from "@/lib/tracking";
import { pickSafeDefaultFont } from "@/lib/fonts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

import { PALETTE_PRESETS, randomPalette } from "@/lib/palette-presets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step = "account" | "choose" | "new-details" | "transform-url" | "generating" | "done" | "failed";

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

/* Tooltip component is now imported from @/components/ui */

function StepIndicator({ currentStep, mode }: { currentStep: Step; mode: "new" | "transform" | null }) {
  const t = useTranslations("createSite");

  const steps = [
    { key: "account", label: t("stepAccount") },
    { key: "choose", label: t("stepChoose") },
    { key: "details", label: t("stepDetails") },
    { key: "generate", label: t("stepGenerate") },
  ];

  const stepOrder: Record<Step, number> = {
    account: 0,
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
  /** When true, the wizard is used inside the dashboard (user is already authenticated) */
  embedded?: boolean;
  /** Called when site creation is done and user should proceed to dashboard */
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

export default function CreateSiteWizard({ embedded = false, onComplete }: CreateSiteWizardProps) {
  const t = useTranslations("createSite");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const { user, isAuthenticated, isLoading: authLoading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get("token");

  // Read mode from URL params to allow skipping steps
  const urlMode = searchParams.get("mode");
  const initialMode = urlMode === "new" || urlMode === "transform" ? urlMode : null;

  // State
  const [step, setStep] = useState<Step>(embedded ? (initialMode ? (initialMode === "new" ? "new-details" : "transform-url") : "choose") : "account");
  const [mode, setMode] = useState<"new" | "transform" | null>(initialMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // New site form
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [showIndustryPicker, setShowIndustryPicker] = useState(false);
  const [industries, setIndustries] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [industriesLoaded, setIndustriesLoaded] = useState(false);
  const [context, setContext] = useState("");
  const [colors, setColors] = useState<Colors>(randomPalette());
  const [randomizing, setRandomizing] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = useState<{ preview: string; url: string }[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [font, setFont] = useState(pickSafeDefaultFont());

  // Transform form
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Generation tracking
  const [leadId, setLeadId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState("");
  const [siteId, setSiteId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [siteClaimToken, setSiteClaimToken] = useState<string | null>(null);

  // Check if authenticated user has at least one site
  const [hasSites, setHasSites] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) { setHasSites(false); return; }
    const token = getAccessToken();
    if (!token) return;
    fetch(`${API_URL}/graphql`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: "{ mySites { id } }" }),
    })
      .then((r) => r.json())
      .then((d) => { if (d.data?.mySites?.length > 0) setHasSites(true); })
      .catch(() => {});
  }, [isAuthenticated]);

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
            } else if (data.site_id) {
              router.push(`/dashboard/sites/${data.site_id}/general`);
            } else {
              router.push("/dashboard/pages");
            }
          }
        })
        .catch(() => {});
    }
  }, [claimToken, isAuthenticated, router, onComplete]);

  // Auto-skip account step when already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && step === "account") {
      // Restore form state from sessionStorage (after auth redirect)
      try {
        const saved = sessionStorage.getItem("create-site-form");
        if (saved) {
          const data = JSON.parse(saved);
          if (data.businessName) setBusinessName(data.businessName);
          if (data.industry) setIndustry(data.industry);
          if (data.industryId) setIndustryId(data.industryId);
          if (data.context) setContext(data.context);
          if (data.colors) setColors(data.colors);
          if (data.font) setFont(data.font);
          if (data.websiteUrl) setWebsiteUrl(data.websiteUrl);
          if (data.logoUrl) setLogoUrl(data.logoUrl);
          if (data.mode) setMode(data.mode);
          if (data.pendingStep) {
            setStep(data.pendingStep as Step);
            sessionStorage.removeItem("create-site-form");
            return;
          }
          sessionStorage.removeItem("create-site-form");
        }
      } catch {}

      if (initialMode === "new") {
        setStep("new-details");
      } else if (initialMode === "transform") {
        setStep("transform-url");
      } else {
        setStep("choose");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, step, initialMode]);

  // Fetch industries when picker is shown
  useEffect(() => {
    if (!showIndustryPicker || industriesLoaded) return;
    fetch(`${API_URL}/api/sites/industries`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { id: string; name: string; slug: string }[]) => {
        setIndustries(data);
        setIndustriesLoaded(true);
      })
      .catch(() => setIndustriesLoaded(true));
  }, [showIndustryPicker, industriesLoaded]);

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
          trackEvent("create_site_completed", { site_id: data.site_id });
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
        // FastAPI returns detail as string or array of validation errors
        let message = "";
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((e: { msg?: string; loc?: string[] }) => e.msg || "")
            .filter(Boolean)
            .join(", ");
        }
        throw new Error(message || t("errorGeneric"));
      }
      return res.json();
    },
    [t],
  );

  // Handle logo file upload
  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError(t("errorLogoTooLarge"));
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

  // Handle image file uploads (up to 12)
  function handleImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const remaining = 12 - imageFiles.length;
    const toAdd = Array.from(files).slice(0, remaining);
    for (const file of toAdd) {
      if (file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = () => {
        setImageFiles((prev) => {
          if (prev.length >= 12) return prev;
          return [...prev, { preview: reader.result as string, url: "" }];
        });
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function removeImage(idx: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // Save form state to sessionStorage before auth redirect
  function saveFormState(pendingStep: Step) {
    try {
      sessionStorage.setItem("create-site-form", JSON.stringify({
        businessName,
        industry,
        industryId,
        context,
        colors,
        font,
        websiteUrl,
        logoUrl,
        mode,
        pendingStep,
      }));
    } catch {}
  }

  // Submit: create new site
  async function handleCreateNew(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!businessName.trim()) return;
    await startGeneration();
  }

  async function startGeneration() {
    trackEvent("create_site_started", { mode: "new" });
    setLoading(true);
    try {
      const data = await apiCall("/api/sites/create", {
        business_name: businessName,
        industry: industry || null,
        industry_id: industryId || null,
        context: context || null,
        colors,
        logo_url: logoUrl || null,
        email: user?.email,
        image_urls: imageFiles.length > 0 ? imageFiles.map((f) => f.preview) : null,
        font: font || null,
      });
      setLeadId(data.lead_id);
      setStep("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  // Submit: transform existing site
  async function handleTransform(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!websiteUrl.trim()) return;
    await startTransformGeneration();
  }

  async function startTransformGeneration() {
    setLoading(true);
    try {
      const data = await apiCall("/api/sites/create-from-url", {
        website_url: websiteUrl,
      });
      setLeadId(data.lead_id);
      setStep("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
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
    } else if (siteId) {
      router.push(`/dashboard/sites/${siteId}/general`);
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

        {/* Loading skeleton while auth state is being determined */}
        {authLoading && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <SkeletonLine className="h-16 w-16 rounded-full" />
            </div>
            <SkeletonLine className="mx-auto h-6 w-48" />
            <SkeletonLine className="mx-auto h-4 w-64" />
            <div className="space-y-3 pt-4">
              <SkeletonLine className="h-12 w-full rounded-xl" />
              <SkeletonLine className="h-12 w-full rounded-xl" />
              <SkeletonLine className="h-12 w-full rounded-xl" />
            </div>
          </div>
        )}

        {/* Step 1: Account — require auth before proceeding */}
        {step === "account" && !authLoading && !isAuthenticated && (
          <div key="account" className="animate-fade-switch space-y-6 py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep/10">
              <svg className="h-8 w-8 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-primary-deep">{t("accountTitle")}</h2>
            <p className="text-sm text-text-muted">{t("accountSubtitle")}</p>

            <div className="flex flex-col gap-3">
              <GoogleLoginButton
                loading={googleLoading}
                onSuccess={async (code, redirectUri) => {
                  setGoogleLoading(true);
                  setError("");
                  try {
                    await loginWithGoogle(code, redirectUri, locale);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : tAuth("googleLoginFailed"));
                  } finally {
                    setGoogleLoading(false);
                  }
                }}
              />

              <div className="my-2 flex items-center gap-4">
                <div className="h-px flex-1 bg-border-theme" />
                <span className="text-xs font-medium text-text-muted">{tAuth("orContinueWith")}</span>
                <div className="h-px flex-1 bg-border-theme" />
              </div>

              <Link
                href={`/register?redirect=${encodeURIComponent("/create-site")}`}
                onClick={() => saveFormState("choose")}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-deep px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-primary-dark hover:to-primary-deep"
              >
                {t("accountRegister")}
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent("/create-site")}`}
                onClick={() => saveFormState("choose")}
                className="flex w-full items-center justify-center rounded-xl border-2 border-border-theme px-6 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
              >
                {t("accountLogin")}
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Choose mode */}
        {step === "choose" && (
          <div key="choose" className="animate-fade-switch space-y-4">
            <h2 className="text-lg font-bold text-primary-deep">{t("chooseTitle")}</h2>

            <button
              onClick={() => {
                setMode("new");
                setStep("new-details");
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("mode", "new");
                  window.history.replaceState({}, "", url.toString());
                } catch {}
              }}
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
              onClick={() => {
                setMode("transform");
                setStep("transform-url");
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.set("mode", "transform");
                  window.history.replaceState({}, "", url.toString());
                } catch {}
              }}
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

            {isAuthenticated && hasSites && (
              <Link
                href="/dashboard"
                className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-primary-deep/70 hover:text-primary-deep transition"
              >
                {t("goToDashboard")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}

          </div>
        )}

        {/* Step 3a: New site details */}
        {step === "new-details" && (
          <form onSubmit={handleCreateNew} className="animate-fade-switch space-y-6">
            <h2 className="text-lg font-bold text-primary-deep">{t("newSiteTitle")}</h2>

            <div>
              <div className="flex items-center">
                <Label htmlFor="businessName" required>{t("businessName")}</Label>
                <Tooltip text={t("businessNameTooltip")} />
              </div>
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
              <div className="flex items-center">
                <Label htmlFor="industry">{t("industry")}</Label>
                <Tooltip text={t("industryTooltip")} />
              </div>
              <Input
                id="industry"
                placeholder={t("industryPlaceholder")}
                value={industry}
                onChange={(e) => { setIndustry(e.target.value); setIndustryId(null); }}
                className="mt-1.5"
              />

              {/* Industry-specific toggle */}
              {!showIndustryPicker ? (
                <button
                  type="button"
                  onClick={() => setShowIndustryPicker(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-deep/70 hover:text-primary-deep transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  {t("industrySpecificToggle")}
                </button>
              ) : (
                <div className="mt-3 rounded-xl border border-primary/20 bg-primary-deep/5 p-3">
                  <p className="mb-2 text-xs text-text-muted">{t("industrySpecificHint")}</p>
                  <label htmlFor="industrySelect" className="text-xs font-semibold text-primary-deep">
                    {t("industryDropdownLabel")}
                  </label>
                  <div className="mt-1">
                    <Dropdown
                      options={industries.map((ind) => ({ value: ind.id, label: ind.name }))}
                      value={industryId || undefined}
                      onChange={(id) => {
                        setIndustryId(id || null);
                        if (id) {
                          const found = industries.find((ind) => ind.id === id);
                          if (found) setIndustry(found.name);
                        }
                      }}
                      placeholder={t("industryDropdownPlaceholder")}
                      fullWidth
                      size="sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowIndustryPicker(false); setIndustryId(null); }}
                    className="mt-2 text-xs text-text-muted hover:text-primary-deep transition"
                  >
                    {t("back")}
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center">
                <Label htmlFor="context">{t("context")}</Label>
                <Tooltip text={t("contextTooltip")} />
              </div>
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
                <div className="flex items-center">
                  <h3 className="text-sm font-semibold text-primary-deep">{t("colorsTitle")}</h3>
                  <Tooltip text={t("colorsTooltip")} />
                  <p className="ml-2 text-xs text-text-muted">{t("colorsSubtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRandomizing(true);
                    setTimeout(() => {
                      setColors(randomPalette());
                      setTimeout(() => setRandomizing(false), 500);
                    }, 150);
                  }}
                  disabled={randomizing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-theme px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary-deep transition active:scale-[0.97] disabled:opacity-70"
                >
                  <svg className={`h-3.5 w-3.5 ${randomizing ? "animate-spin-once" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-primary-deep">{t("fontTitle")}</h3>
                <Tooltip text={t("fontTooltip")} />
              </div>
              <p className="text-xs text-text-muted">{t("fontSubtitle")}</p>
              <div className="mt-2">
                <FontSelector value={font} onChange={setFont} />
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-primary-deep">{t("imagesTitle")}</h3>
                <Tooltip text={t("imagesTooltip")} />
              </div>
              <p className="text-xs text-text-muted">{t("imagesSubtitle")}</p>
              <div className="mt-3">
                {imageFiles.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {imageFiles.map((img, idx) => (
                      <div key={idx} className="group relative aspect-square overflow-hidden rounded-xl border-2 border-border-theme bg-white">
                        <img src={img.preview} alt={`Image ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageFiles.length < 12 && (
                  <div className="flex items-center gap-3">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageFiles}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-border-theme px-4 py-3 text-sm font-medium text-text-secondary transition hover:border-primary hover:text-primary-deep"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      {t("uploadImages")}
                    </button>
                    <span className="text-xs text-text-muted">{t("imagesCount", { count: imageFiles.length })}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-primary-deep">{t("logoTitle")}</h3>
                <Tooltip text={t("logoTooltip")} />
              </div>
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
          <form onSubmit={handleTransform} className="animate-fade-switch space-y-6">
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
        {step === "done" && <Confetti />}
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
