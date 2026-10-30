import * as Sentry from "@sentry/nextjs";
import { track } from "@vercel/analytics/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
vi.mock("@vercel/analytics/server", () => ({ track: vi.fn() }));
vi.mock("@/lib/observability/product-metrics", () => ({ recordResultEvent: vi.fn() }));

import { POST } from "@/app/api/analytics/result-action/route";
import { recordResultEvent } from "@/lib/observability/product-metrics";

function request(payload: unknown) {
  return new Request("https://www.udid.tools/api/analytics/result-action", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

describe("result analytics route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends the same allowlisted result action attributes to both analytics providers", async () => {
    const attributes = {
      action: "download",
      field_count: 6,
      field_label: "Device Model",
      field_type: "model",
      format: "json",
      has_device_info: true,
      outcome: "success",
      result_source: "profile",
      share_available: false,
    };
    const response = await POST(
      request({
        event_name: "result_page_action",
        ...attributes,
        unexpected_attribute: "excluded",
      })
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(recordResultEvent).toHaveBeenCalledExactlyOnceWith("result_page_action", attributes);
    expect(track).toHaveBeenCalledExactlyOnceWith("result_page_action", attributes);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("records a result view before attempting Vercel analytics, even when Vercel fails", async () => {
    const error = new Error("Analytics provider unavailable");
    vi.mocked(track).mockImplementationOnce(async () => {
      expect(recordResultEvent).toHaveBeenCalledTimes(1);
      throw error;
    });

    const response = await POST(
      request({ event_name: "result_page_viewed", result_source: "sample", has_device_info: false })
    );

    expect(response.status).toBe(204);
    expect(recordResultEvent).toHaveBeenCalledExactlyOnceWith(
      "result_page_viewed",
      expect.objectContaining({ result_source: "sample", has_device_info: false })
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { stage: "result_analytics" },
    });
  });

  it.each([-1, 7, 1.5, "3"])(
    "drops unapproved attributes and invalid field count %s",
    async (fieldCount) => {
      const response = await POST(
        request({
          event_name: "result_page_action",
          result_source: "profile",
          action: "unexpected",
          field_count: fieldCount,
          field_label: "unexpected",
          field_type: "unexpected",
          format: "unexpected",
          has_device_info: "true",
          outcome: "unexpected",
          share_available: "false",
          unexpected_attribute: "excluded",
        })
      );
      const attributes = {
        action: undefined,
        field_count: undefined,
        field_label: undefined,
        field_type: undefined,
        format: undefined,
        has_device_info: undefined,
        outcome: undefined,
        result_source: "profile",
        share_available: undefined,
      };

      expect(response.status).toBe(204);
      expect(recordResultEvent).toHaveBeenCalledExactlyOnceWith("result_page_action", attributes);
      expect(track).toHaveBeenCalledExactlyOnceWith("result_page_action", attributes);
    }
  );

  it.each([
    null,
    [],
    "invalid",
    {},
    { event_name: "unknown", result_source: "profile" },
    { event_name: "result_page_viewed", result_source: "unknown" },
  ])("does not count an invalid event payload %#", async (payload) => {
    const response = await POST(request(payload));

    expect(response.status).toBe(400);
    expect(recordResultEvent).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("does not count malformed JSON", async () => {
    const response = await POST(
      new Request("https://www.udid.tools/api/analytics/result-action", {
        method: "POST",
        body: "{",
      })
    );

    expect(response.status).toBe(400);
    expect(recordResultEvent).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it("does not count a payload that exceeds the body limit", async () => {
    const response = await POST(
      new Request("https://www.udid.tools/api/analytics/result-action", {
        method: "POST",
        headers: { "content-length": "2049" },
      })
    );

    expect(response.status).toBe(413);
    expect(recordResultEvent).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });
});
