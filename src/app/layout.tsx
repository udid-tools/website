import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import VercelAnalytics from "@/app/components/VercelAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.udid.tools";
const SITE_NAME = "UDID Tools";
const TWITTER = "@alextartmin";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Get iPhone UDID Online - No iTunes or Xcode",
    description:
      "Find your iPhone or iPad UDID in Safari with a temporary configuration profile. No iTunes, Xcode, Apple ID, or cable required.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "UDID Tools Preview" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER,
    creator: TWITTER,
    title: "Get iPhone UDID Online - No iTunes or Xcode",
    description: "Find your iPhone or iPad UDID online in Safari with UDID Tools.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "UDID Tools helps you find your iPhone and iPad UDID online in Safari.",
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "iOS, iPadOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Person",
    name: "Alexander Tartmin",
    url: "https://www.linkedin.com/in/alexandertartmin",
  },
  description:
    "A free open-source utility for retrieving an iPhone or iPad UDID through Safari using an iOS configuration profile flow.",
};

function safeJsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/[<>&]/g, (character) => {
    switch (character) {
      case "<":
        return "\\u003c";
      case ">":
        return "\\u003e";
      case "&":
        return "\\u0026";
      default:
        return character;
    }
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        {/* JSON-LD: WebSite */}
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: safeJsonForHtml(websiteJsonLd) }}
        />
        {/* JSON-LD: WebApplication */}
        <Script
          id="ld-web-application"
          type="application/ld+json"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: safeJsonForHtml(webApplicationJsonLd) }}
        />
        <VercelAnalytics />
      </body>
    </html>
  );
}
