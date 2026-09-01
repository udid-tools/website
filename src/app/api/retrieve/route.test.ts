import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  encryptResultToken: vi.fn(() => "encrypted-result"),
  parseDeviceResponse: vi.fn(),
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
});
