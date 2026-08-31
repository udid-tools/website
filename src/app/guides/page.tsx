import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { guides } from "@/content/guides";

export const metadata: Metadata = {
  title: "iPhone UDID Guides",
  description:
    "Guides for finding your iPhone or iPad UDID online, using it for app testing, and understanding Apple device identifiers.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "iPhone UDID Guides · UDID Tools",
    description:
      "Guides for finding your iPhone or iPad UDID online, using it for app testing, and understanding Apple device identifiers.",
    url: "/guides",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UDID Tools — get your iPhone or iPad UDID in Safari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhone UDID Guides · UDID Tools",
    description:
      "Guides for finding your iPhone or iPad UDID online, using it for app testing, and understanding Apple device identifiers.",
    images: ["/og-image.png"],
  },
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <main className="bg-gradient-to-b from-slate-50/70 to-white py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-700">UDID Guides</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Learn how to find and use your iPhone UDID
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-slate-600">
              Practical answers for iPhone and iPad owners who need a UDID for app testing,
              provisioning, device registration, or troubleshooting.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/40"
              >
                <p className="mb-3 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                  {guide.eyebrow}
                </p>
                <h2 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                  {guide.title}
                </h2>
                <p className="mt-3 leading-relaxed text-slate-600">{guide.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  Read guide
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
