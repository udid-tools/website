import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createProfileChallenge, verifyProfileChallenge } from "@/lib/profile-challenge";

const originalSecret = process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"];

describe("profile challenges", () => {
  beforeEach(() => {
    process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"] = Buffer.alloc(32, 3).toString(
      "base64"
    );
  });

  afterEach(() => {
    if (originalSecret === undefined)
      delete process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"];
    else process.env["UDID_TOOLS_PROFILE_CHALLENGE_SECRET_BASE64"] = originalSecret;
  });

  it("accepts a fresh stateless challenge", () => {
    const now = Date.UTC(2026, 7, 31, 12);
    expect(verifyProfileChallenge(createProfileChallenge(now), now)).toBe(true);
  });

  it("rejects expired and future challenges", () => {
    const issuedAt = Date.UTC(2026, 7, 31, 12);
    const challenge = createProfileChallenge(issuedAt);
    expect(verifyProfileChallenge(challenge, issuedAt + 31 * 60 * 1000)).toBe(false);
    expect(verifyProfileChallenge(createProfileChallenge(issuedAt + 2 * 60 * 1000), issuedAt)).toBe(
      false
    );
  });

  it("rejects tampering and malformed values", () => {
    const now = Date.UTC(2026, 7, 31, 12);
    const challenge = createProfileChallenge(now);
    const replacement = challenge.endsWith("A") ? "B" : "A";
    expect(verifyProfileChallenge(`${challenge.slice(0, -1)}${replacement}`, now)).toBe(false);
    expect(verifyProfileChallenge("legacy-challenge", now)).toBe(false);
    expect(verifyProfileChallenge(undefined, now)).toBe(false);
  });
});
