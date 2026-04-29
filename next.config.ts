import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const viewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL || "http://localhost:3001";
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const wsUrl = apiUrl.replace(/^https:/, "wss:").replace(/^http:/, "ws:");

// Pre-compute CSP header value at build/startup time (not per-request)
const viewerHost = (() => {
  try {
    const u = new URL(viewerUrl);
    const host = u.hostname.replace(/^www\./, "");
    return `${u.protocol}//*.${host}`;
  } catch {
    return "";
  }
})();

const cspValue = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' https: data:",
  "font-src 'self' https://fonts.gstatic.com https: data:",
  "media-src 'self' https://d8j0ntlcm91z4.cloudfront.net https://*.supabase.co",
  [
    "connect-src 'self' https://api.stripe.com https://fonts.googleapis.com",
    apiUrl,
    wsUrl,
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
    "https://d8j0ntlcm91z4.cloudfront.net https://*.supabase.co",
  ]
    .filter(Boolean)
    .join(" "),
  [
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    viewerUrl,
    "https://qvickosite.com https://*.qvickosite.com",
    viewerHost,
  ]
    .filter(Boolean)
    .join(" "),
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  env: {
    NEXT_PUBLIC_VIEWER_URL: viewerUrl,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
