"use client";

import { Check, Copy, Cpu, Fingerprint, Hash, Layers, Smartphone, Wifi } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Motion } from "@/components/Motion";
import { writeClipboard } from "@/utils/clipboard";

const icons = {
  udid: Fingerprint,
  model: Smartphone,
  version: Layers,
  serial: Hash,
  product: Cpu,
  imei: Wifi,
};

type DeviceInfoCardProps = {
  label: string;
  value: string;
  copyValue?: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  type: keyof typeof icons;
  primary?: boolean;
  onCopy: (details: {
    fieldLabel: string;
    fieldType: string;
    outcome: "success" | "failure";
  }) => void;
};

export function DeviceInfoCard({
  label,
  value,
  copyValue,
  secondaryLabel,
  secondaryValue,
  type,
  primary = false,
  onCopy,
}: DeviceInfoCardProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [feedbackRevision, setFeedbackRevision] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = icons[type];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  async function copy() {
    const copied = await writeClipboard(copyValue ?? value);
    setStatus(copied ? "copied" : "failed");
    setFeedbackRevision((previous) => previous + 1);
    onCopy({ fieldLabel: label, fieldType: type, outcome: copied ? "success" : "failure" });
    if (timer.current) clearTimeout(timer.current);
    if (copied) timer.current = setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <Motion
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-5 transition-all ${primary ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm shadow-blue-100/50" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      {primary && (
        <div className="absolute -top-2.5 left-4 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase">
          Primary
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 basis-24 flex-wrap items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${primary ? "bg-blue-100" : "bg-slate-100"}`}
          >
            <Icon
              className={`h-5 w-5 ${primary ? "text-blue-600" : "text-slate-500"}`}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium tracking-wider text-slate-500 uppercase">
              {label}
            </p>
            <p
              className={`font-mono text-sm break-all ${primary ? "font-semibold text-blue-900" : "text-slate-800"}`}
            >
              {value || "Not provided"}
            </p>
            {secondaryValue && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                {secondaryLabel && (
                  <>
                    <span className="font-medium tracking-wide text-slate-600 uppercase">
                      {secondaryLabel}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />
                  </>
                )}
                <span className="font-mono text-slate-600">{secondaryValue}</span>
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${status === "copied" ? "bg-green-100 text-green-700" : status === "failed" ? "bg-red-100 text-red-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-600"}`}
          aria-label={`Copy ${label}`}
        >
          {status === "copied" ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      <p
        className={status === "failed" ? "mt-3 text-sm text-red-700" : "sr-only"}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span key={feedbackRevision}>
          {status === "copied"
            ? `${label} copied to clipboard`
            : status === "failed"
              ? `Copy failed for ${label}. Select the value above and copy it manually.`
              : ""}
        </span>
      </p>
    </Motion>
  );
}
