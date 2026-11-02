import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md sm:sticky">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row">
          <Logo />
          <nav
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-x-8"
            aria-label="Main navigation"
          >
            <Link
              href="/#how-it-works"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              How it works
            </Link>
            <Link
              href="/#features"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              Features
            </Link>
            <Link
              href="/guides"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-slate-600 transition-colors hover:text-slate-900"
            >
              Guides
            </Link>
            <a
              href="/api/register.signed.mobileconfig"
              className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Get UDID
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
