import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Motion } from "@/components/Motion";
import { guides } from "@/content/guides";

export function GuidesSection() {
  return (
    <section id="guides" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Motion
              as="p"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-3 text-sm font-semibold tracking-wider text-blue-600 uppercase"
            >
              Answers for real searches
            </Motion>
            <Motion
              as="h2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-slate-900 md:text-4xl"
            >
              Helpful UDID guides
            </Motion>
            <Motion
              as="p"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-slate-600"
            >
              Short explanations for finding your iPhone UDID, sharing it safely, and using it for
              app testing.
            </Motion>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 font-medium text-slate-700 transition-colors hover:text-slate-900"
          >
            View all guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          {guides.slice(0, 4).map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex min-h-[220px] flex-col rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-blue-100/40"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white">
                <BookOpen className="h-4 w-4 text-slate-600" aria-hidden="true" />
              </div>
              <p className="mb-2 text-xs font-semibold tracking-wider text-blue-600 uppercase">
                {guide.eyebrow}
              </p>
              <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                {guide.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{guide.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
