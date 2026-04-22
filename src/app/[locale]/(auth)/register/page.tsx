"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth-context";
import { Button, Input, Label, Alert, Checkbox } from "@/components/ui";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get("claim");
  const rawRedirect = searchParams.get("redirect") || "/dashboard";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard";
  const t = useTranslations("auth");
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    orgNumber: "",
    phone: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      setError(t("invalidEmail"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (!agreedToTerms) {
      setError(t("mustAgreeToTerms"));
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        companyName: form.companyName || undefined,
        orgNumber: form.orgNumber || undefined,
        phone: form.phone || undefined,
        locale,
      });

      // If registering with a claim token, claim the site after registration
      if (claimToken) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
          const token = getAccessToken();
          await fetch(`${API_URL}/api/sites/claim/${claimToken}`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        } catch {
          // Claim failed but account was created — redirect to dashboard anyway
        }
        router.push("/dashboard/pages");
        return;
      }
      router.push(redirect as "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registerFailed"));
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : form.password.length < 12
          ? 2
          : 3;

  const strengthColors = ["", "bg-error", "bg-accent", "bg-primary"];
  const strengthLabels = ["", t("passwordWeak"), t("passwordOk"), t("passwordStrong")];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-primary-deep">
          {t("getStarted")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-deep">
          {t("registerTitle")}
        </h1>
        <p className="mt-2 text-text-muted">{t("registerSubtitle")}</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-deep text-xs font-bold text-white">
            {step > 1 ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              "1"
            )}
          </div>
          <span className="text-xs font-medium text-primary-deep">{t("stepAccount")}</span>
        </div>
        <div className={`h-px flex-1 transition-colors ${step > 1 ? "bg-primary-deep" : "bg-border-theme"}`} />
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? "bg-primary-deep text-white" : "bg-border-theme text-text-muted"}`}>
            2
          </div>
          <span className={`text-xs font-medium transition-colors ${step === 2 ? "text-primary-deep" : "text-text-muted"}`}>{t("stepDetails")}</span>
        </div>
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      {/* Step 1 — Account */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-5">
          <div>
            <Label htmlFor="fullName" required>{t("fullName")}</Label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <Input id="fullName" required placeholder="William Soderstrom" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="pl-11" />
            </div>
          </div>

          <div>
            <Label htmlFor="email" required>{t("email")}</Label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <Input id="email" type="email" required placeholder="din@email.se" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-11" />
            </div>
          </div>

          <div>
            <Label htmlFor="password" required>{t("password")}</Label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minst 8 tecken"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="pl-11 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-text-muted hover:text-text-secondary transition"
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Password strength */}
            {form.password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level ? strengthColors[passwordStrength] : "bg-border-theme"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-text-muted">{strengthLabels[passwordStrength]}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword" required>{t("confirmPassword")}</Label>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <Input
                id="confirmPassword"
                type="password"
                required
                placeholder="Upprepa losenord"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="pl-11"
                error={form.confirmPassword.length > 0 && form.password !== form.confirmPassword}
              />
            </div>
            {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
              <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("passwordMatch")}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <label htmlFor="terms" className="text-sm text-text-muted leading-snug">
              {t("agreeToTermsPrefix")}{" "}
              <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary-deep">
                {t("termsLinkText")}
              </Link>
            </label>
          </div>

          <Button type="submit" fullWidth size="lg">
            {t("continue")}
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </form>
      )}

      {/* Step 2 — Company details */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-primary/10 bg-primary-deep/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-deep/10">
                <svg className="h-5 w-5 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-deep">{form.fullName}</p>
                <p className="text-xs text-text-muted">{form.email}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="companyName">{t("companyName")}</Label>
              <div className="group relative">
                <svg className="h-4 w-4 text-text-muted cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-primary-deep px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {t("companyNameTooltip")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-deep" />
                </div>
              </div>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18h16.5V3H3.75zm3 3.75h3v3h-3v-3zm6.75 0h3v3h-3v-3zm-6.75 6h3v3h-3v-3zm6.75 0h3v3h-3v-3z" />
                </svg>
              </div>
              <Input id="companyName" placeholder={t("companyNamePlaceholder")} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} className="pl-11" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="orgNumber">{t("orgNumber")}</Label>
              <div className="group relative">
                <svg className="h-4 w-4 text-text-muted cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-primary-deep px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {t("orgNumberTooltip")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-deep" />
                </div>
              </div>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
                </svg>
              </div>
              <Input id="orgNumber" placeholder="XXXXXX-XXXX" value={form.orgNumber} onChange={(e) => update("orgNumber", e.target.value)} className="pl-11" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <div className="group relative">
                <svg className="h-4 w-4 text-text-muted cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-lg bg-primary-deep px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {t("phoneTooltip")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-deep" />
                </div>
              </div>
            </div>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <Input id="phone" type="tel" placeholder="+46 70 123 45 67" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="pl-11" />
            </div>
          </div>

          <p className="text-xs text-text-muted">{t("optionalNote")}</p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center justify-center rounded-xl border-2 border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary-deep"
            >
              <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-xl border-2 border-border-theme px-5 py-3 text-sm font-semibold text-text-secondary transition hover:border-primary hover:text-primary-deep"
            >
              {t("skip")}
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <Button type="submit" disabled={loading} fullWidth size="lg">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("registering")}
                </span>
              ) : (
                t("registerButton")
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Bottom link */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-theme" />
        <span className="text-xs font-medium text-text-muted">{t("hasAccount")}</span>
        <div className="h-px flex-1 bg-border-theme" />
      </div>

      <Link
        href={redirect !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
        className="flex w-full items-center justify-center rounded-xl border-2 border-border-theme px-6 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
      >
        {t("loginLink")}
      </Link>
    </>
  );
}
