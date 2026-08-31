import { track } from "@vercel/analytics/server";
import * as Sentry from "@sentry/nextjs";
import { PayloadTooLargeError, readBody } from "@/lib/http";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2048;
const EVENTS = new Set(["result_page_viewed", "result_page_action"]);
const SOURCES = new Set(["sample", "profile"]);
const ACTIONS = new Set(["copy_all", "copy_field", "download", "share"]);
const FORMATS = new Set(["txt", "json"]);
const OUTCOMES = new Set([
  "success",
  "failure",
  "missing_device_info",
  "copied_fallback",
  "unavailable",
  "dismissed",
]);
const FIELD_TYPES = new Set(["udid", "model", "version", "serial", "product", "imei"]);
const FIELD_LABELS = new Set([
  "UDID",
  "Device Model",
  "OS Version",
  "Serial Number",
  "Product Type",
  "IMEI",
  "MEID",
]);

type Payload = Record<string, unknown>;

function allowedString(value: unknown, values: ReadonlySet<string>) {
  return typeof value === "string" && values.has(value) ? value : undefined;
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    const input = await readBody(request, MAX_BODY_BYTES);
    const parsed: unknown = JSON.parse(new TextDecoder().decode(input));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }
    payload = parsed as Payload;
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = allowedString(payload["event_name"], EVENTS);
  const resultSource = allowedString(payload["result_source"], SOURCES);
  if (!eventName || !resultSource)
    return Response.json({ error: "Invalid event" }, { status: 400 });

  try {
    await track(eventName, {
      action: allowedString(payload["action"], ACTIONS),
      field_count:
        typeof payload["field_count"] === "number" &&
        Number.isInteger(payload["field_count"]) &&
        payload["field_count"] >= 0 &&
        payload["field_count"] <= 6
          ? payload["field_count"]
          : undefined,
      field_label: allowedString(payload["field_label"], FIELD_LABELS),
      field_type: allowedString(payload["field_type"], FIELD_TYPES),
      format: allowedString(payload["format"], FORMATS),
      has_device_info:
        typeof payload["has_device_info"] === "boolean" ? payload["has_device_info"] : undefined,
      outcome: allowedString(payload["outcome"], OUTCOMES),
      result_source: resultSource,
      share_available:
        typeof payload["share_available"] === "boolean" ? payload["share_available"] : undefined,
    });
  } catch (error) {
    Sentry.captureException(error, { tags: { stage: "result_analytics" } });
  }

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
