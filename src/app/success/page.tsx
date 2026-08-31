import type { Metadata } from "next";
import { connection } from "next/server";
import { PageShell } from "@/components/PageShell";
import { ResultView } from "@/components/success/ResultView";
import { sampleDeviceResult } from "@/lib/result";
import { decryptResultToken } from "@/lib/result-token";

export const metadata: Metadata = {
  title: "Device Information Result",
  description: "UDID Tools device information result page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

type SuccessPageProps = {
  searchParams: Promise<{ result?: string | string[] }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  await connection();
  const resultParameter = (await searchParams).result;
  const token = typeof resultParameter === "string" ? resultParameter : "";
  const sample = token === "sample";
  let result = sample ? sampleDeviceResult : null;

  if (token && !sample) {
    try {
      result = decryptResultToken(token);
    } catch {
      result = null;
    }
  }

  return (
    <PageShell>
      <ResultView result={result} sample={sample} />
    </PageShell>
  );
}
