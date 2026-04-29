"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/lib/auth-context";
import { forgotPassword } from "@/lib/api";
import { Button, Input, Label, Alert } from "@/components/ui";
import { GoogleLoginButton } from "@/components/google-login-button";

function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/dashboard/select-site";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard/select-site";
  const t = useTranslations("auth");
  const locale = useLocale();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<
    "idle" | "loading" | "sent" | "limited" | "error"
  >("idle");
  const [forgotPasswordError, setForgotPasswordError] = useState("");

  const FORGOT_PASSWORD_STORAGE_KEY = "lastPasswordResetRequest";

  function handleEmailContinue(e: FormEvent) {
    e.preventDefault();
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setForgotPasswordStatus("idle");
    setLoading(true);
    try {
      await login({ email, password });
      router.push(redirect as "/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("loginFailed");
      if (message === "Invalid email or password") {
        setError(t("invalidCredentials"));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) return;

    const lastRequest = localStorage.getItem(FORGOT_PASSWORD_STORAGE_KEY);
    if (lastRequest) {
      const elapsed = Date.now() - parseInt(lastRequest, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (elapsed < oneDay) {
        setForgotPasswordStatus("limited");
        return;
      }
    }

    setForgotPasswordStatus("loading");
    setForgotPasswordError("");
    try {
      await forgotPassword(email);
      localStorage.setItem(FORGOT_PASSWORD_STORAGE_KEY, Date.now().toString());
      setForgotPasswordStatus("sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("forgotPasswordError");
      setForgotPasswordError(message);
      setForgotPasswordStatus("error");
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full bg-primary-deep/5 px-3 py-1 text-xs font-semibold text-primary-deep">
          {t("welcomeBack")}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-primary-deep">
          {t("loginTitle")}
        </h1>
        <p className="mt-2 text-text-muted">{t("loginSubtitle")}</p>
      </div>

      {error && <Alert className="mb-6 animate-fade-in">{error}</Alert>}

      {/* ---- Step 1: Google + email ---- */}
      {step === 1 && (
        <>
          {/* Google login */}
          <GoogleLoginButton
            loading={googleLoading}
            onSuccess={async (code, redirectUri) => {
              setGoogleLoading(true);
              setError("");
              try {
                await loginWithGoogle(code, redirectUri, locale);
                router.push(redirect as "/dashboard");
              } catch (err) {
                setError(err instanceof Error ? err.message : t("googleLoginFailed"));
              } finally {
                setGoogleLoading(false);
              }
            }}
          />

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border-theme" />
            <span className="text-xs font-medium text-text-muted">{t("orContinueWith")}</span>
            <div className="h-px flex-1 bg-border-theme" />
          </div>

          {/* Email input */}
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div>
              <Label htmlFor="email">{t("email")}</Label>
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
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <Button type="submit" fullWidth size="lg">
              {t("continue")}
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </form>
        </>
      )}

      {/* ---- Step 2: Password ---- */}
      {step === 2 && (
        <div className="animate-fade-switch">
          {/* Email display + back */}
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/10 bg-primary-deep/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-deep/10">
              <svg className="h-5 w-5 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-primary-deep">{email}</p>
              <p className="text-xs text-text-muted">{t("enterPassword")}</p>
            </div>
            <button
              type="button"
              onClick={() => { setStep(1); setPassword(""); setError(""); setForgotPasswordStatus("idle"); }}
              className="shrink-0 text-xs font-medium text-primary hover:text-primary-deep transition underline"
            >
              {t("back")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-1">
              {forgotPasswordStatus === "idle" && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-primary hover:text-primary-deep transition underline"
                >
                  {t("forgotPassword")}
                </button>
              )}
              {forgotPasswordStatus === "loading" && (
                <p className="text-sm text-text-muted animate-pulse">...</p>
              )}
              {forgotPasswordStatus === "sent" && (
                <p className="text-sm text-green-600 animate-fade-in">{t("forgotPasswordSent")}</p>
              )}
              {forgotPasswordStatus === "limited" && (
                <p className="text-sm text-amber-600 animate-fade-in">{t("forgotPasswordLimit")}</p>
              )}
              {forgotPasswordStatus === "error" && (
                <p className="text-sm text-red-600 animate-fade-in">
                  {forgotPasswordError || t("forgotPasswordError")}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} fullWidth size="lg" className="disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("loggingIn")}
                </span>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Register link */}
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-theme" />
        <span className="text-xs font-medium text-text-muted">{t("noAccount")}</span>
        <div className="h-px flex-1 bg-border-theme" />
      </div>

      <Link
        href={redirect !== "/dashboard" ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
        className="flex w-full items-center justify-center rounded-xl border-2 border-border-theme px-6 py-3 text-sm font-semibold text-primary-deep transition hover:border-primary hover:bg-primary-deep/5"
      >
        {t("registerLink")}
        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-text-muted">...</div>}>
      <LoginForm />
    </Suspense>
  );
}
