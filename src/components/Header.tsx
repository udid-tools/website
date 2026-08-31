import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 sm:flex" aria-label="Main navigation">
          <Link
            href="/#how-it-works"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            How it works
          </Link>
          <Link
            href="/#features"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Features
          </Link>
          <Link
            href="/guides"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Guides
          </Link>
          <a
            href="/api/register.signed.mobileconfig"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Get UDID
          </a>
        </nav>
      </div>
    </header>
  );
}
