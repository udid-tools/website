import Link from "next/link";
import { siGithub } from "simple-icons";
import { Logo } from "@/components/Logo";

function GithubIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-700"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={siGithub.path} />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-100 bg-slate-50/50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <p className="text-sm text-slate-600">
            Open-source • No account required • Built for developers
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/udid-tools/website"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200"
              aria-label="UDID Tools website on GitHub"
            >
              <GithubIcon />
            </a>
            <a
              href="https://www.linkedin.com/in/alexandertartmin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-colors hover:bg-slate-200"
              aria-label="Alexander Tartmin on LinkedIn"
            >
              <span className="text-sm font-bold text-slate-700" aria-hidden="true">
                in
              </span>
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} UDID Tools. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link
              href="/guides"
              className="text-xs text-slate-600 transition-colors hover:text-slate-900"
            >
              Guides
            </Link>
            <Link
              href="/privacy-policy"
              className="text-xs text-slate-600 transition-colors hover:text-slate-900"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-600 transition-colors hover:text-slate-900"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
