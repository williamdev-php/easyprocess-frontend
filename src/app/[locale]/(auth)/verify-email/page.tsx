"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function VerifyEmailContent() {
  const t = useTranslations("verifyEmail");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg(t("noToken"));
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Verification failed");
        }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : t("failed"));
      }
    }

    verify();
  }, [token, t]);

  if (status === "loading") {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border-theme border-t-primary" />
        <p className="text-text-muted">{t("verifying")}</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-deep/10 animate-success-pop">
          <svg className="h-8 w-8 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-primary-deep animate-fade-in">{t("successTitle")}</h1>
        <p className="mt-2 text-text-muted animate-fade-in">{t("successMessage")}</p>
        <Link href="/dashboard">
          <Button className="mt-6" size="lg">
            {t("goToDashboard")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 text-center animate-fade-in">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
        <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-primary-deep">{t("errorTitle")}</h1>
      <p className="mt-2 text-text-muted">{errorMsg || t("failed")}</p>
      <Link href="/dashboard">
        <Button className="mt-6" variant="outline" size="lg">
          {t("goToDashboard")}
        </Button>
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border-theme border-t-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
