import * as Sentry from "@sentry/nextjs";
import { UdidToolsError } from "@udid-tools/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  encryptResultToken: vi.fn(() => "encrypted-result"),
  parseDeviceResponse: vi.fn(),
  ResultTokenInputError: class ResultTokenInputError extends Error {},
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_options: unknown, callback: () => unknown) => callback()),
}));
vi.mock("@/lib/profile-service", () => ({
  parseDeviceResponse: mocks.parseDeviceResponse,
}));
vi.mock("@/lib/result-token", () => ({
  encryptResultToken: mocks.encryptResultToken,
  ResultTokenInputError: mocks.ResultTokenInputError,
}));
vi.mock("@/lib/server-config", () => ({
  publicOrigin: () => "https://www.udid.tools",
}));

import { POST } from "@/app/api/retrieve/route";

describe("Profile Service response route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.parseDeviceResponse.mockResolvedValue({
      attributes: {
        imei: "353456789012345",
        meid: "A100000A2BC4D6",
        product: "iPhone16,1",
        serialNumber: "F2LXN4KDJKLF",
        udid: "00008101-000A1C3E1234567E",
        version: "iOS 17.4.1",
      },
    });
  });

  it("returns the permanent redirect required by the iOS Profile Service flow", async () => {
    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", {
        body: "signed-profile-response",
        method: "POST",
      })
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://www.udid.tools/success?result=encrypted-result"
    );
  });

  it("returns 400 without reporting malformed client input", async () => {
    mocks.parseDeviceResponse.mockRejectedValueOnce(
      new UdidToolsError("MALFORMED_CMS", "The CMS input is malformed.")
    );

    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", { body: "invalid", method: "POST" })
    );

    expect(response.status).toBe(400);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("returns 413 without reporting an oversized request body", async () => {
    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", {
        headers: { "content-length": "999999999" },
        method: "POST",
      })
    );

    expect(response.status).toBe(413);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("returns 400 without reporting an oversized result token", async () => {
    mocks.encryptResultToken.mockImplementationOnce(() => {
      throw new mocks.ResultTokenInputError("Result token exceeds maximum length");
    });

    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", { body: "input", method: "POST" })
    );

    expect(response.status).toBe(400);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("reports library configuration failures and returns 500", async () => {
    const error = new UdidToolsError("INVALID_CONFIGURATION", "Invalid server configuration.");
    mocks.parseDeviceResponse.mockRejectedValueOnce(error);

    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", { body: "input", method: "POST" })
    );

    expect(response.status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { flow: "udid_retrieval", stage: "profile_response", status: "500" },
    });
  });

  it("reports unexpected server failures and returns 500", async () => {
    const error = new Error("Unexpected server failure");
    mocks.parseDeviceResponse.mockRejectedValueOnce(error);

    const response = await POST(
      new Request("https://www.udid.tools/api/retrieve", { body: "input", method: "POST" })
    );

    expect(response.status).toBe(500);
    expect(Sentry.captureException).toHaveBeenCalledWith(error, {
      tags: { flow: "udid_retrieval", stage: "profile_response", status: "500" },
    });
  });
});
