const SENSITIVE_KEY =
  /^(authorization|cookie|set-cookie|body|request_body|response_body|query_string|result|result_token|token|challenge|udid|imei|meid|serial|passphrase|pkcs12)$/i;
const URL_KEY = /^(url|referrer|href|from|to)$/i;

type SentryEvent = {
  breadcrumbs?: Array<{ data?: Record<string, unknown> }>;
  contexts?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  request?: {
    cookies?: unknown;
    data?: unknown;
    headers?: Record<string, string>;
    query_string?: unknown;
    url?: string;
  };
  tags?: Record<string, unknown>;
  transaction?: string;
};

export const SENTRY_DSN = process.env["NEXT_PUBLIC_SENTRY_DSN"] ?? process.env["SENTRY_DSN"];

export function stripUrlDetails(value: string) {
  try {
    const url = new URL(value, "https://www.udid.tools");
    return value.startsWith("http") ? `${url.origin}${url.pathname}` : url.pathname;
  } catch {
    return value.split(/[?#]/u, 1)[0] ?? "";
  }
}

function scrubValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) return "[Filtered]";
  if (typeof value === "string" && URL_KEY.test(key)) return stripUrlDetails(value);
  if (Array.isArray(value)) return value.map((item) => scrubValue(key, item));
  if (value && typeof value === "object") return scrubRecord(value as Record<string, unknown>);
  return value;
}

function scrubRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, scrubValue(key, value)])
  );
}

export function scrubSentryEvent<T extends SentryEvent>(event: T): T {
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    delete event.request.query_string;
    const requestUrl = event.request.url;
    if (requestUrl) event.request.url = stripUrlDetails(requestUrl);
    if (event.request.headers)
      event.request.headers = scrubRecord(event.request.headers) as Record<string, string>;
  }
  const transaction = event.transaction;
  if (transaction) event.transaction = stripUrlDetails(transaction);
  if (event.tags) event.tags = scrubRecord(event.tags);
  if (event.extra) event.extra = scrubRecord(event.extra);
  if (event.contexts) event.contexts = scrubRecord(event.contexts);
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((breadcrumb) =>
      breadcrumb.data ? { ...breadcrumb, data: scrubRecord(breadcrumb.data) } : { ...breadcrumb }
    );
  }
  return event;
}

export function scrubBreadcrumb<T extends { data?: Record<string, unknown> }>(breadcrumb: T): T {
  if (breadcrumb.data) breadcrumb.data = scrubRecord(breadcrumb.data);
  return breadcrumb;
}

export function traceSampleRate({
  inheritOrSampleWith,
  location,
  name,
  normalizedRequest,
}: {
  inheritOrSampleWith: (rate: number) => number;
  location?: { pathname?: string };
  name: string;
  normalizedRequest?: { url?: string };
}) {
  const path = location?.pathname ?? normalizedRequest?.url ?? name;
  if (path.includes("/success")) return 0;
  if (path.includes("/api/retrieve") || path.includes("/api/register.signed.mobileconfig"))
    return inheritOrSampleWith(1);
  return inheritOrSampleWith(process.env.NODE_ENV === "production" ? 0.25 : 1);
}
