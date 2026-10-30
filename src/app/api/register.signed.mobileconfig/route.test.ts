import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as Sentry from "@sentry/nextjs";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  startSpan: vi.fn((_options: unknown, callback: () => unknown) => callback()),
}));
vi.mock("@/lib/observability/product-metrics", () => ({
  recordProfileRequest: vi.fn(),
}));

import { GET } from "@/app/api/register.signed.mobileconfig/route";
import { recordProfileRequest } from "@/lib/observability/product-metrics";

const signingAlgorithms = [
  {
    name: "PKCS#12 3DES",
    keyEncryption: "PBE-SHA1-3DES",
    certificateEncryption: "PBE-SHA1-3DES",
  },
  {
    name: "PBES2 AES-256",
    keyEncryption: "AES-256-CBC",
    certificateEncryption: "AES-256-CBC",
  },
] as const;

const identities = new Map<string, string>();
const passphrase = randomBytes(32).toString("base64url");
let temporaryDirectory: string | undefined;

function openssl(args: string[], input?: Buffer) {
  // Keep generated material, decrypted profiles, and tool diagnostics out of test output.
  return spawnSync("openssl", args, {
    env: { ...process.env, UDID_TOOLS_TEST_PKCS12_PASSWORD: passphrase },
    ...(input ? { input } : {}),
    stdio: ["pipe", "ignore", "ignore"],
    timeout: 15_000,
  });
}

function profileRequest(method: "GET" | "HEAD" = "GET") {
  return new Request("http://localhost:3000/api/register.signed.mobileconfig", { method });
}

function expectDownloadHeaders(response: Response, method: "GET" | "HEAD" = "GET") {
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/x-apple-aspen-config");
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("content-disposition")).toBe(
    'attachment; filename="register.signed.mobileconfig"'
  );
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  expect(recordProfileRequest).toHaveBeenCalledExactlyOnceWith("success", method);
}

async function expectGenericFailure(response: Response, method: "GET" | "HEAD" = "GET") {
  expect(response.status).toBe(500);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
  expect(await response.text()).toBe("Internal Server Error");
  expect(recordProfileRequest).toHaveBeenCalledExactlyOnceWith("error", method);
  expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  const report = vi.mocked(Sentry.captureException).mock.calls[0];
  expect(report?.[0] instanceof Error).toBe(true);
  expect(report?.[1]).toEqual({
    tags: { flow: "udid_retrieval", stage: "profile_generation" },
  });
}

describe("configuration profile download with the installed core library", () => {
  beforeAll(() => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "udid-profile-download-test-"));
    const keyPath = join(temporaryDirectory, "signer.key");
    const certificatePath = join(temporaryDirectory, "signer.pem");
    const certificate = openssl([
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-sha256",
      "-days",
      "1",
      "-subj",
      "/CN=Profile download integration test",
      "-keyout",
      keyPath,
      "-out",
      certificatePath,
    ]);
    if (certificate.status !== 0) throw new Error("Could not generate temporary signing material");

    for (const algorithm of signingAlgorithms) {
      const pkcs12Path = join(temporaryDirectory, `${algorithm.certificateEncryption}.p12`);
      const exported = openssl([
        "pkcs12",
        "-export",
        "-inkey",
        keyPath,
        "-in",
        certificatePath,
        // Specify both algorithms so verification covers each installed core signing format.
        "-keypbe",
        algorithm.keyEncryption,
        "-certpbe",
        algorithm.certificateEncryption,
        "-macalg",
        "sha256",
        "-passout",
        "env:UDID_TOOLS_TEST_PKCS12_PASSWORD",
        "-out",
        pkcs12Path,
      ]);
      if (exported.status !== 0) throw new Error("Could not export temporary signing material");
      identities.set(algorithm.certificateEncryption, readFileSync(pkcs12Path).toString("base64"));
    }
  }, 30_000);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("UDID_TOOLS_PUBLIC_ORIGIN", "http://localhost:3000");
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_MODE", "unsigned");
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_BASE64", undefined);
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_PASSPHRASE", undefined);
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_CERTIFICATE_CHAIN_PEM", undefined);
    vi.stubEnv("UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64", randomBytes(32).toString("base64"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  afterAll(() => {
    identities.clear();
    if (temporaryDirectory) rmSync(temporaryDirectory, { force: true, recursive: true });
  });

  it("downloads a valid unsigned Profile Service plist in local development", async () => {
    const response = await GET(profileRequest());

    expectDownloadHeaders(response);
    const profile = await response.text();
    // Assert booleans so failed assertions cannot print profile bodies or challenges.
    expect(profile.startsWith('<?xml version="1.0"')).toBe(true);
    expect(profile.includes("<string>Profile Service</string>")).toBe(true);
    expect(profile.includes("<string>http://localhost:3000/api/retrieve</string>")).toBe(true);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("distinguishes HEAD requests from profile downloads", async () => {
    const response = await GET(profileRequest("HEAD"));

    expectDownloadHeaders(response, "HEAD");
  });

  it.each(signingAlgorithms)(
    "downloads and independently verifies a $name signed profile",
    async (algorithm) => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("UDID_TOOLS_PUBLIC_ORIGIN", "https://www.udid.tools");
      vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_MODE", "signed");
      vi.stubEnv(
        "UDID_TOOLS_PROFILE_SIGNING_PKCS12_BASE64",
        identities.get(algorithm.certificateEncryption)
      );
      vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_PASSPHRASE", passphrase);

      const response = await GET(profileRequest());

      expectDownloadHeaders(response);
      const profile = Buffer.from(await response.arrayBuffer());
      // Verify the attached CMS signature independently; the synthetic signer is self-signed.
      const verification = openssl(
        ["cms", "-verify", "-inform", "DER", "-binary", "-noverify"],
        profile
      );
      expect(verification.status).toBe(0);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    }
  );

  it("reports a wrong PKCS#12 passphrase without disclosing signing material", async () => {
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_MODE", "signed");
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_BASE64", identities.get("PBE-SHA1-3DES"));
    vi.stubEnv(
      "UDID_TOOLS_PROFILE_SIGNING_PKCS12_PASSPHRASE",
      randomBytes(32).toString("base64url")
    );

    await expectGenericFailure(await GET(profileRequest()));
  });

  it("reports a malformed PKCS#12 identity as a generic server error", async () => {
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_MODE", "signed");
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_BASE64", randomBytes(64).toString("base64"));
    vi.stubEnv("UDID_TOOLS_PROFILE_SIGNING_PKCS12_PASSPHRASE", passphrase);

    await expectGenericFailure(await GET(profileRequest()));
  });

  it("fails closed when unsigned signing mode is requested in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expectGenericFailure(await GET(profileRequest()));
  });

  it("records a failed HEAD request separately from profile downloads", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expectGenericFailure(await GET(profileRequest("HEAD")), "HEAD");
  });
});
