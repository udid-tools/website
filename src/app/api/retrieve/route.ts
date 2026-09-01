import * as Sentry from "@sentry/nextjs";
import { DEFAULT_LIMITS } from "@udid-tools/core";
import { PayloadTooLargeError, readBody } from "@/lib/http";
import { parseDeviceResponse } from "@/lib/profile-service";
import type { DeviceResult } from "@/lib/result";
import { encryptResultToken } from "@/lib/result-token";
import { publicOrigin } from "@/lib/server-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, DEFAULT_LIMITS.maxInputBytes);
    const response = await Sentry.startSpan(
      { name: "Verify configuration profile response", op: "profile.parse" },
      () => parseDeviceResponse(input)
    );
    const result: DeviceResult = {
      udid: response.attributes.udid ?? "",
      imei: response.attributes.imei ?? "",
      meid: response.attributes.meid ?? "",
      product: response.attributes.product ?? "",
      serial: response.attributes.serialNumber ?? "",
      version: response.attributes.version ?? "",
    };
    const url = new URL("/success", publicOrigin());
    url.searchParams.set("result", encryptResultToken(result));
    // Apple Profile Service clients use a permanent redirect to hand the flow
    // back to Safari after posting the signed device response.
    return Response.redirect(url, 301);
  } catch (error) {
    const status = error instanceof PayloadTooLargeError ? 413 : 400;
    Sentry.captureException(error, {
      tags: { flow: "udid_retrieval", stage: "profile_response", status: String(status) },
    });
    return Response.json(
      { error: status === 413 ? "Profile response is too large" : "Invalid profile response" },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
