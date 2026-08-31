import * as Sentry from "@sentry/nextjs";
import { generateDeviceProfile } from "@/lib/profile-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const profile = await Sentry.startSpan(
      { name: "Generate configuration profile", op: "profile.generate" },
      generateDeviceProfile
    );
    return new Response(Buffer.from(profile.data), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": 'attachment; filename="register.signed.mobileconfig"',
        "Content-Type": profile.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { flow: "udid_retrieval", stage: "profile_generation" },
    });
    return new Response("Internal Server Error", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
