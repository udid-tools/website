import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <PageShell>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl flex-1 px-6 py-20">
        <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-4 text-slate-600">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center font-medium text-blue-700 underline underline-offset-4"
        >
          Return to UDID Tools home
        </Link>
      </main>
    </PageShell>
  );
}
