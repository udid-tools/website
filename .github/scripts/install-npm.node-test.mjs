import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import process from "node:process";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, URL } from "node:url";
import {
  MAX_ARCHIVE_BYTES,
  downloadArchive,
  installedVersion,
  installNpm,
  installVerifiedArchive,
  main,
} from "./install-npm.mjs";

const archive = Buffer.from("synthetic npm archive used only for integrity tests");
const configuration = {
  version: "11.19.0",
  url: "https://registry.npmjs.org/npm/-/npm-11.19.0.tgz",
  integrity: `sha512-${createHash("sha512").update(archive).digest("base64")}`,
};

await test("a tampered archive cannot reach the package installer", async () => {
  let installed = false;
  await assert.rejects(
    installNpm(configuration, "npm@11.19.0", {
      download: () => Promise.resolve(Buffer.from("tampered archive")),
      install: () => {
        installed = true;
      },
    }),
    /integrity verification/
  );
  assert.equal(installed, false);
});

await test("invalid pins are rejected before downloading or executing anything", async () => {
  const download = () => assert.fail("invalid configuration reached the network");
  for (const [pin, manager] of [
    [configuration, "npm@11.18.0"],
    [{ ...configuration, version: "11.19.0;unexpected" }, "npm@11.19.0"],
    [{ ...configuration, url: "https://example.com/npm.tgz" }, "npm@11.19.0"],
    [{ ...configuration, integrity: "sha512-invalid" }, "npm@11.19.0"],
  ]) {
    await assert.rejects(installNpm(pin, manager, { download }));
  }
});

await test("a verified archive installs and must report the pinned version", async () => {
  let installed;
  const operations = {
    download: () => Promise.resolve(archive),
    install: (bytes) => {
      installed = bytes;
    },
    version: () => "11.19.0",
  };
  await installNpm(configuration, "npm@11.19.0", operations);
  assert.deepEqual(installed, archive);
  await assert.rejects(
    installNpm(configuration, "npm@11.19.0", {
      ...operations,
      version: () => "11.18.0",
    }),
    /does not match/
  );
});

await test("downloads reject redirects and bound both declared and streamed sizes", async () => {
  const result = await downloadArchive(configuration.url, (_url, options) => {
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof globalThis.AbortSignal);
    return Promise.resolve(
      new globalThis.Response(archive, {
        headers: { "content-length": String(archive.byteLength) },
      })
    );
  });
  assert.deepEqual(result, archive);
  for (const response of [
    new globalThis.Response(null, { status: 404 }),
    new globalThis.Response(null),
    new globalThis.Response(archive, {
      headers: { "content-length": String(MAX_ARCHIVE_BYTES + 1) },
    }),
    new globalThis.Response(archive, { headers: { "content-length": "invalid" } }),
    new globalThis.Response(new Uint8Array(MAX_ARCHIVE_BYTES + 1)),
    new globalThis.Response(new Uint8Array()),
  ]) {
    await assert.rejects(downloadArchive(configuration.url, () => Promise.resolve(response)));
  }
  await assert.rejects(
    downloadArchive(configuration.url, () => Promise.reject(new Error("network failure"))),
    /network failure/
  );
});

await test("installation uses only the verified local archive and always removes it", async () => {
  for (const status of [0, 1, null]) {
    let archivePath;
    const execute = (command, args, options) => {
      assert.equal(command, "npm");
      archivePath = args[2];
      assert.deepEqual(readFileSync(archivePath), archive);
      assert.ok(args.includes("--ignore-scripts"));
      assert.ok(args.includes("--offline"));
      assert.ok(args.includes("--no-audit"));
      assert.equal(options.shell, false);
      return { status, error: status === null ? new Error("spawn failure") : undefined };
    };
    if (status === 0) await installVerifiedArchive(archive, execute);
    else await assert.rejects(installVerifiedArchive(archive, execute), /could not be installed/);
    assert.equal(existsSync(dirname(archivePath)), false);
  }
  let directory;
  await assert.rejects(
    installVerifiedArchive(archive, (_command, args) => {
      directory = dirname(args[2]);
      throw new Error("unexpected process failure");
    }),
    /unexpected process failure/
  );
  assert.equal(existsSync(directory), false);
});

await test("version checks reject failed processes and normalize successful output", () => {
  assert.equal(
    installedVersion(() => ({ status: 0, stdout: "11.19.0\n" })),
    "11.19.0"
  );
  assert.throws(() => installedVersion(() => ({ status: 1 })), /could not be checked/);
  assert.throws(
    () => installedVersion(() => ({ error: new Error("spawn failure") })),
    /could not be checked/
  );
});

await test("the committed official archive pin agrees with the root package manager", async () => {
  await main((pin, manager) => {
    assert.equal(manager, `npm@${pin.version}`);
    assert.equal(pin.url, `https://registry.npmjs.org/npm/-/npm-${pin.version}.tgz`);
    assert.match(pin.integrity, /^sha512-[A-Za-z0-9+/]{86}==$/);
  });
});

await test("the default install flow verifies the download before invoking npm", async () => {
  const directory = await mkdtemp(join(tmpdir(), "udid-tools-npm-test-"));
  const originalFetch = globalThis.fetch;
  const originalPath = process.env.PATH;
  try {
    await writeFile(
      join(directory, "npm"),
      '#!/usr/bin/env node\nif (process.argv[2] === "--version") process.stdout.write("11.19.0\\n");\n',
      { mode: 0o700 }
    );
    process.env.PATH = `${directory}:${originalPath}`;
    globalThis.fetch = () => Promise.resolve(new globalThis.Response(archive));
    await installNpm(configuration, "npm@11.19.0");
  } finally {
    globalThis.fetch = originalFetch;
    process.env.PATH = originalPath;
    await rm(directory, { recursive: true, force: true });
  }
});

await test("the real CLI fails closed when its archive download fails", async () => {
  const directory = await mkdtemp(join(tmpdir(), "udid-tools-npm-cli-test-"));
  try {
    const preload = join(directory, "offline.mjs");
    await writeFile(
      preload,
      'globalThis.fetch = () => Promise.reject(new Error("synthetic offline failure"));\n'
    );
    const result = spawnSync(
      process.execPath,
      ["--import", preload, fileURLToPath(new URL("./install-npm.mjs", import.meta.url))],
      { encoding: "utf8" }
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /synthetic offline failure/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

await test("importing the installer without a CLI argument has no side effects", () => {
  const installer = new URL("./install-npm.mjs", import.meta.url).href;
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'globalThis.fetch = () => { throw new Error("unexpected download"); }; await import(process.env.UDID_NPM_INSTALLER_TEST_MODULE);',
    ],
    { encoding: "utf8", env: { ...process.env, UDID_NPM_INSTALLER_TEST_MODULE: installer } }
  );
  assert.equal(result.status, 0, result.stderr);
});

await test("the real CLI completes with a verified synthetic archive and isolated npm", async () => {
  const directory = await mkdtemp(join(tmpdir(), "udid-tools-npm-cli-success-"));
  try {
    const preload = join(directory, "verified.mjs");
    const metadataUrl = new URL("../npm-toolchain.json", import.meta.url).href;
    await writeFile(
      preload,
      `
      import fs from "node:fs/promises";
      import { syncBuiltinESMExports } from "node:module";
      const originalRead = fs.readFile;
      fs.readFile = (path, ...args) => String(path) === process.env.UDID_NPM_TEST_METADATA_URL
        ? Promise.resolve(process.env.UDID_NPM_TEST_PIN)
        : originalRead(path, ...args);
      syncBuiltinESMExports();
      globalThis.fetch = () => Promise.resolve(new Response(Buffer.from(process.env.UDID_NPM_TEST_ARCHIVE, "base64")));
    `
    );
    await writeFile(
      join(directory, "npm"),
      '#!/usr/bin/env node\nif (process.argv[2] === "--version") process.stdout.write("11.19.0\\n");\n',
      { mode: 0o700 }
    );
    const result = spawnSync(
      process.execPath,
      ["--import", preload, fileURLToPath(new URL("./install-npm.mjs", import.meta.url))],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          UDID_NPM_TEST_METADATA_URL: metadataUrl,
          UDID_NPM_TEST_PIN: JSON.stringify(configuration),
          UDID_NPM_TEST_ARCHIVE: archive.toString("base64"),
        },
      }
    );
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
