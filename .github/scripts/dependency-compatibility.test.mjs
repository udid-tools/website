import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const sentryDirectory = dirname(require.resolve("@sentry/bundler-plugins/core"));
const sentryRequire = createRequire(join(sentryDirectory, "glob.js"));
const { globFiles } = require(join(sentryDirectory, "glob.js"));
const nextDirectory = dirname(require.resolve("@next/eslint-plugin-next"));
const nextRequire = createRequire(join(nextDirectory, "utils/get-root-dirs.js"));
const { getRootDirs } = require(join(nextDirectory, "utils/get-root-dirs.js"));
const parserRequire = createRequire(require.resolve("@typescript-eslint/typescript-estree"));

describe("patched build dependency compatibility", () => {
  let directory;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "udid-tools-build-dependencies-"));
    await mkdir(join(directory, "app"));
    await mkdir(join(directory, "pages"));
    await writeFile(join(directory, "app", "page.tsx"), "export default function Page() {}\n");
    await writeFile(join(directory, "pages", "index.tsx"), "export default function Page() {}\n");
  });

  afterAll(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it("preserves the Sentry bundler's asynchronous glob API and exclusion options", async () => {
    expect(sentryRequire("glob/package.json").version).toBe("14.0.3");
    const matches = await globFiles("**/*.tsx", {
      cwd: directory,
      ignore: ["pages/**"],
    });
    expect(matches).toEqual([join(directory, "app", "page.tsx")]);
  });

  it("resolves root directory patterns through the actual Next lint helper", () => {
    expect(nextRequire("glob/package.json").version).toBe("14.0.3");
    const roots = getRootDirs({
      getCwd: () => directory,
      settings: { next: { rootDir: join(directory, "{app,pages}") } },
    });
    expect(roots.map((path) => path.replace(/\/$/, "")).sort()).toEqual(
      [join(directory, "app"), join(directory, "pages")].sort()
    );
  });

  it("keeps the TypeScript parser's modern minimatch call and dotfile behavior", () => {
    expect(parserRequire("minimatch/package.json").version).toBe("11.0.4");
    const { minimatch } = parserRequire("minimatch");
    expect(minimatch(".config.ts", "*.ts", { dot: true })).toBe(true);
    expect(minimatch("nested/config.ts", "*.ts", { dot: true })).toBe(false);
  });
});
