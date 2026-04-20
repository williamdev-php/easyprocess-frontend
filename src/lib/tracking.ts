import { hasAnalyticsConsent } from "@/lib/cookie-consent";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VISITOR_ID_KEY = "qv_visitor_id";
const SESSION_ID_KEY = "qv_session_id";
const UTM_KEY = "qv_utm_params";
const BUFFER_MAX = 10;
const FLUSH_INTERVAL_MS = 5_000;

interface TrackingPayload {
  visitor_id: string;
  session_id: string;
  event_type: string;
  page_path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface UtmParams {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _userId: string | null = null;
let _buffer: TrackingPayload[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
let _initialized = false;

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = uuid();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// ---------------------------------------------------------------------------
// UTM helpers
// ---------------------------------------------------------------------------

function captureUtmParams(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const hasUtm = utmKeys.some((k) => params.has(k));

  if (hasUtm) {
    const utm: Record<string, string | null> = {};
    for (const k of utmKeys) {
      utm[k] = params.get(k) || null;
    }
    sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

function getUtmParams(): UtmParams {
  const defaults: UtmParams = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
  };
  try {
    const raw = sessionStorage.getItem(UTM_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

// ---------------------------------------------------------------------------
// Send helpers
// ---------------------------------------------------------------------------

function getTrackUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${base}/api/track`;
}

function sendPayload(url: string, data: unknown): void {
  const body = JSON.stringify(data);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const sent = navigator.sendBeacon(url, blob);
    if (sent) return;
  }

  // Fallback
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Silent fail — tracking should never break the app
  });
}

// ---------------------------------------------------------------------------
// Buffer & flush
// ---------------------------------------------------------------------------

function startFlushTimer(): void {
  if (_flushTimer) return;
  _flushTimer = setInterval(() => {
    if (_buffer.length > 0) flushEvents();
  }, FLUSH_INTERVAL_MS);
}

export function flushEvents(): void {
  if (_buffer.length === 0) return;
  const events = [..._buffer];
  _buffer = [];

  if (events.length === 1) {
    sendPayload(getTrackUrl(), events[0]);
  } else {
    sendPayload(`${getTrackUrl()}/batch`, { events });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initTracking(): void {
  if (_initialized || typeof window === "undefined") return;
  _initialized = true;
  captureUtmParams();
  startFlushTimer();
}

export function trackEvent(
  eventType: string,
  metadata?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const utm = getUtmParams();

  const payload: TrackingPayload = {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    event_type: eventType,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_content: utm.utm_content,
    utm_term: utm.utm_term,
    user_id: _userId,
    metadata: metadata ?? null,
  };

  _buffer.push(payload);
  if (_buffer.length >= BUFFER_MAX) {
    flushEvents();
  }
}

export function trackPageView(): void {
  trackEvent("page_view");
}

export function identifyUser(userId: string): void {
  _userId = userId;

  // Link past anonymous events to this user
  if (typeof window === "undefined") return;
  const visitorId = getVisitorId();
  sendPayload(`${getTrackUrl()}/identify`, {
    visitor_id: visitorId,
    user_id: userId,
  });
}
