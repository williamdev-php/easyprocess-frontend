import { NextRequest, NextResponse } from "next/server";

/**
 * Google OAuth callback handler.
 * Google redirects here with ?code=... after user consent.
 * We render a minimal HTML page that the popup opener can read.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "";
  const error = request.nextUrl.searchParams.get("error") ?? "";

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
    headers: { "Content-Type": "text/html" },
  });
}
