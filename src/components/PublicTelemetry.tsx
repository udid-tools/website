"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

export function PublicTelemetry() {
  const pathname = usePathname();
  if (pathname === "/success") return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
