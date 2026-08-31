"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";
import { DESKTOP_QR_EVENT } from "@/lib/site";

export function QrAttributionTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("utm_source") === "desktop_qr" && params.get("utm_medium") === "qr") {
      track(DESKTOP_QR_EVENT, { campaign: params.get("utm_campaign") ?? "desktop_to_mobile" });
    }
  }, []);
  return null;
}
