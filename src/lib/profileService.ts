import "server-only";

import * as Sentry from "@sentry/nextjs";
import {
  generateProfile,
  parseProfileServiceResponse,
  type CertificateInput,
  type GeneratedProfile,
  type ProfileServiceResponse,
} from "@udid-tools/core";

const PROFILE_IDENTIFIER = "tools.udid.profile-service";
const DEVICE_ATTRIBUTES = ["PRODUCT", "SERIAL", "VERSION", "UDID", "IMEI", "MEID"] as const;
const CERTIFICATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedCertificateChain: readonly CertificateInput[] | null = null;
let certificateChainCachedAt = 0;

function derToPem(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString("base64");
  const wrapped = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----\n`;
}

async function fetchCertificate(url: string): Promise<CertificateInput> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Signing certificate fetch failed with status ${response.status}`);
  }

  return {
    encoding: "pem",
    value: derToPem(new Uint8Array(await response.arrayBuffer())),
  };
}

async function getSigningCertificateChain(): Promise<readonly CertificateInput[]> {
  const rootUrl = process.env.APPLE_ROOT_CERT_URL;
  const intermediateUrl = process.env.APPLE_INTERMEDIATE_CERT_URL;
  if (!rootUrl || !intermediateUrl) {
    throw new Error("The profile signing certificate chain is not configured");
  }

  const now = Date.now();
  if (cachedCertificateChain && now - certificateChainCachedAt < CERTIFICATE_CACHE_TTL_MS) {
    Sentry.metrics.count("udid_tools.apple_cert_cache", 1, {
      attributes: { result: "hit" },
    });
    return cachedCertificateChain;
  }

  Sentry.metrics.count("udid_tools.apple_cert_cache", 1, {
    attributes: { result: "miss" },
  });
  cachedCertificateChain = await Sentry.startSpan(
    { name: "Fetch profile signing certificate chain", op: "http.client" },
    () => Promise.all([fetchCertificate(rootUrl), fetchCertificate(intermediateUrl)])
  );
  certificateChainCachedAt = now;
  return cachedCertificateChain;
}

function recordCoreWarnings(
  operation: "generate" | "parse",
  warnings: readonly { readonly code: string }[]
): void {
  if (!warnings.length) return;

  Sentry.addBreadcrumb({
    category: "udid-flow.core",
    message: `Profile Service ${operation} warnings`,
    level: "warning",
    data: { warning_codes: warnings.map(({ code }) => code) },
  });
}

export async function generateSignedDeviceProfile(responseUrl: string): Promise<GeneratedProfile> {
  const pkcs12Base64 = process.env.MDM_SERVER_P12_BASE64;
  const pkcs12Passphrase = process.env.MDM_SERVER_P12_PASSCODE ?? "";

  if (!pkcs12Base64) {
    throw new Error("The PKCS#12 profile signing identity is not configured");
  }

  const certificateChain = await getSigningCertificateChain();
  const result = await generateProfile({
    profile: {
      kind: "profile-service",
      identifier: PROFILE_IDENTIFIER,
      displayName: "Device Identification Profile",
      organization: "UDID Tools",
      description:
        "This profile allows the service to securely retrieve your device's unique identifier (UDID) and related information.",
      service: {
        responseUrl,
        deviceAttributes: DEVICE_ATTRIBUTES,
      },
    },
    signing: {
      identity: {
        type: "pkcs12",
        data: { encoding: "base64", value: pkcs12Base64 },
        passphrase: pkcs12Passphrase,
      },
      certificateChain,
      digestAlgorithm: "sha256",
    },
  });

  if (!result.ok) throw result.error;

  recordCoreWarnings("generate", result.warnings);
  return result.value;
}

export async function parseSignedDeviceResponse(
  input: ArrayBuffer
): Promise<ProfileServiceResponse> {
  const result = await parseProfileServiceResponse(input, {
    expectedAttributes: DEVICE_ATTRIBUTES,
    requiredAttributes: ["UDID"],
    verification: { mode: "signature" },
  });

  if (!result.ok) throw result.error;

  recordCoreWarnings("parse", result.warnings);
  return result.value;
}
