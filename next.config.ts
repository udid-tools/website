import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const NOINDEX_HEADER_VALUE = "noindex, nofollow, noarchive, nosnippet";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/$",
        destination: "/",
        permanent: true,
      },
      {
        source: "/&",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/success",
        headers: [{ key: "X-Robots-Tag", value: NOINDEX_HEADER_VALUE }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: NOINDEX_HEADER_VALUE }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/:all*.(js|css|png|svg|jpg|jpeg|webp|ico)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "my-projects-vy",
  project: process.env.SENTRY_PROJECT ?? "udid-tools",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
