import { ArrowRight, Smartphone } from "lucide-react";
import { Motion } from "@/components/Motion";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Motion
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600"
        >
          <Smartphone className="h-8 w-8 text-white" aria-hidden="true" />
        </Motion>
        <Motion
          as="h2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mb-4 text-3xl font-bold text-white md:text-4xl"
        >
          Ready to get your UDID?
        </Motion>
        <Motion
          as="p"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-10 max-w-xl text-lg text-slate-300"
        >
          Open this page in Safari on the iPhone or iPad you want to identify and tap the button
          below.
        </Motion>
        <Motion
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a
            href="/api/register.signed.mobileconfig"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-slate-900 shadow-xl transition-all hover:bg-slate-50"
          >
            Get iPhone UDID Now{" "}
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </Motion>
        <Motion
          as="p"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-sm text-slate-400"
        >
          Free forever • No sign-up required • Open-source project
        </Motion>
      </div>
    </section>
  );
}
