import Link from "next/link";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { DesktopQrCode } from "@/components/home/DesktopQrCode";
import { Motion } from "@/components/Motion";
import { SAMPLE_RESULT_URL } from "@/lib/site";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.03),transparent_50%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:py-32 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="mx-auto max-w-3xl min-w-0 text-center xl:mx-0 xl:text-left">
          <Motion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-700">Open-source UDID finder</span>
            </div>
          </Motion>
          <Motion
            as="h1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl leading-[1.1] font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
          >
            Get your iPhone UDID online
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              without iTunes or Xcode
            </span>
          </Motion>
          <Motion
            as="p"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            Find your iPhone or iPad UDID directly in Safari with a temporary configuration profile.
            No Mac, PC, USB cable, Apple ID, or app install required.
          </Motion>
          <Motion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap xl:justify-start"
          >
            <a
              href="/api/register.signed.mobileconfig"
              className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-medium text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/15"
            >
              Get iPhone UDID{" "}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 font-medium text-slate-700 transition-colors hover:text-slate-900"
            >
              <Zap className="h-4 w-4" aria-hidden="true" /> See how it works
            </Link>
            <Link
              href={SAMPLE_RESULT_URL}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              View sample result
            </Link>
          </Motion>
          <Motion
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500 xl:justify-start"
          >
            {["No Apple ID required", "Safari on iPhone/iPad", "iOS 12+"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </Motion>
        </div>
        <DesktopQrCode />
      </div>
    </section>
  );
}
