export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = "cookie_consent_v2";

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookieConsent;
  } catch {
    return null;
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: consent }));
}

export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  const consent = getCookieConsent();
  return consent?.marketing === true;
}

export function acceptAllCookies(): void {
  setCookieConsent({
    essential: true,
    analytics: true,
    marketing: true,
    timestamp: new Date().toISOString(),
  });
}
