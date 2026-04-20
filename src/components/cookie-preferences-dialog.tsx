"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { setCookieConsent, getCookieConsent } from "@/lib/cookie-consent";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CookiePreferencesDialog({ open, onClose }: Props) {
  const t = useTranslations("cookies");
  const existing = getCookieConsent();

  const [analytics, setAnalytics] = useState(existing?.analytics ?? false);
  const [marketing, setMarketing] = useState(existing?.marketing ?? false);

  function save() {
    setCookieConsent({
      essential: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl border border-border-theme bg-surface p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-primary-deep">
          {t("preferencesTitle")}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          {t("preferencesDescription")}
        </p>

        <div className="mt-5 space-y-4">
          {/* Essential — always on */}
          <div className="flex items-center justify-between rounded-lg border border-border-theme bg-background-subtle p-3">
            <div>
              <p className="text-sm font-medium text-primary-deep">
                {t("essential")}
              </p>
              <p className="text-xs text-text-muted">
                {t("essentialDescription")}
              </p>
            </div>
            <div className="relative h-6 w-10 shrink-0 rounded-full bg-primary opacity-70 cursor-not-allowed">
              <span className="absolute inset-y-0.5 right-0.5 w-5 rounded-full bg-white shadow" />
            </div>
          </div>

          {/* Analytics */}
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border-theme p-3 hover:bg-background-subtle"
            onClick={() => setAnalytics(!analytics)}
          >
            <div>
              <p className="text-sm font-medium text-primary-deep">
                {t("analytics")}
              </p>
              <p className="text-xs text-text-muted">
                {t("analyticsDescription")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              onClick={(e) => { e.stopPropagation(); setAnalytics(!analytics); }}
              className={`relative h-6 w-10 shrink-0 rounded-full duration-150 ${
                analytics ? "bg-primary" : "bg-border-theme"
              }`}
            >
              <span
                className={`absolute inset-y-0.5 left-0.5 w-5 rounded-full bg-white shadow duration-150 ${
                  analytics ? "translate-x-[calc(100%-2px)]" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Marketing */}
          <div
            className="flex cursor-pointer items-center justify-between rounded-lg border border-border-theme p-3 hover:bg-background-subtle"
            onClick={() => setMarketing(!marketing)}
          >
            <div>
              <p className="text-sm font-medium text-primary-deep">
                {t("marketing")}
              </p>
              <p className="text-xs text-text-muted">
                {t("marketingDescription")}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={marketing}
              onClick={(e) => { e.stopPropagation(); setMarketing(!marketing); }}
              className={`relative h-6 w-10 shrink-0 rounded-full duration-150 ${
                marketing ? "bg-primary" : "bg-border-theme"
              }`}
            >
              <span
                className={`absolute inset-y-0.5 left-0.5 w-5 rounded-full bg-white shadow duration-150 ${
                  marketing ? "translate-x-[calc(100%-2px)]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={save}>
            {t("savePreferences")}
          </Button>
        </div>
      </div>
    </div>
  );
}
