import * as Sentry from "@sentry/nextjs";
import { after } from "next/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const deferred = vi.hoisted(() => ({ callbacks: [] as Array<() => Promise<void>> }));

vi.mock("next/server", () => ({
  after: vi.fn((callback: () => Promise<void>) => {
    deferred.callbacks.push(callback);
  }),
}));

import {
  recordProfileRequest,
  recordProfileResponse,
  recordResultEvent,
  scrubProductMetric,
} from "@/lib/observability/product-metrics";

type Transport = ReturnType<NonNullable<Sentry.NodeOptions["transport"]>>;
type Envelope = Parameters<Transport["send"]>[0];
type CapturedMetric = {
  name: string;
  type: string;
  value: number;
  unit?: string;
  trace_id: string;
  span_id?: string;
  attributes: Record<string, { value: unknown }>;
};

const envelopes: Envelope[] = [];

async function capturedMetrics() {
  await Sentry.flush();
  return envelopes.flatMap(([, items]) =>
    items.flatMap(([header, payload]) =>
      header.type === "trace_metric" ? (payload as { items: CapturedMetric[] }).items : []
    )
  );
}

function attributesOf(metric: CapturedMetric) {
  return Object.fromEntries(
    Object.entries(metric.attributes)
      .filter(([key]) => !key.startsWith("sentry."))
      .map(([key, attribute]) => [key, attribute.value])
  );
}

describe("privacy-limited product counters", () => {
  beforeAll(() => {
    Sentry.init({
      dsn: "https://public@example.invalid/1",
      defaultIntegrations: false,
      environment: "test",
      release: "test-release",
      serverName: "synthetic-server-name",
      sendDefaultPii: false,
      tracesSampleRate: 0,
      beforeSendMetric: scrubProductMetric,
      transport: () => ({
        send: (envelope: Envelope) => {
          envelopes.push(envelope);
          return Promise.resolve({ statusCode: 200 });
        },
        flush: () => Promise.resolve(true),
      }),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    deferred.callbacks.length = 0;
    envelopes.length = 0;
    Sentry.getGlobalScope().clear();
    Sentry.getCurrentScope().clear();
    Sentry.getIsolationScope().clear();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await Sentry.flush();
    Sentry.getGlobalScope().clear();
    Sentry.getCurrentScope().clear();
    Sentry.getIsolationScope().clear();
  });

  afterAll(async () => {
    await Sentry.close();
  });

  it("defers flushing until after the response and uses a bounded flush budget", async () => {
    const flush = vi.spyOn(Sentry.getClient()!, "flush");

    recordProfileRequest("success", "GET");

    expect(after).toHaveBeenCalledTimes(1);
    expect(deferred.callbacks).toHaveLength(1);
    expect(flush).not.toHaveBeenCalled();
    expect(envelopes).toEqual([]);

    await deferred.callbacks[0]!();

    expect(flush).toHaveBeenCalledExactlyOnceWith(2000);
    expect(
      envelopes.some(([, items]) => items.some(([header]) => header.type === "trace_metric"))
    ).toBe(true);
  });

  it("schedules a flush for every successfully recorded product metric", () => {
    recordProfileRequest("success", "GET");
    recordProfileResponse("accepted", 301);
    recordResultEvent("result_page_viewed", { result_source: "profile" });
    recordResultEvent("result_page_action", { result_source: "sample", action: "copy_all" });

    expect(after).toHaveBeenCalledTimes(4);
    expect(deferred.callbacks).toHaveLength(4);
  });

  it("contains background flush rejection without reporting or logging its error", async () => {
    const flush = vi
      .spyOn(Sentry.getClient()!, "flush")
      .mockRejectedValueOnce(new Error("Synthetic flush failure"));
    const captureException = vi.spyOn(Sentry.getClient()!, "captureException");
    const consoleError = vi.spyOn(console, "error");

    recordProfileResponse("accepted", 301);

    await expect(deferred.callbacks[0]!()).resolves.toBeUndefined();
    expect(flush).toHaveBeenCalledExactlyOnceWith(2000);
    expect(captureException).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("does not interrupt the application when after registration fails", () => {
    vi.mocked(after).mockImplementationOnce(() => {
      throw new Error("Synthetic after registration failure");
    });

    expect(() => recordProfileRequest("success", "GET")).not.toThrow();
    expect(deferred.callbacks).toEqual([]);
  });

  it("counts requests and callback outcomes even when traces are not sampled", async () => {
    Sentry.startSpan({ name: "unsampled operation" }, () => {
      recordProfileRequest("success", "GET");
      recordProfileRequest("error", "HEAD");
      recordProfileResponse("accepted", 301);
      recordProfileResponse("rejected", 400);
      recordProfileResponse("rejected", 413);
      recordProfileResponse("error", 500);
    });

    const metrics = await capturedMetrics();
    expect(metrics.map((metric) => [metric.name, attributesOf(metric)])).toEqual([
      ["udid_tools.profile.requests", { outcome: "success", http_method: "GET" }],
      ["udid_tools.profile.requests", { outcome: "error", http_method: "HEAD" }],
      ["udid_tools.profile.responses", { outcome: "accepted", http_status: 301 }],
      ["udid_tools.profile.responses", { outcome: "rejected", http_status: 400 }],
      ["udid_tools.profile.responses", { outcome: "rejected", http_status: 413 }],
      ["udid_tools.profile.responses", { outcome: "error", http_status: 500 }],
    ]);
    expect(
      metrics.every(({ type, value, unit }) => type === "counter" && value === 1 && unit === "none")
    ).toBe(true);
    expect(
      envelopes.some(([, items]) => items.some(([header]) => header.type === "transaction"))
    ).toBe(false);
  });

  it("does not inherit scope identity, arbitrary attributes, or request trace linkage", async () => {
    const global = Sentry.getGlobalScope();
    const isolation = Sentry.getIsolationScope();
    const current = Sentry.getCurrentScope();
    for (const [index, scope] of [global, isolation, current].entries()) {
      scope.setUser({ id: `private-test-marker-${index}`, email: "private-test-marker" });
      scope.setAttribute(`private_scope_${index}`, "private-test-marker");
      scope.setAttribute("outcome", "private-test-marker");
    }

    let parentTraceId = "";
    Sentry.startSpan({ name: "request context" }, (span) => {
      parentTraceId = span.spanContext().traceId;
      recordProfileRequest("success", "GET");
    });

    const [metric] = await capturedMetrics();
    expect(metric).toBeDefined();
    expect(Object.keys(metric!.attributes).sort()).toEqual(
      [
        "http_method",
        "outcome",
        "sentry.environment",
        "sentry.release",
        "sentry.sdk.name",
        "sentry.sdk.version",
        "sentry.timestamp.sequence",
      ].sort()
    );
    expect(attributesOf(metric!)).toEqual({ outcome: "success", http_method: "GET" });
    expect(metric?.trace_id).not.toBe(parentTraceId);
    expect(metric?.span_id).toBeUndefined();
    for (const [index, scope] of [global, isolation, current].entries()) {
      expect(scope.getUser()?.id).toBe(`private-test-marker-${index}`);
      expect(scope.getScopeData().attributes?.[`private_scope_${index}`]).toBe(
        "private-test-marker"
      );
    }
  });

  it("records bounded result categories and keeps sample and real results distinct", async () => {
    recordResultEvent("result_page_viewed", {
      result_source: "sample",
      field_count: 6,
      has_device_info: true,
      share_available: false,
      outcome: "success",
    });
    recordResultEvent("result_page_action", {
      result_source: "profile",
      action: "copy_field",
      format: "txt",
      field_type: "udid",
      field_label: "UDID",
      outcome: "failure",
    });

    const metrics = await capturedMetrics();
    expect(metrics.map((metric) => [metric.name, attributesOf(metric)])).toEqual([
      [
        "udid_tools.result.views",
        {
          result_source: "sample",
          field_count: 6,
          has_device_info: true,
          share_available: false,
          outcome: "success",
        },
      ],
      [
        "udid_tools.result.actions",
        {
          result_source: "profile",
          action: "copy_field",
          format: "txt",
          field_type: "udid",
          field_label: "UDID",
          outcome: "failure",
        },
      ],
    ]);
  });

  it("drops unknown values and arbitrary fields before reaching the SDK", async () => {
    recordResultEvent("result_page_action", {
      result_source: "profile",
      action: "private-test-marker",
      field_label: "private-test-marker",
      field_type: "private-test-marker",
      format: "private-test-marker",
      outcome: "private-test-marker",
      field_count: 7,
      has_device_info: "private-test-marker",
      share_available: 1,
      result_token: "private-test-marker",
      url: "private-test-marker",
      raw_value: { nested: "private-test-marker" },
    });

    const metrics = await capturedMetrics();
    expect(metrics.map(attributesOf)).toEqual([{ result_source: "profile" }]);
    expect(JSON.stringify(metrics)).not.toContain("private-test-marker");
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, "1", null])(
    "omits an invalid field count (%s)",
    async (fieldCount) => {
      recordResultEvent("result_page_viewed", {
        result_source: "profile",
        field_count: fieldCount,
      });
      expect((await capturedMetrics()).map(attributesOf)).toEqual([{ result_source: "profile" }]);
    }
  );

  it("keeps zero fields and false booleans", async () => {
    recordResultEvent("result_page_viewed", {
      result_source: "profile",
      field_count: 0,
      has_device_info: false,
      share_available: false,
      outcome: "missing_device_info",
    });
    expect((await capturedMetrics()).map(attributesOf)).toEqual([
      {
        result_source: "profile",
        field_count: 0,
        has_device_info: false,
        share_available: false,
        outcome: "missing_device_info",
      },
    ]);
  });

  it("ignores unrecognized events, result sources, and profile categories", async () => {
    recordResultEvent("private-test-marker" as "result_page_viewed", { result_source: "profile" });
    recordResultEvent("result_page_viewed", {});
    recordResultEvent("result_page_viewed", { result_source: "private-test-marker" });
    recordProfileRequest("private-test-marker" as "success", "GET");
    recordProfileRequest("success", "private-test-marker" as "GET");
    recordProfileResponse("private-test-marker" as "accepted", 301);
    recordProfileResponse("accepted", 200 as 301);
    expect(after).not.toHaveBeenCalled();
    expect(await capturedMetrics()).toEqual([]);
  });

  it("does not interrupt the application when the SDK or an attribute getter fails", () => {
    vi.spyOn(Sentry.metrics, "count").mockImplementation(() => {
      throw new Error("Synthetic telemetry failure");
    });
    expect(() => recordProfileRequest("success", "GET")).not.toThrow();
    expect(() => recordProfileResponse("accepted", 301)).not.toThrow();
    expect(() =>
      recordResultEvent("result_page_viewed", { result_source: "profile" })
    ).not.toThrow();
    expect(() =>
      recordResultEvent("result_page_viewed", {
        get result_source() {
          throw new Error("Synthetic attribute failure");
        },
      })
    ).not.toThrow();
    expect(after).not.toHaveBeenCalled();
  });

  it("does nothing when Sentry has no client", async () => {
    const current = Sentry.getCurrentScope();
    const client = current.getClient();
    current.setClient(undefined);
    try {
      recordProfileRequest("success", "GET");
    } finally {
      current.setClient(client);
    }
    expect(after).not.toHaveBeenCalled();
    expect(await capturedMetrics()).toEqual([]);
  });

  it("leaves unrelated SDK metrics unchanged", () => {
    const metric: Sentry.Metric = {
      name: "existing.metric",
      type: "gauge",
      value: 2,
      attributes: { category: "existing" },
    };
    expect(scrubProductMetric(metric)).toBe(metric);
  });

  it("independently bounds SDK-enriched product attributes and metadata", () => {
    const requests = scrubProductMetric({
      name: "udid_tools.profile.requests",
      type: "counter",
      value: 1,
      attributes: {
        outcome: "private-test-marker",
        http_method: "private-test-marker",
        "server.address": "private-test-marker",
        "user.id": "private-test-marker",
        "sentry.environment": "test",
        "sentry.release": 42,
      },
    });
    expect(requests?.attributes).toEqual({ "sentry.environment": "test" });

    const response = scrubProductMetric({
      name: "udid_tools.profile.responses",
      type: "counter",
      value: 1,
      attributes: { outcome: "private-test-marker", http_status: 200 },
    });
    expect(response?.attributes).toEqual({});

    const results = scrubProductMetric({
      name: "udid_tools.result.views",
      type: "counter",
      value: 1,
      attributes: { result_source: "private-test-marker", raw_value: "private-test-marker" },
    });
    expect(results?.attributes).toEqual({});
  });

  it("drops unknown product metric names and malformed SDK attributes", () => {
    expect(
      scrubProductMetric({ name: "udid_tools.unknown", type: "counter", value: 1 })
    ).toBeNull();
    expect(
      scrubProductMetric({ name: "udid_tools.profile.requests", type: "counter", value: 1 })
        ?.attributes
    ).toEqual({});
    expect(
      scrubProductMetric({
        name: "udid_tools.result.views",
        type: "counter",
        value: 1,
        get attributes(): Record<string, unknown> {
          throw new Error("Synthetic SDK attribute failure");
        },
      })
    ).toBeNull();
  });
});
