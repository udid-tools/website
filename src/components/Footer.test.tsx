import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "@/components/Footer";

const SOURCE_SHA = "0123456789abcdef0123456789abcdef01234567";
const environmentNames = [
  "NEXT_PUBLIC_UDID_TOOLS_RELEASE_TAG",
  "NEXT_PUBLIC_UDID_TOOLS_SOURCE_SHA",
  "NEXT_PUBLIC_VERCEL_ENV",
] as const;
const mutableEnvironment = process.env as Record<string, string | undefined>;
const originalEnvironment = Object.fromEntries(
  environmentNames.map((name) => [name, mutableEnvironment[name]])
) as Record<(typeof environmentNames)[number], string | undefined>;

function restoreEnvironment() {
  for (const name of environmentNames) {
    const value = originalEnvironment[name];
    if (value === undefined) delete mutableEnvironment[name];
    else mutableEnvironment[name] = value;
  }
}

function setBuildEnvironment(environment?: "preview" | "production", releaseTag?: string) {
  if (environment === undefined) delete mutableEnvironment["NEXT_PUBLIC_VERCEL_ENV"];
  else mutableEnvironment["NEXT_PUBLIC_VERCEL_ENV"] = environment;

  if (environment === undefined) delete mutableEnvironment["NEXT_PUBLIC_UDID_TOOLS_SOURCE_SHA"];
  else mutableEnvironment["NEXT_PUBLIC_UDID_TOOLS_SOURCE_SHA"] = SOURCE_SHA;

  if (releaseTag === undefined) delete mutableEnvironment["NEXT_PUBLIC_UDID_TOOLS_RELEASE_TAG"];
  else mutableEnvironment["NEXT_PUBLIC_UDID_TOOLS_RELEASE_TAG"] = releaseTag;
}

afterEach(restoreEnvironment);

describe("Footer", () => {
  it("renders production release and immutable commit links", () => {
    setBuildEnvironment("production", "v1.2.3");

    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("Deployed source:");
    expect(html).toContain("https://github.com/udid-tools/website/releases/tag/v1.2.3");
    expect(html).toContain(`https://github.com/udid-tools/website/commit/${SOURCE_SHA}`);
    expect(html).toContain("commit <code");
    expect(html).toContain("0123456789ab");
    expect(html).toContain(`View source commit ${SOURCE_SHA} on GitHub`);
    expect(html).toContain('aria-label="Footer navigation"');
  });

  it("renders only the exact commit for preview deployments", () => {
    setBuildEnvironment("preview", "v1.2.3");

    const html = renderToStaticMarkup(<Footer />);

    expect(html).toContain("Preview source:");
    expect(html).toContain(`https://github.com/udid-tools/website/commit/${SOURCE_SHA}`);
    expect(html).not.toContain("Deployed source:");
    expect(html).not.toContain("/releases/tag/");
  });

  it("does not show a source claim for local builds", () => {
    setBuildEnvironment();

    const html = renderToStaticMarkup(<Footer />);

    expect(html).not.toContain("Deployed source:");
    expect(html).not.toContain("Preview source:");
  });
});
