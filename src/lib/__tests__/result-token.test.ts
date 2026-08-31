import { createCipheriv, randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptResultToken, encryptResultToken } from "@/lib/result-token";
import { sampleDeviceResult } from "@/lib/result";

const originalKeys = process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"];
const originalActiveKey = process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"];
const firstKey = Buffer.alloc(32, 1).toString("base64");
const secondKey = Buffer.alloc(32, 2).toString("base64");

function encryptedPayload(payload: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(firstKey, "base64"), iv);
  cipher.setAAD(Buffer.from("udid-tools-result:v1:current", "utf8"));
  const ciphertext = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return `v1.current.${iv.toString("base64url")}.${ciphertext.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}`;
}

describe("result tokens", () => {
  beforeEach(() => {
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = JSON.stringify({ current: firstKey });
    process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"] = "current";
  });

  afterEach(() => {
    if (originalKeys === undefined) delete process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"];
    else process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = originalKeys;
    if (originalActiveKey === undefined)
      delete process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"];
    else process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"] = originalActiveKey;
  });

  it("round-trips device data without exposing it in the token", () => {
    const token = encryptResultToken(sampleDeviceResult);
    expect(token).toMatch(/^v1\.current\./u);
    expect(token).not.toContain(sampleDeviceResult.udid);
    expect(decryptResultToken(token)).toEqual(sampleDeviceResult);
  });

  it("rejects authenticated ciphertext tampering", () => {
    const token = encryptResultToken(sampleDeviceResult);
    const parts = token.split(".");
    const ciphertext = parts[3];
    expect(ciphertext).toBeDefined();
    if (!ciphertext) throw new Error("Expected token ciphertext");
    parts[3] = `${ciphertext.slice(0, -1)}${ciphertext.endsWith("A") ? "B" : "A"}`;
    expect(() => decryptResultToken(parts.join("."))).toThrow();
  });

  it("keeps old tokens readable during key rotation", () => {
    const oldToken = encryptResultToken(sampleDeviceResult);
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = JSON.stringify({
      current: firstKey,
      next: secondKey,
    });
    process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"] = "next";
    const newToken = encryptResultToken(sampleDeviceResult);
    expect(newToken).toMatch(/^v1\.next\./u);
    expect(decryptResultToken(oldToken)).toEqual(sampleDeviceResult);
  });

  it("rejects malformed keyrings and oversized fields", () => {
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = "not-json";
    expect(() => encryptResultToken(sampleDeviceResult)).toThrow(/valid JSON/u);
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = JSON.stringify({ current: firstKey });
    expect(() => encryptResultToken({ ...sampleDeviceResult, udid: "x".repeat(513) })).toThrow();
  });

  it("uses a development-only key when no keyring is configured", () => {
    delete process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"];
    delete process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"];
    const token = encryptResultToken(sampleDeviceResult);
    expect(token).toMatch(/^v1\.local-only\./u);
    expect(decryptResultToken(token)).toEqual(sampleDeviceResult);
  });

  it.each([
    ["invalid active id", JSON.stringify({ current: firstKey }), "invalid id"],
    ["non-object keyring", "[]", "current"],
    ["non-string key", JSON.stringify({ current: 123 }), "current"],
    ["invalid key encoding", JSON.stringify({ current: "invalid" }), "current"],
    ["missing active key", JSON.stringify({ other: firstKey }), "current"],
  ])("rejects %s", (_name, keys, active) => {
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = keys;
    process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"] = active;
    expect(() => encryptResultToken(sampleDeviceResult)).toThrow();
  });

  it.each([
    "",
    "x".repeat(4097),
    "v2.current.a.b.c",
    "v1.current.a.b.c.extra",
    "v1.current.!.b.c",
    "v1.current.YQ.Yg.Yw",
  ])("rejects malformed token", (token) => {
    expect(() => decryptResultToken(token)).toThrow();
  });

  it("rejects tokens encrypted by an unknown rotated key", () => {
    const token = encryptResultToken(sampleDeviceResult).replace("v1.current.", "v1.retired.");
    expect(() => decryptResultToken(token)).toThrow(/Unknown/u);
  });

  it("rejects authenticated invalid JSON and unsupported payload schemas", () => {
    expect(() => decryptResultToken(encryptedPayload("not-json"))).toThrow(/payload/u);
    expect(() =>
      decryptResultToken(
        encryptedPayload(JSON.stringify({ schema: 2, issuedAt: "now", result: sampleDeviceResult }))
      )
    ).toThrow(/Unsupported/u);
    expect(() =>
      decryptResultToken(
        encryptedPayload(
          JSON.stringify({
            schema: 1,
            issuedAt: "now",
            result: { ...sampleDeviceResult, udid: 42 },
          })
        )
      )
    ).toThrow(/field/u);
  });
});
