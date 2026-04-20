"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  initTracking,
  trackPageView,
  flushEvents,
  onConsentGranted,
  trackSessionEnd,
} from "@/lib/tracking";
import { hasAnalyticsConsent } from "@/lib/cookie-consent";

export default function TrackingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);
  const consentAtMount = useRef(false);

  useEffect(() => {
    initTracking();
    consentAtMount.current = hasAnalyticsConsent();

    const handleUnload = () => trackSessionEnd();
    window.addEventListener("beforeunload", handleUnload);

    // Listen for cookie consent changes — re-fire page_view when granted
    const handleConsent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.analytics && !consentAtMount.current) {
        consentAtMount.current = true;
        onConsentGranted();
      }
    };
    window.addEventListener("cookie-consent-change", handleConsent);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("cookie-consent-change", handleConsent);
    };
  }, []);

  useEffect(() => {
    // Track page view on pathname change (skip duplicate on mount)
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      trackPageView();
    }
  }, [pathname]);

  return <>{children}</>;
}
