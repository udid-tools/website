import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { recordApiResult } from "@/lib/observability/server";
import { generateSignedDeviceProfile } from "@/lib/profileService";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const startedAt = performance.now();
  const requestId = req.headers.get("x-vercel-id");

  try {
    const url = new URL(req.url);
    const actualURL = `${url.protocol}//${url.host}/api/retrieve/`;

    const profile = await Sentry.startSpan(
      { name: "Generate signed iOS configuration profile", op: "profile.generate" },
      () => generateSignedDeviceProfile(actualURL)
    );

    Sentry.addBreadcrumb({
      category: "udid-flow",
      message: "Signed profile generated",
      data: {
        profile_size: profile.data.byteLength,
        profile_uuid: profile.profile.uuid,
        stage: "profile_signed",
      },
    });
    recordApiResult({
      durationMs: performance.now() - startedAt,
      requestId,
      route: "/api/register.signed.mobileconfig",
      status: 200,
    });

    return new NextResponse(Buffer.from(profile.data), {
      headers: {
        "Content-Type": profile.contentType,
        "Content-Disposition": 'attachment; filename="register.signed.mobileconfig"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    Sentry.captureException(e, {
      tags: { flow: "udid_retrieval", stage: "generate_signed_profile" },
    });
    recordApiResult({
      durationMs: performance.now() - startedAt,
      errorType: e instanceof Error ? e.name : "unknown_error",
      requestId,
      route: "/api/register.signed.mobileconfig",
      status: 500,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
