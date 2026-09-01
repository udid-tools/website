import * as Sentry from "@sentry/nextjs";
import { DEFAULT_LIMITS, UdidToolsError, type UdidToolsErrorCode } from "@udid-tools/core";
import { PayloadTooLargeError, readBody } from "@/lib/http";
import { parseDeviceResponse } from "@/lib/profile-service";
import type { DeviceResult } from "@/lib/result";
import { encryptResultToken, ResultTokenInputError } from "@/lib/result-token";
import { publicOrigin } from "@/lib/server-config";

export const runtime = "nodejs";

const CLIENT_INPUT_ERROR_CODES = new Set<UdidToolsErrorCode>([
  "CHALLENGE_MISMATCH",
  "INPUT_TOO_LARGE",
  "INVALID_SIGNATURE",
  "MALFORMED_CMS",
  "MALFORMED_PLIST",
  "MISSING_CHALLENGE",
  "MISSING_REQUIRED_ATTRIBUTE",
  "OUTPUT_TOO_LARGE",
  "UNSUPPORTED_ALGORITHM",
  "UNTRUSTED_SIGNER",
]);

function clientErrorStatus(error: unknown) {
  if (error instanceof PayloadTooLargeError) return 413;
  if (error instanceof ResultTokenInputError) return 400;
  if (error instanceof UdidToolsError && CLIENT_INPUT_ERROR_CODES.has(error.code)) return 400;
  return undefined;
}

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
    const status = clientErrorStatus(error);
    if (!status) {
      Sentry.captureException(error, {
        tags: { flow: "udid_retrieval", stage: "profile_response", status: "500" },
      });
    }
    return Response.json(
      {
        error:
          status === 413
            ? "Profile response is too large"
            : status === 400
              ? "Invalid profile response"
              : "Profile response processing failed",
      },
      { status: status ?? 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
