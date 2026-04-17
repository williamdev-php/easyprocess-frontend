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

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)" ],
};
