import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getGuide, guides } from "@/content/guides";
import { absoluteGuideUrl, buildGuideStructuredData } from "@/lib/guide-structured-data";
import { SITE_NAME } from "@/lib/site";
import { SITE_AUTHOR } from "@/lib/site-structured-data";

function toIsoDate(date: string) {
  return `${date}T00:00:00.000Z`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(toIsoDate(date)));
}

type GuidePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return {};
  }

  const pageUrl = absoluteGuideUrl(guide.slug);

  return {
    title: guide.metaTitle,
    description: guide.description,
    authors: [{ name: SITE_AUTHOR.name, url: SITE_AUTHOR.url }],
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.metaTitle} · UDID Tools`,
      description: guide.description,
      url: pageUrl,
      type: "article",
      publishedTime: toIsoDate(guide.publishedAt),
      modifiedTime: toIsoDate(guide.updatedAt ?? guide.publishedAt),
      authors: [SITE_AUTHOR.url],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${guide.title} — ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.metaTitle} · UDID Tools`,
      description: guide.description,
      images: ["/og-image.png"],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = (guide.relatedGuideSlugs ?? []).flatMap((relatedSlug) => {
    const relatedGuide = getGuide(relatedSlug);
    return relatedGuide ? [relatedGuide] : [];
  });
  const structuredData = buildGuideStructuredData(guide);

  return (
    <div className="min-h-screen bg-white font-sans">
      {structuredData.map((entry) => (
        <script
          key={entry["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <Header />

      <main className="bg-gradient-to-b from-slate-50/70 to-white">
        <article className="mx-auto max-w-4xl px-6 py-12 md:py-20">
          <Link
            href="/guides"
            className="mb-8 inline-flex text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            ← All guides
          </Link>

          <header className="border-b border-slate-200 pb-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-700">{guide.eyebrow}</span>
            </div>
            <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-slate-900 md:text-5xl">
              {guide.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">{guide.intro}</p>
            <p className="mt-5 text-sm text-slate-500">
              By{" "}
              <a
                href={SITE_AUTHOR.url}
                className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-blue-700"
              >
                {SITE_AUTHOR.name}
              </a>
              {" · "}Published {formatDate(guide.publishedAt)}
              {guide.updatedAt ? ` · Updated ${formatDate(guide.updatedAt)}` : ""}
            </p>
          </header>

          {guide.visual ? (
            <figure className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50 shadow-sm shadow-blue-100/50">
              <Image
                src={guide.visual.src}
                alt={guide.visual.alt}
                width={guide.visual.width}
                height={guide.visual.height}
                className="h-auto w-full"
              />
              <figcaption className="border-t border-blue-100 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
                {guide.visual.caption}
              </figcaption>
            </figure>
          ) : null}

          <div className="space-y-7 py-12">
            {guide.sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 md:p-8"
              >
                <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="max-w-3xl leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-6 space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4 md:p-5">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-3 leading-7 text-slate-700">
                        <CheckCircle2
                          className="mt-1 h-5 w-5 shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.table && (
                  <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <caption className="sr-only">{section.table.caption}</caption>
                      <thead className="bg-slate-50 text-slate-900">
                        <tr>
                          {section.table.headers.map((header) => (
                            <th key={header} scope="col" className="px-4 py-3 font-semibold">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {section.table.rows.map((row) => (
                          <tr key={row.join("|")} className="align-top">
                            {row.map((cell, index) => (
                              <td
                                key={`${index}-${cell}`}
                                className="px-4 py-3 leading-6 text-slate-600 first:font-medium first:text-slate-900"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <section className="rounded-2xl border border-slate-100 bg-slate-900 p-6 text-white shadow-sm shadow-slate-100 md:p-8">
              <p className="text-sm font-semibold tracking-wider text-blue-300 uppercase">
                Need the identifier?
              </p>
              <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Get your UDID in Safari</h2>
                  <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                    Open this page on the iPhone or iPad you want to identify and use the profile
                    flow to copy the result.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col">
                  <a
                    href="/api/register.signed.mobileconfig"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-slate-900 transition-all hover:bg-slate-50"
                  >
                    Get iPhone UDID
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link
                    href="/#how-it-works"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10"
                  >
                    See how it works
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 md:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Common questions
              </h2>
              <div className="mt-6 space-y-6">
                {guide.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {guide.sources && (
              <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 md:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sources</h2>
                <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
                  {guide.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900"
                      >
                        {source.title}
                      </a>{" "}
                      <span>— {source.publisher}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relatedGuides.length > 0 ? (
              <nav
                aria-labelledby="related-guides-heading"
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 md:p-8"
              >
                <h2
                  id="related-guides-heading"
                  className="text-2xl font-semibold tracking-tight text-slate-900"
                >
                  Related UDID guides
                </h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {relatedGuides.map((relatedGuide) => (
                    <li key={relatedGuide.slug}>
                      <Link
                        href={`/guides/${relatedGuide.slug}`}
                        className="group flex h-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 font-medium text-slate-800 transition-colors hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-800"
                      >
                        <span>{relatedGuide.title}</span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
