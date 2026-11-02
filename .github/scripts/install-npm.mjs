import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash, timingSafeEqual } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";

export const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;

export function validateConfiguration(configuration, packageManager) {
  const { version, url, integrity } = configuration;
  if (!/^\d+\.\d+\.\d+$/.test(version) || packageManager !== `npm@${version}`) {
    throw new Error("The pinned npm version must match packageManager.");
  }
  if (url !== `https://registry.npmjs.org/npm/-/npm-${version}.tgz`) {
    throw new Error("The npm archive must use its exact official registry URL.");
  }
  if (!/^sha512-[A-Za-z0-9+/]{86}==$/.test(integrity)) {
    throw new Error("The npm archive must have a pinned SHA-512 integrity value.");
  }
}

export async function downloadArchive(url, fetchArchive = globalThis.fetch) {
  const response = await fetchArchive(url, {
    redirect: "error",
    signal: globalThis.AbortSignal.timeout(60_000),
  });
  if (!response.ok || !response.body) {
    throw new Error("The official npm archive download failed.");
  }
  const declaredSize = response.headers.get("content-length");
  if (
    declaredSize !== null &&
    (!/^\d+$/.test(declaredSize) || Number(declaredSize) > MAX_ARCHIVE_BYTES)
  ) {
    throw new Error("The npm archive exceeds the download limit.");
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += Number(chunk.byteLength);
    if (size > MAX_ARCHIVE_BYTES) {
      throw new Error("The npm archive exceeds the download limit.");
    }
    chunks.push(chunk);
  }
  if (size === 0) throw new Error("The npm archive is empty.");
  return Buffer.concat(chunks, size);
}

export function verifyArchive(archive, integrity) {
  const expected = Buffer.from(integrity.slice("sha512-".length), "base64");
  const actual = createHash("sha512").update(archive).digest();
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new Error("The npm archive failed SHA-512 integrity verification.");
  }
}

export async function installVerifiedArchive(archive, execute = spawnSync) {
  const directory = await mkdtemp(join(tmpdir(), "udid-tools-npm-"));
  try {
    const archivePath = join(directory, "npm.tgz");
    await writeFile(archivePath, archive, { mode: 0o600 });
    const result = execute(
      "npm",
      [
        "install",
        "--global",
        archivePath,
        "--ignore-scripts",
        "--offline",
        "--no-audit",
        "--no-fund",
      ],
      { shell: false, stdio: "inherit" }
    );
    if (result.error || result.status !== 0)
      throw new Error("The verified npm archive could not be installed.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export function installedVersion(execute = spawnSync) {
  const result = execute("npm", ["--version"], { shell: false, encoding: "utf8" });
  if (result.error || result.status !== 0)
    throw new Error("The installed npm version could not be checked.");
  return result.stdout.trim();
}

export async function installNpm(configuration, packageManager, operations = {}) {
  validateConfiguration(configuration, packageManager);
  const archive = await (operations.download ?? downloadArchive)(configuration.url);
  verifyArchive(archive, configuration.integrity);
  await (operations.install ?? installVerifiedArchive)(archive);
  if ((operations.version ?? installedVersion)() !== configuration.version) {
    throw new Error("The installed npm version does not match the pinned version.");
  }
}

export async function main(install = installNpm) {
  const configuration = JSON.parse(
    await readFile(new URL("../npm-toolchain.json", import.meta.url), "utf8")
  );
  const { packageManager } = JSON.parse(
    await readFile(new URL("../../package.json", import.meta.url), "utf8")
  );
  await install(configuration, packageManager);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await main();
}
