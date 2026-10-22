import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { PublicTelemetry } from "@/components/PublicTelemetry";
import { SITE_HOME_URL, SITE_NAME } from "@/lib/site";
import { SITE_STRUCTURED_DATA } from "@/lib/site-structured-data";
import "./globals.css";

const isPreviewDeployment = process.env["VERCEL_ENV"] === "preview";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_HOME_URL),
  manifest: "/site.webmanifest",
  title: {
    default: "Get iPhone UDID Online - No iTunes or Xcode",
    template: "%s · UDID Tools",
  },
  description:
    "Get your iPhone or iPad UDID online in Safari. No iTunes, Xcode, Apple ID, cable, or app install required.",
  keywords: [
    "UDID",
    "iPhone UDID",
    "iPad UDID",
    "get UDID online",
    "get iPhone UDID online",
    "find iPhone UDID without iTunes",
    "extract UDID",
    "UDID finder",
    "iOS UDID",
    "Apple device identifier",
  ],
  alternates: { canonical: SITE_HOME_URL },
  openGraph: {
    type: "website",
    url: SITE_HOME_URL,
    siteName: SITE_NAME,
    title: "Get iPhone UDID Online - No iTunes or Xcode",
    description:
      "Find your iPhone or iPad UDID in Safari with a temporary configuration profile. No iTunes, Xcode, Apple ID, or cable required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UDID Tools — get your iPhone or iPad UDID in Safari",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@alextartmin",
    creator: "@alextartmin",
    title: "Get iPhone UDID Online - No iTunes or Xcode",
    description: "Find your iPhone or iPad UDID online in Safari with UDID Tools.",
    images: ["/og-image.png"],
  },
  robots: {
    index: !isPreviewDeployment,
    follow: !isPreviewDeployment,
    noarchive: isPreviewDeployment,
    nosnippet: isPreviewDeployment,
    googleBot: {
      index: !isPreviewDeployment,
      follow: !isPreviewDeployment,
      noimageindex: isPreviewDeployment,
      ...(isPreviewDeployment
        ? {}
        : {
            "max-image-preview": "large" as const,
            "max-snippet": -1,
            "max-video-preview": -1,
          }),
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#006fff" }],
  },
  category: "utilities",
  applicationName: SITE_NAME,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <head>
        {SITE_STRUCTURED_DATA.map((entry) => (
          <script
            key={entry["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
            }}
          />
        ))}
      </head>
      <body>
        {children}
        <PublicTelemetry />
      </body>
    </html>
  );
}
