import { Buffer } from "node:buffer";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fc from "fast-check";
import { createProfileChallenge, verifyProfileChallenge } from "@/lib/profile-challenge";
import type { DeviceResult } from "@/lib/result";
import { decryptResultToken, encryptResultToken } from "@/lib/result-token";

const originalChallengeSecret = process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"];
const originalResultKeys = process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"];
const originalActiveKey = process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"];
const resultKey = Buffer.alloc(32, 0x5a).toString("base64");
const fuzzRuns = Number.parseInt(process.env["UDID_TOOLS_FUZZ_RUNS"] ?? "1000", 10);

if (!Number.isSafeInteger(fuzzRuns) || fuzzRuns < 1 || fuzzRuns > 100_000) {
  throw new Error("UDID_TOOLS_FUZZ_RUNS must be an integer between 1 and 100000");
}

const resultFieldArbitrary = fc.oneof(
  fc.string({ maxLength: 512 }),
  fc.string({ minLength: 512, maxLength: 512 })
);

const deviceResultArbitrary = fc.record({
  imei: resultFieldArbitrary,
  meid: resultFieldArbitrary,
  product: resultFieldArbitrary,
  serial: resultFieldArbitrary,
  udid: resultFieldArbitrary,
  version: resultFieldArbitrary,
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function encryptWithinLimit(result: DeviceResult) {
  try {
    return encryptResultToken(result);
  } catch (error) {
    expect(error).toMatchObject({ message: "Result token exceeds maximum length" });
    return null;
  }
}

describe("property-based security boundaries", () => {
  beforeAll(() => {
    process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"] = Buffer.alloc(32, 0x43).toString(
      "base64"
    );
    process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"] = JSON.stringify({ fuzz: resultKey });
    process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"] = "fuzz";
  });

  afterAll(() => {
    restore("UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64", originalChallengeSecret);
    restore("UDID_TOOLS_RESULT_TOKEN_KEYS", originalResultKeys);
    restore("UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID", originalActiveKey);
  });

  it("round-trips every token it emits and explicitly rejects oversized results", () => {
    fc.assert(
      fc.property(deviceResultArbitrary, (result) => {
        const token = encryptWithinLimit(result);
        if (token === null) return;
        expect(token.length).toBeLessThanOrEqual(4_096);
        expect(decryptResultToken(token)).toEqual(result);
      }),
      { numRuns: fuzzRuns }
    );
  });

  it("rejects arbitrary one-byte token mutations", () => {
    fc.assert(
      fc.property(deviceResultArbitrary, fc.nat(), (result, seed) => {
        const token = encryptWithinLimit(result);
        if (token === null) return;
        const index = seed % token.length;
        const replacement = token[index] === "A" ? "B" : "A";
        const mutated = `${token.slice(0, index)}${replacement}${token.slice(index + 1)}`;
        expect(() => decryptResultToken(mutated)).toThrow();
      }),
      { numRuns: fuzzRuns }
    );
  });

  it("rejects arbitrary malformed profile challenges without throwing", () => {
    const malformedChallenge = fc.oneof(
      fc.string().map((value) => `fuzz:${value}`),
      fc.integer(),
      fc.array(fc.jsonValue()),
      fc.dictionary(fc.string(), fc.jsonValue())
    );

    fc.assert(
      fc.property(malformedChallenge, fc.integer(), (value, now) => {
        expect(verifyProfileChallenge(value, now)).toBe(false);
      }),
      { numRuns: fuzzRuns * 2 }
    );
  });

  it("rejects arbitrary mutations of fresh profile challenges", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 4_102_444_800_000 }), fc.nat(), (now, seed) => {
        const challenge = createProfileChallenge(now);
        const index = seed % challenge.length;
        const replacement = challenge[index] === "A" ? "B" : "A";
        const mutated = `${challenge.slice(0, index)}${replacement}${challenge.slice(index + 1)}`;
        expect(verifyProfileChallenge(mutated, now)).toBe(false);
      }),
      { numRuns: fuzzRuns }
    );
  });
});
