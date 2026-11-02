"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <head>
        <title>Page unavailable · UDID Tools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex min-h-screen items-center justify-center bg-white p-6 text-slate-900">
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-slate-600">The page could not be displayed. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
