import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDevelopment ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nonIndexableAssetPaths = [
  "/apple-touch-icon-precomposed.png",
  "/apple-touch-icon.png",
  "/desktop-qr.svg",
  "/e67fc0a36f388fc28107bace704aae67029e7c53858f74abbad717c694e31052.txt",
  "/favicon.ico",
  "/googleb9f15617438f045c.html",
  "/icon-16.png",
  "/icon-32.png",
  "/icon-192.png",
  "/icon-512.png",
  "/logo-header.svg",
  "/og-image.png",
  "/robots.txt",
  "/safari-pinned-tab.svg",
  "/site.webmanifest",
  "/sitemap.xml",
];

const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, noarchive, nosnippet" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/success",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        ],
      },
      {
        source: "/monitoring",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
        ],
      },
      ...nonIndexableAssetPaths.map((source) => ({ source, headers: noIndexHeaders })),
    ];
  },
};

export default withSentryConfig(nextConfig, {
  ...(process.env["SENTRY_ORG"] ? { org: process.env["SENTRY_ORG"] } : {}),
  ...(process.env["SENTRY_PROJECT"] ? { project: process.env["SENTRY_PROJECT"] } : {}),
  silent: !process.env["CI"],
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },
  },
});
