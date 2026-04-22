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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<
    "idle" | "loading" | "sent" | "limited"
  >("idle");

  const FORGOT_PASSWORD_STORAGE_KEY = "lastPasswordResetRequest";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setShowForgotPassword(false);
    setForgotPasswordStatus("idle");
    setLoading(true);
    try {
      await login({ email, password });
      router.push(redirect as "/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("loginFailed");
      if (message === "Invalid email or password") {
        setError(t("invalidCredentials"));
        setShowForgotPassword(true);
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
    try {
      await forgotPassword(email);
      localStorage.setItem(FORGOT_PASSWORD_STORAGE_KEY, Date.now().toString());
      setForgotPasswordStatus("sent");
    } catch {
      setForgotPasswordStatus("sent");
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

      {error && <Alert className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
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
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {showForgotPassword && (
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
              <p className="text-sm text-text-muted">...</p>
            )}
            {forgotPasswordStatus === "sent" && (
              <p className="text-sm text-green-600">{t("forgotPasswordSent")}</p>
            )}
            {forgotPasswordStatus === "limited" && (
              <p className="text-sm text-amber-600">{t("forgotPasswordLimit")}</p>
            )}
          </div>
        )}

        <Button type="submit" disabled={loading} fullWidth size="lg">
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

      {/* Social login divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-theme" />
        <span className="text-xs font-medium text-text-muted">{t("orContinueWith")}</span>
        <div className="h-px flex-1 bg-border-theme" />
      </div>

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
