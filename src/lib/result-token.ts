import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { DeviceResult } from "@/lib/result";

const TOKEN_VERSION = "v1";
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const MAX_TOKEN_LENGTH = 4096;
const MAX_FIELD_LENGTH = 512;
const KEY_ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/u;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/u;

type TokenPayload = {
  schema: 1;
  issuedAt: string;
  result: DeviceResult;
};

type TokenKeyring = {
  activeKeyId: string;
  keys: ReadonlyMap<string, Buffer>;
};

function decodeKey(value: string): Buffer {
  if (!/^[A-Za-z0-9+/]{43}=$/u.test(value)) throw new Error("Invalid result-token key encoding");
  const key = Buffer.from(value, "base64");
  if (key.byteLength !== 32 || key.toString("base64") !== value) {
    throw new Error("Result-token keys must be canonical base64-encoded 32-byte values");
  }
  return key;
}

function readKeyring(): TokenKeyring {
  const rawKeys = process.env["UDID_TOOLS_RESULT_TOKEN_KEYS"];
  const activeKeyId = process.env["UDID_TOOLS_RESULT_TOKEN_ACTIVE_KEY_ID"];

  if (!rawKeys || !activeKeyId) {
    if (process.env.NODE_ENV !== "production") {
      return {
        activeKeyId: "local-only",
        keys: new Map([["local-only", Buffer.alloc(32, 0x42)]]),
      };
    }
    throw new Error("Result-token keyring is not configured");
  }

  if (!KEY_ID_PATTERN.test(activeKeyId)) throw new Error("Invalid active result-token key id");
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawKeys);
  } catch {
    throw new Error("Result-token keyring must be valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Result-token keyring must be a JSON object");
  }

  const keys = new Map<string, Buffer>();
  for (const [keyId, value] of Object.entries(parsed)) {
    if (!KEY_ID_PATTERN.test(keyId) || typeof value !== "string") {
      throw new Error("Invalid result-token keyring entry");
    }
    keys.set(keyId, decodeKey(value));
  }
  if (!keys.has(activeKeyId)) throw new Error("Active result-token key is missing");
  return { activeKeyId, keys };
}

function assertDeviceResult(value: unknown): asserts value is DeviceResult {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid result payload");
  for (const field of ["udid", "imei", "meid", "product", "serial", "version"] as const) {
    const fieldValue = (value as Record<string, unknown>)[field];
    if (typeof fieldValue !== "string" || fieldValue.length > MAX_FIELD_LENGTH) {
      throw new Error("Invalid result field");
    }
  }
}

function decodePart(value: string, expectedBytes?: number): Buffer {
  if (!BASE64URL_PATTERN.test(value)) throw new Error("Invalid result token encoding");
  const decoded = Buffer.from(value, "base64url");
  if (
    decoded.toString("base64url") !== value ||
    (expectedBytes && decoded.byteLength !== expectedBytes)
  ) {
    throw new Error("Invalid result token encoding");
  }
  return decoded;
}

function additionalData(keyId: string) {
  return Buffer.from(`udid-tools-result:${TOKEN_VERSION}:${keyId}`, "utf8");
}

export function encryptResultToken(result: DeviceResult): string {
  assertDeviceResult(result);
  const keyring = readKeyring();
  const key = keyring.keys.get(keyring.activeKeyId);
  if (!key) throw new Error("Active result-token key is unavailable");

  const payload: TokenPayload = { schema: 1, issuedAt: new Date().toISOString(), result };
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(additionalData(keyring.activeKeyId));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    TOKEN_VERSION,
    keyring.activeKeyId,
    iv.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url"),
  ].join(".");
}

export function decryptResultToken(token: string): DeviceResult {
  if (!token || token.length > MAX_TOKEN_LENGTH) throw new Error("Invalid result token");
  const [version, keyId, ivPart, ciphertextPart, tagPart, ...extra] = token.split(".");
  if (
    version !== TOKEN_VERSION ||
    !keyId ||
    !KEY_ID_PATTERN.test(keyId) ||
    !ivPart ||
    !ciphertextPart ||
    !tagPart ||
    extra.length
  ) {
    throw new Error("Invalid result token");
  }

  const key = readKeyring().keys.get(keyId);
  if (!key) throw new Error("Unknown result-token key");
  const decipher = createDecipheriv(ALGORITHM, key, decodePart(ivPart, IV_BYTES));
  decipher.setAAD(additionalData(keyId));
  decipher.setAuthTag(decodePart(tagPart, TAG_BYTES));
  const plaintext = Buffer.concat([decipher.update(decodePart(ciphertextPart)), decipher.final()]);

  let payload: unknown;
  try {
    payload = JSON.parse(plaintext.toString("utf8"));
  } catch {
    throw new Error("Invalid result-token payload");
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    (payload as TokenPayload).schema !== 1 ||
    typeof (payload as TokenPayload).issuedAt !== "string"
  ) {
    throw new Error("Unsupported result-token payload");
  }
  assertDeviceResult((payload as TokenPayload).result);
  return (payload as TokenPayload).result;
}
