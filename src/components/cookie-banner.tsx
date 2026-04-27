"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { getCookieConsent, acceptAllCookies } from "@/lib/cookie-consent";
import CookiePreferencesDialog from "@/components/cookie-preferences-dialog";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const t = useTranslations("cookies");

  const handleAcceptAll = useCallback(() => {
    acceptAllCookies();
    setVisible(false);
  }, []);

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  // Keyboard dismiss: Escape key accepts all cookies and closes the banner
  useEffect(() => {
    if (!visible || showPreferences) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleAcceptAll();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, showPreferences, handleAcceptAll]);

  function handlePreferencesSaved() {
    setShowPreferences(false);
    setVisible(false);
  }

  if (!visible && !showPreferences) return null;

  return (
    <>
      {visible && !showPreferences && (
        <div
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
          role="dialog"
          aria-label={t("title")}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleAcceptAll();
          }}
        >
          <div className="rounded-2xl border border-border-theme bg-surface p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-primary-deep">
              {t("title")}
            </h3>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">
              {t("description")}
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreferences(true)}
                aria-label={t("managePreferences")}
              >
                {t("managePreferences")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                aria-label={t("acceptAll")}
              >
                {t("acceptAll")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferencesDialog
        open={showPreferences}
        onClose={handlePreferencesSaved}
      />
    </>
  );
}
