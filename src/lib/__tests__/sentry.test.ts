import { describe, expect, it } from "vitest";
import {
  SENTRY_IGNORED_BROWSER_ERRORS,
  scrubBreadcrumb,
  scrubSentryEvent,
  stripUrlDetails,
  traceSampleRate,
} from "@/lib/observability/sentry";

describe("Sentry privacy filters", () => {
  it("ignores only known third-party browser injection errors", () => {
    const isIgnored = (message: string) =>
      SENTRY_IGNORED_BROWSER_ERRORS.some((pattern) => pattern.test(message));

    expect(isIgnored("ReferenceError: Can't find variable: zaloJSV2")).toBe(true);
    expect(isIgnored("Object Not Found Matching Id:1, MethodName:update, ParamCount:4")).toBe(true);
    expect(isIgnored("undefined is not an object (evaluating 'r[\"@context\"].toLowerCase')")).toBe(
      false
    );
    expect(isIgnored("NotFoundError: The object can not be found here.")).toBe(false);
  });

  it("removes query strings and fragments from URLs", () => {
    expect(stripUrlDetails("https://www.udid.tools/success?result=secret#details")).toBe(
      "https://www.udid.tools/success"
    );
    expect(stripUrlDetails("/success?result=secret")).toBe("/success");
    expect(stripUrlDetails("http://[?secret")).toBe("http://[");
  });

  it("scrubs all event containers and URL-like nested values", () => {
    const event = scrubSentryEvent({
      transaction: "/success?result=secret",
      tags: { href: "/guides?private=yes", token: "secret" },
      contexts: { device: { serial: "secret", safe: true } },
      breadcrumbs: [{ data: { to: "/success?result=secret", values: [{ imei: "secret" }] } }, {}],
    });
    expect(event.transaction).toBe("/success");
    expect(event.tags).toEqual({ href: "/guides", token: "[Filtered]" });
    expect(event.contexts).toEqual({ device: { serial: "[Filtered]", safe: true } });
    expect(event.breadcrumbs?.[0]?.data).toEqual({
      to: "/success",
      values: [{ imei: "[Filtered]" }],
    });
    expect(scrubBreadcrumb({ data: { challenge: "secret" } }).data).toEqual({
      challenge: "[Filtered]",
    });
    expect(scrubBreadcrumb({})).toEqual({});
  });

  it("filters request and nested device identifiers", () => {
    const event = scrubSentryEvent({
      request: {
        url: "https://www.udid.tools/success?result=secret",
        query_string: "result=secret",
        data: "body",
        cookies: {},
        headers: { cookie: "secret", accept: "text/html" },
      },
      extra: { result_token: "secret", nested: { udid: "device", safe: "ok" } },
    });
    expect(event.request?.url).toBe("https://www.udid.tools/success");
    expect(event.request?.query_string).toBeUndefined();
    expect(event.request?.headers?.cookie).toBe("[Filtered]");
    expect(event.extra).toEqual({
      result_token: "[Filtered]",
      nested: { udid: "[Filtered]", safe: "ok" },
    });
  });

  it("never traces result pages", () => {
    const inheritOrSampleWith = (rate: number) => rate;
    expect(
      traceSampleRate({
        inheritOrSampleWith,
        location: { pathname: "/success" },
        name: "GET /success",
      })
    ).toBe(0);
    expect(
      traceSampleRate({
        inheritOrSampleWith,
        location: { pathname: "/api/retrieve" },
        name: "POST /api/retrieve",
      })
    ).toBe(1);
    expect(
      traceSampleRate({
        inheritOrSampleWith,
        normalizedRequest: { url: "/guides" },
        name: "GET /guides",
      })
    ).toBe(process.env.NODE_ENV === "production" ? 0.25 : 1);
    expect(traceSampleRate({ inheritOrSampleWith, name: "GET /" })).toBe(
      process.env.NODE_ENV === "production" ? 0.25 : 1
    );
  });
});
