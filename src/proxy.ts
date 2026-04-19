import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const protectedPatterns = ["/dashboard", "/dashboard/domain", "/dashboard/pages", "/dashboard/account", "/dashboard/leads", "/dashboard/revenue", "/dashboard/settings"];

function isProtectedPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(sv|en)/, "") || "/";
  return protectedPatterns.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`)
  );
}

// Map country codes to supported locales
const countryToLocale: Record<string, string> = {
  SE: "sv", // Sweden
  // All other countries fall back to English
};

function getCountryFromRequest(request: NextRequest): string | undefined {
  // Vercel
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  if (vercelCountry) return vercelCountry;

  // Cloudflare
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry) return cfCountry;

  // AWS CloudFront
  const awsCountry = request.headers.get("cloudfront-viewer-country");
  if (awsCountry) return awsCountry;

  return undefined;
}

function getGeoLocale(request: NextRequest): string {
  const country = getCountryFromRequest(request);
  if (country) {
    return countryToLocale[country.toUpperCase()] || "en";
  }
  return "en";
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check auth for protected paths before intl redirect
  if (isProtectedPath(pathname)) {
    const authFlag = request.cookies.get("auth_flag")?.value;
    if (!authFlag) {
      const locale = pathname.match(/^\/(sv|en)/)?.[1] || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Geo-based locale detection: if no explicit locale in URL and no NEXT_LOCALE cookie,
  // set the cookie based on geo so next-intl uses the right locale
  const hasLocaleInPath = /^\/(sv|en)(\/|$)/.test(pathname);
  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");

  if (!hasLocaleInPath && !hasLocaleCookie) {
    const geoLocale = getGeoLocale(request);
    const response = intlMiddleware(request);
    response.cookies.set("NEXT_LOCALE", geoLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)" ],
};
