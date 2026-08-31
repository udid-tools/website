import "server-only";

import type {
  CertificateInput,
  ResponseVerificationOptions,
  SigningOptions,
} from "@udid-tools/core";

const BASE64_32_BYTES = /^[A-Za-z0-9+/]{43}=$/u;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function canonicalSecret(name: string, developmentByte: number) {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") return Buffer.alloc(32, developmentByte);
  if (!value || !BASE64_32_BYTES.test(value))
    throw new Error(`${name} must be a canonical base64-encoded 32-byte value`);
  const bytes = Buffer.from(value, "base64");
  if (bytes.byteLength !== 32 || bytes.toString("base64") !== value)
    throw new Error(`${name} is invalid`);
  return bytes;
}

function splitCertificatePem(name: string, requiredValue: boolean): CertificateInput[] {
  const value = process.env[name];
  if (!value) {
    if (requiredValue) throw new Error(`${name} is required`);
    return [];
  }
  const certificates =
    value.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/gu) ?? [];
  const remainder = certificates
    .reduce((text, certificate) => text.replace(certificate, ""), value)
    .trim();
  if (!certificates.length || remainder)
    throw new Error(`${name} must contain only PEM certificates`);
  return certificates.map((certificate) => ({ encoding: "pem", value: `${certificate}\n` }));
}

export function publicOrigin() {
  const value =
    process.env["UDID_TOOLS_PUBLIC_ORIGIN"] ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : undefined);
  if (!value) throw new Error("UDID_TOOLS_PUBLIC_ORIGIN is required");
  const url = new URL(value);
  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password)
    throw new Error("UDID_TOOLS_PUBLIC_ORIGIN must be an origin only");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:")
    throw new Error("UDID_TOOLS_PUBLIC_ORIGIN must use HTTPS in production");
  return url.origin;
}

export function profileSigning(): SigningOptions | undefined {
  const mode =
    process.env["UDID_TOOLS_PROFILE_SIGNING_MODE"] ??
    (process.env.NODE_ENV === "production" ? "signed" : "unsigned");
  if (mode === "unsigned") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Unsigned profiles are disabled in production");
    return undefined;
  }
  if (mode !== "signed")
    throw new Error("UDID_TOOLS_PROFILE_SIGNING_MODE must be signed or unsigned");
  return {
    identity: {
      type: "pkcs12",
      data: { encoding: "base64", value: required("UDID_TOOLS_PROFILE_SIGNING_PKCS12_BASE64") },
      passphrase: process.env["UDID_TOOLS_PROFILE_SIGNING_PKCS12_PASSPHRASE"] ?? "",
    },
    certificateChain: splitCertificatePem(
      "UDID_TOOLS_PROFILE_SIGNING_CERTIFICATE_CHAIN_PEM",
      false
    ),
    digestAlgorithm: "sha256",
  };
}

export function profileResponseVerification(): {
  allowUnsigned: boolean;
  verification: ResponseVerificationOptions;
} {
  const mode = process.env["UDID_TOOLS_PROFILE_RESPONSE_VERIFICATION_MODE"] ?? "signature";
  if (mode === "trust-chain") {
    return {
      allowUnsigned: false,
      verification: {
        mode,
        trustAnchors: splitCertificatePem("UDID_TOOLS_PROFILE_RESPONSE_TRUST_ANCHORS_PEM", true),
        intermediates: splitCertificatePem("UDID_TOOLS_PROFILE_RESPONSE_INTERMEDIATES_PEM", false),
      },
    };
  }
  if (mode === "signature") return { allowUnsigned: false, verification: { mode } };
  if (mode === "none" && process.env.NODE_ENV !== "production")
    return { allowUnsigned: true, verification: { mode } };
  throw new Error("UDID_TOOLS_PROFILE_RESPONSE_VERIFICATION_MODE is invalid or unsafe");
}

export function profileChallengeSecret() {
  return canonicalSecret("UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64", 0x43);
}
