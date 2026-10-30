import * as Sentry from "@sentry/nextjs";
import { recordProfileRequest } from "@/lib/observability/product-metrics";
import { generateDeviceProfile } from "@/lib/profile-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const method = request.method;
  try {
    const profile = await Sentry.startSpan(
      { name: "Generate configuration profile", op: "profile.generate" },
      generateDeviceProfile
    );
    const response = new Response(Buffer.from(profile.data), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="register.signed.mobileconfig"',
        "Content-Type": profile.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
    if (method === "GET" || method === "HEAD") recordProfileRequest("success", method);
    return response;
  } catch (error) {
    if (method === "GET" || method === "HEAD") recordProfileRequest("error", method);
    Sentry.captureException(error, {
      tags: { flow: "udid_retrieval", stage: "profile_generation" },
    });
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
