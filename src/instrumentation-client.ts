import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DSN,
  SENTRY_IGNORED_BROWSER_ERRORS,
  scrubBreadcrumb,
  scrubSentryEvent,
  traceSampleRate,
} from "@/lib/observability/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env["NEXT_PUBLIC_VERCEL_ENV"] ?? process.env.NODE_ENV,
  release: process.env["NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"],
  sendDefaultPii: false,
  ignoreErrors: SENTRY_IGNORED_BROWSER_ERRORS,
  tracesSampler: traceSampleRate,
  beforeBreadcrumb: scrubBreadcrumb,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
