import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { profileChallengeSecret } from "@/lib/server-config";

const VERSION = "v1";
const MAX_AGE_SECONDS = 30 * 60;
const CLOCK_SKEW_SECONDS = 60;
const TOKEN_PATTERN = /^v1\.([0-9a-z]+)\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{43})$/u;

function signature(message: string) {
  return createHmac("sha256", profileChallengeSecret()).update(message, "utf8").digest();
}

export function createProfileChallenge(now = Date.now()) {
  const timestamp = Math.floor(now / 1000).toString(36);
  const nonce = randomBytes(16).toString("base64url");
  const message = `${VERSION}.${timestamp}.${nonce}`;
  return `${message}.${signature(message).toString("base64url")}`;
}

export function verifyProfileChallenge(value: unknown, now = Date.now()) {
  if (typeof value !== "string") return false;
  const match = TOKEN_PATTERN.exec(value);
  if (!match) return false;
  const [, timestamp, nonce, providedSignature] = match;
  if (!timestamp || !nonce || !providedSignature) return false;
  const issuedAt = Number.parseInt(timestamp, 36);
  const current = Math.floor(now / 1000);
  if (
    !Number.isSafeInteger(issuedAt) ||
    issuedAt > current + CLOCK_SKEW_SECONDS ||
    current - issuedAt > MAX_AGE_SECONDS
  )
    return false;
  const expected = signature(`${VERSION}.${timestamp}.${nonce}`);
  const provided = Buffer.from(providedSignature, "base64url");
  return (
    provided.byteLength === expected.byteLength &&
    provided.toString("base64url") === providedSignature &&
    timingSafeEqual(provided, expected)
  );
}
