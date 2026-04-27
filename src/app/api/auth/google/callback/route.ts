import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/** Name of the cookie that stores the OAuth CSRF state token. */
const OAUTH_STATE_COOKIE = "oauth_state";

/**
 * Google OAuth callback handler.
 * Google redirects here with ?code=...&state=... after user consent.
 * We validate the state parameter against the cookie we set before
 * redirecting to Google, then render a minimal HTML page that the
 * popup opener can read.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const error = request.nextUrl.searchParams.get("error") ?? "";
  const stateParam = request.nextUrl.searchParams.get("state") ?? "";

  // CSRF validation: compare the state param from Google with the value
  // we stored in an HttpOnly cookie before starting the OAuth flow.
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(OAUTH_STATE_COOKIE)?.value ?? "";

  const csrfValid = stateParam !== "" && stateCookie !== "" && stateParam === stateCookie;

  // Always clear the state cookie (single-use)
  const clearCookie = `${OAUTH_STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;

  if (!csrfValid && !error) {
    // State mismatch — possible CSRF attack. Do not pass the code through.
    const errorHtml = `<!DOCTYPE html>
<html>
<head><title>Google Login</title></head>
<body>
<p>Login failed: invalid state parameter.</p>
<script>
  if (!window.opener) {
    window.location.href = "/login";
  }
</script>
</body>
</html>`;

    return new NextResponse(errorHtml, {
      headers: {
        "Content-Type": "text/html",
        "Set-Cookie": clearCookie,
      },
    });
  }

  // Return a minimal HTML page. The parent window polls popup.location
  // and reads the code from the URL search params, then closes this popup.
  const html = `<!DOCTYPE html>
<html>
<head><title>Google Login</title></head>
<body>
<p>${error ? "Login cancelled." : "Logging in..."}</p>
<script>
  // If opened as popup, the parent reads the URL params directly.
  // If not a popup (e.g. user navigated directly), redirect to login.
  if (!window.opener) {
    window.location.href = "/login";
  }
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Set-Cookie": clearCookie,
    },
  });
}
