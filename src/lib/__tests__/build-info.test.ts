import { describe, expect, it } from "vitest";
import { resolveBuildInfo } from "@/lib/build-info";

const SOURCE_SHA = "0123456789abcdef0123456789abcdef01234567";

describe("resolveBuildInfo", () => {
  it("returns no metadata for local and test environments", () => {
    expect(resolveBuildInfo({})).toBeNull();
    expect(
      resolveBuildInfo({ environment: "development", releaseTag: "invalid", sourceSha: "invalid" })
    ).toBeNull();
  });

  it("creates preview metadata with an immutable commit URL", () => {
    expect(
      resolveBuildInfo({
        environment: "preview",
        releaseTag: "v9.9.9",
        sourceSha: SOURCE_SHA,
      })
    ).toEqual({
      environment: "preview",
      sourceSha: SOURCE_SHA,
      shortSourceSha: "0123456789ab",
      commitUrl: `https://github.com/udid-tools/website/commit/${SOURCE_SHA}`,
    });
  });

  it("creates production metadata with release and commit URLs", () => {
    expect(
      resolveBuildInfo({
        environment: "production",
        releaseTag: "v1.2.3-beta.4",
        sourceSha: SOURCE_SHA,
      })
    ).toEqual({
      environment: "production",
      sourceSha: SOURCE_SHA,
      shortSourceSha: "0123456789ab",
      commitUrl: `https://github.com/udid-tools/website/commit/${SOURCE_SHA}`,
      releaseTag: "v1.2.3-beta.4",
      releaseUrl: "https://github.com/udid-tools/website/releases/tag/v1.2.3-beta.4",
    });
  });

  it.each([undefined, "", "abc", SOURCE_SHA.toUpperCase(), `${SOURCE_SHA}extra`])(
    "rejects an invalid deployed source SHA: %s",
    (sourceSha) => {
      expect(() => resolveBuildInfo({ environment: "preview", sourceSha })).toThrow(
        "Missing or invalid deployed source SHA for preview build."
      );
    }
  );

  it.each([undefined, "", "1.2.3", "v1.2", "v1.2.3/../../settings", "v01.2.3"])(
    "rejects an invalid production release tag: %s",
    (releaseTag) => {
      expect(() =>
        resolveBuildInfo({ environment: "production", releaseTag, sourceSha: SOURCE_SHA })
      ).toThrow("Missing or invalid release tag for production build.");
    }
  );
});
