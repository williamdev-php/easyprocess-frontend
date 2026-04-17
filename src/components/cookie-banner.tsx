"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

const COOKIE_CONSENT_KEY = "cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookies");

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-theme bg-surface p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary-deep">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {t("description")}
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="ghost" size="sm" onClick={decline}>
              {t("decline")}
            </Button>
            <Button variant="primary" size="sm" onClick={accept}>
              {t("accept")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
