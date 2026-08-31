import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalPageProps = {
  label: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

function textWithLinks(text: string): ReactNode[] {
  return text
    .split(/(https?:\/\/[^\s.]+(?:\.[^\s.]+)*|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)
    .map((part, index) => {
      if (/^https?:\/\//i.test(part)) {
        return (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-700 hover:decoration-blue-400"
          >
            {part}
          </a>
        );
      }
      if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(part)) {
        return (
          <a
            key={`${part}-${index}`}
            href={`mailto:${part}`}
            className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-700 hover:decoration-blue-400"
          >
            {part}
          </a>
        );
      }
      return part;
    });
}

export function LegalPage({ label, title, description, lastUpdated, sections }: LegalPageProps) {
  return (
    <PageShell>
      <main className="flex-1 bg-gradient-to-b from-slate-50/70 to-white py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/"
            className="mb-8 inline-flex text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            ← Back to Home
          </Link>
          <div className="mb-10 border-b border-slate-200 pb-8">
            <p className="mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase">
              {label}
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              {title}
            </h1>
            <p className="mb-4 text-lg leading-relaxed text-slate-600">{description}</p>
            <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </div>
          <div className="space-y-10">
            {sections.map((section) => (
              <section className="mt-10" key={section.title}>
                <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="leading-7 text-slate-600">
                      {textWithLinks(paragraph)}
                    </p>
                  ))}
                </div>
                {section.items && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-600 marker:text-blue-500">
                    {section.items.map((item) => (
                      <li key={item} className="pl-1 leading-7">
                        {textWithLinks(item)}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </div>
      </main>
    </PageShell>
  );
}
