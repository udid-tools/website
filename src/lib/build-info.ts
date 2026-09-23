import { REPOSITORY_URL } from "@/lib/site";

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/u;
const RELEASE_TAG_PATTERN =
  /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/u;
const SHORT_COMMIT_LENGTH = 12;

export interface BuildInfoInput {
  environment?: string | undefined;
  releaseTag?: string | undefined;
  sourceSha?: string | undefined;
}

interface SharedBuildInfo {
  commitUrl: string;
  shortSourceSha: string;
  sourceSha: string;
}

export interface ProductionBuildInfo extends SharedBuildInfo {
  environment: "production";
  releaseTag: string;
  releaseUrl: string;
}

export interface PreviewBuildInfo extends SharedBuildInfo {
  environment: "preview";
}

export type BuildInfo = PreviewBuildInfo | ProductionBuildInfo;

export function resolveBuildInfo({
  environment,
  releaseTag,
  sourceSha,
}: BuildInfoInput): BuildInfo | null {
  if (environment !== "preview" && environment !== "production") return null;

  if (!sourceSha || !COMMIT_SHA_PATTERN.test(sourceSha)) {
    throw new Error(`Missing or invalid deployed source SHA for ${environment} build.`);
  }

  const shared = {
    sourceSha,
    shortSourceSha: sourceSha.slice(0, SHORT_COMMIT_LENGTH),
    commitUrl: `${REPOSITORY_URL}/commit/${sourceSha}`,
  };

  if (environment === "preview") return { environment, ...shared };

  if (!releaseTag || !RELEASE_TAG_PATTERN.test(releaseTag)) {
    throw new Error("Missing or invalid release tag for production build.");
  }

  return {
    environment,
    ...shared,
    releaseTag,
    releaseUrl: `${REPOSITORY_URL}/releases/tag/${releaseTag}`,
  };
}

export function getBuildInfo(): BuildInfo | null {
  return resolveBuildInfo({
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
    releaseTag: process.env.NEXT_PUBLIC_UDID_TOOLS_RELEASE_TAG,
    sourceSha: process.env.NEXT_PUBLIC_UDID_TOOLS_SOURCE_SHA,
  });
}
