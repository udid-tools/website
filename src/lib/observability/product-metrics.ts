import "server-only";

import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";

type MetricAttributes = Record<string, boolean | number | string>;
type ProductMetricName =
  | "udid_tools.profile.requests"
  | "udid_tools.profile.responses"
  | "udid_tools.result.views"
  | "udid_tools.result.actions";

const RESULT_SOURCES = new Set(["sample", "profile"]);
const STRING_ATTRIBUTES: Record<string, ReadonlySet<string>> = {
  action: new Set(["copy_all", "copy_field", "download", "share"]),
  field_label: new Set([
    "UDID",
    "Device Model",
    "OS Version",
    "Serial Number",
    "Product Type",
    "IMEI",
    "MEID",
  ]),
  field_type: new Set(["udid", "model", "version", "serial", "product", "imei"]),
  format: new Set(["txt", "json"]),
  outcome: new Set([
    "success",
    "failure",
    "missing_device_info",
    "copied_fallback",
    "unavailable",
    "dismissed",
  ]),
};

function resultAttributes(attributes: Record<string, unknown>): MetricAttributes | undefined {
  const source = attributes["result_source"];
  if (typeof source !== "string" || !RESULT_SOURCES.has(source)) return;

  const safeAttributes: MetricAttributes = { result_source: source };
  for (const [key, values] of Object.entries(STRING_ATTRIBUTES)) {
    const value = attributes[key];
    if (typeof value === "string" && values.has(value)) safeAttributes[key] = value;
  }
  for (const key of ["has_device_info", "share_available"]) {
    const value = attributes[key];
    if (typeof value === "boolean") safeAttributes[key] = value;
  }
  const fieldCount = attributes["field_count"];
  if (
    typeof fieldCount === "number" &&
    Number.isInteger(fieldCount) &&
    fieldCount >= 0 &&
    fieldCount <= 6
  )
    safeAttributes["field_count"] = fieldCount;
  return safeAttributes;
}

export function scrubProductMetric(metric: Sentry.Metric): Sentry.Metric | null {
  if (!metric.name.startsWith("udid_tools.")) return metric;
  try {
    const attributes = metric.attributes ?? {};
    const safeAttributes: MetricAttributes = {};
    if (metric.name === "udid_tools.profile.requests") {
      const outcome = attributes["outcome"];
      const method = attributes["http_method"];
      if (outcome === "success" || outcome === "error") safeAttributes["outcome"] = outcome;
      if (method === "GET" || method === "HEAD") safeAttributes["http_method"] = method;
    } else if (metric.name === "udid_tools.profile.responses") {
      const outcome = attributes["outcome"];
      const status = attributes["http_status"];
      if (outcome === "accepted" || outcome === "rejected" || outcome === "error")
        safeAttributes["outcome"] = outcome;
      if (status === 301 || status === 400 || status === 413 || status === 500)
        safeAttributes["http_status"] = status;
    } else if (
      metric.name === "udid_tools.result.views" ||
      metric.name === "udid_tools.result.actions"
    ) {
      Object.assign(safeAttributes, resultAttributes(attributes));
    } else {
      return null;
    }

    for (const key of [
      "sentry.environment",
      "sentry.release",
      "sentry.sdk.name",
      "sentry.sdk.version",
    ]) {
      const value = attributes[key];
      if (typeof value === "string") safeAttributes[key] = value;
    }
    return { ...metric, attributes: safeAttributes };
  } catch {
    return null;
  }
}

function countMetric(name: ProductMetricName, attributes: MetricAttributes) {
  try {
    const client = Sentry.getClient();
    if (!client) return;
    const parentIsolation = Sentry.getIsolationScope();

    Sentry.withIsolationScope((isolation) => {
      // The Node SDK forks this scope. Its fallback strategy can reuse it, so
      // never clear the caller's scope when the SDK is not fully initialized.
      if (isolation !== parentIsolation) isolation.clear();

      const metricScope = new Sentry.Scope();
      metricScope.setClient(client);
      metricScope.setUser(null);

      // Metrics merge global/isolation attributes after beforeSendMetric.
      // Undefined overrides omit inherited keys without changing either scope.
      for (const scope of [Sentry.getGlobalScope(), isolation]) {
        for (const key of Object.keys(scope.getScopeData().attributes ?? {})) {
          metricScope.setAttribute(key, undefined);
        }
      }

      Sentry.withActiveSpan(null, () => {
        Sentry.metrics.count(name, 1, { unit: "none", attributes, scope: metricScope });
      });
    });

    // Keep Node serverless work alive until buffered metrics have been sent.
    after(async () => {
      try {
        await Sentry.flush(2000);
      } catch {
        // Background monitoring failures must stay out of the response and logs.
      }
    });
  } catch {
    // Monitoring must never interrupt profile retrieval or result actions.
  }
}

export function recordProfileRequest(outcome: "success" | "error", method: "GET" | "HEAD") {
  if ((outcome !== "success" && outcome !== "error") || (method !== "GET" && method !== "HEAD"))
    return;
  countMetric("udid_tools.profile.requests", { outcome, http_method: method });
}

export function recordProfileResponse(
  outcome: "accepted" | "rejected" | "error",
  status: 301 | 400 | 413 | 500
) {
  if (
    (outcome !== "accepted" && outcome !== "rejected" && outcome !== "error") ||
    ![301, 400, 413, 500].includes(status)
  )
    return;
  countMetric("udid_tools.profile.responses", { outcome, http_status: status });
}

export function recordResultEvent(
  eventName: "result_page_viewed" | "result_page_action",
  attributes: Record<string, unknown>
) {
  try {
    if (eventName !== "result_page_viewed" && eventName !== "result_page_action") return;
    const safeAttributes = resultAttributes(attributes);
    if (!safeAttributes) return;

    countMetric(
      eventName === "result_page_viewed" ? "udid_tools.result.views" : "udid_tools.result.actions",
      safeAttributes
    );
  } catch {
    // Treat malformed analytics attributes and SDK failures as best effort.
  }
}
