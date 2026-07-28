import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "www.udid.tools";
const NOINDEX_HEADER_VALUE = "noindex, nofollow, noarchive, nosnippet";

function createContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (process.env.NODE_ENV === "development") return NextResponse.next();

  const needsHostFix = url.hostname !== CANONICAL_HOST;
  const needsHttps = url.protocol !== "https:";
  const hasSearchPlaceholder = url.searchParams.get("q") === "{search_term_string}";
  const hasMalformedPath = url.pathname === "/$" || url.pathname === "/&";

  if (needsHostFix || needsHttps || hasSearchPlaceholder || hasMalformedPath) {
    url.hostname = CANONICAL_HOST;
    url.protocol = "https";
    if (hasSearchPlaceholder || hasMalformedPath) {
      url.pathname = "/";
      url.search = "";
    }
    return NextResponse.redirect(url, 301);
  }

  const nonce = crypto.randomUUID();
  const contentSecurityPolicy = createContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  if (
    url.pathname === "/success" ||
    url.pathname.startsWith("/success/") ||
    url.pathname.startsWith("/api/")
  ) {
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER_VALUE);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/|monitoring|favicon.ico|robots.txt|sitemap.xml|sitemap-\\d+\\.xml).*)"],
};
