import * as Sentry from "@sentry/nextjs";
import { UdidToolsError } from "@udid-tools/core";
import { NextResponse } from "next/server";
import { PROFILE_RESULT_SOURCE, SAMPLE_RESULT_QUERY_PARAM } from "@/app/success/sampleDeviceData";
import { recordApiResult } from "@/lib/observability/server";
import { parseSignedDeviceResponse } from "@/lib/profileService";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = performance.now();
  const requestId = request.headers.get("x-vercel-id");

  try {
    const data = await request.arrayBuffer();
    Sentry.addBreadcrumb({
      category: "udid-flow",
      message: "Received profile response",
      data: { payload_size: data.byteLength, stage: "profile_response_received" },
    });

    const response = await Sentry.startSpan(
      { name: "Verify and parse iOS profile response", op: "profile.parse" },
      () => parseSignedDeviceResponse(data)
    );

    const resultParams = new URLSearchParams();
    const { attributes } = response;
    const fields = [
      ["UDID", attributes.udid],
      ["IMEI", attributes.imei],
      ["MEID", attributes.meid],
      ["PRODUCT", attributes.product],
      ["SERIAL", attributes.serialNumber],
      ["VERSION", attributes.version],
    ] as const;
    for (const [key, value] of fields) {
      if (value) resultParams.set(key, value);
    }
    resultParams.set(SAMPLE_RESULT_QUERY_PARAM, PROFILE_RESULT_SOURCE);

    const url = new URL(`/success?${resultParams.toString()}`, request.url);
    recordApiResult({
      durationMs: performance.now() - startedAt,
      requestId,
      route: "/api/retrieve",
      status: 301,
    });
    return NextResponse.redirect(url, 301);
  } catch (err) {
    const errorType =
      err instanceof UdidToolsError ? err.code : err instanceof Error ? err.name : "unknown_error";
    Sentry.captureException(err, {
      tags: {
        error_code: errorType,
        flow: "udid_retrieval",
        stage: "parse_profile_response",
      },
    });
    recordApiResult({
      durationMs: performance.now() - startedAt,
      errorType,
      requestId,
      route: "/api/retrieve",
      status: 400,
    });
    return NextResponse.json({ error: "Invalid profile response" }, { status: 400 });
  }
}
