import * as Sentry from "@sentry/nextjs";
import {
  SENTRY_DSN,
  scrubBreadcrumb,
  scrubSentryEvent,
  traceSampleRate,
} from "@/lib/observability/sentry";

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env["VERCEL_ENV"] ?? process.env.NODE_ENV,
  release: process.env["VERCEL_GIT_COMMIT_SHA"],
  sendDefaultPii: false,
  tracesSampler: traceSampleRate,
  beforeBreadcrumb: scrubBreadcrumb,
  beforeSend: scrubSentryEvent,
  beforeSendTransaction: scrubSentryEvent,
});
