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
    const wantsHtml = request.headers.get("accept")?.includes("text/html");
    return new Response(
      wantsHtml
        ? `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Profile download unavailable · UDID Tools</title>
  <style>
    body { margin: 0; padding: 1.5rem; font: 1rem/1.6 system-ui, sans-serif; background: #fff; color: #171717; }
    main { max-width: 40rem; margin: 3rem auto; }
    a { display: inline-block; padding: .75rem; color: #1d4ed8; }
    a:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
  </style>
</head>
<body>
  <main>
    <h1>Profile download unavailable</h1>
    <p>We could not prepare the configuration profile. Please try again in a few minutes.</p>
    <p><a href="/api/register.signed.mobileconfig">Try downloading again</a><a href="/#how-it-works">Review the instructions</a></p>
    <p>If the problem continues, contact <a href="mailto:hello@udid.tools">hello@udid.tools</a>. Do not include device identifiers or result links.</p>
  </main>
</body>
</html>`
        : "Internal Server Error",
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
          Vary: "Accept",
          "Content-Type": wantsHtml ? "text/html; charset=utf-8" : "text/plain; charset=utf-8",
        },
      }
    );
  }
}
