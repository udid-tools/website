"use client";

import { formatOsVersion, getDeviceModelName } from "@udid-tools/device-info";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  Copy,
  Info,
  Share2,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceInfoCard } from "@/components/success/DeviceInfoCard";
import { Motion } from "@/components/Motion";
import type { DeviceResult } from "@/lib/result";
import { hasDeviceResult } from "@/lib/result";
import { writeClipboard } from "@/utils/clipboard";

type ResultViewProps = { result: DeviceResult | null; sample: boolean };
type AnalyticsAttributes = Record<string, boolean | number | string>;

const buttonClass =
  "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50";

export function ResultView({ result, sample }: ResultViewProps) {
  const data: DeviceResult = result ?? {
    udid: "",
    imei: "",
    meid: "",
    product: "",
    serial: "",
    version: "",
  };
  const hasData = hasDeviceResult(data);
  const [copiedFormat, setCopiedFormat] = useState<"txt" | "json" | null>(null);
  const [feedback, setFeedback] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fields = [
    { label: "UDID", key: "UDID", value: data.udid },
    { label: "IMEI", key: "IMEI", value: data.imei },
    { label: "MEID", key: "MEID", value: data.meid },
    { label: "PRODUCT", key: "PRODUCT", value: data.product },
    { label: "SERIAL", key: "SERIAL", value: data.serial },
    { label: "VERSION", key: "VERSION", value: data.version },
  ];
  const presentFields = fields.filter((field) => field.value);
  const model = getDeviceModelName(data.product) ?? data.product;
  const osVersion = formatOsVersion({ productIdentifier: data.product, build: data.version });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const temporaryFeedback = (message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setFeedback(message);
    timer.current = setTimeout(() => setFeedback(""), 3000);
  };

  const track = useCallback(
    (eventName: string, attributes: AnalyticsAttributes = {}) => {
      void fetch("/api/analytics/result-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          field_count: presentFields.length,
          has_device_info: hasData,
          result_source: sample ? "sample" : "profile",
          ...attributes,
        }),
        keepalive: true,
        referrerPolicy: "no-referrer",
      }).catch(() => undefined);
    },
    [hasData, presentFields.length, sample]
  );

  useEffect(() => {
    track("result_page_viewed", {
      outcome: hasData ? "success" : "missing_device_info",
      share_available: "share" in navigator,
    });
  }, [hasData, track]);

  const text = (includeEmpty = false) =>
    (includeEmpty ? fields : presentFields)
      .map((field) => `${field.label}: ${field.value || "-"}`)
      .join("\n");

  async function copyAll(format: "txt" | "json") {
    const value =
      format === "json"
        ? JSON.stringify(
            Object.fromEntries(presentFields.map((field) => [field.key, field.value])),
            null,
            2
          )
        : text();
    const copied = await writeClipboard(value);
    if (copied) {
      setCopiedFormat(format);
      temporaryFeedback(`All device info${format === "json" ? " (JSON)" : ""} copied`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } else temporaryFeedback("Copy failed. Please copy manually.");
    track("result_page_action", {
      action: "copy_all",
      format,
      outcome: copied ? "success" : "failure",
    });
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text(true)], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "device-info.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    track("result_page_action", { action: "download", format: "txt", outcome: "success" });
  }

  async function share() {
    if (!navigator.share) {
      const copied = await writeClipboard(text(true));
      temporaryFeedback(
        copied
          ? "Native sharing is unavailable, so device info was copied"
          : "Sharing is unavailable in this browser. Please copy manually."
      );
      track("result_page_action", {
        action: "share",
        outcome: copied ? "copied_fallback" : "unavailable",
        share_available: false,
      });
      return;
    }
    try {
      await navigator.share({ title: "Device info", text: text(true) });
      track("result_page_action", { action: "share", outcome: "success", share_available: true });
    } catch {
      track("result_page_action", { action: "share", outcome: "dismissed", share_available: true });
    }
  }

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
        {hasData && sample && (
          <Motion
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Sample result preview</p>
              <p className="text-sm text-blue-700">
                The details below show an example of the information we receive from a device.
              </p>
            </div>
          </Motion>
        )}
        <Motion
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 flex items-center gap-3 rounded-xl border p-4 ${hasData ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${hasData ? "bg-green-100" : "bg-red-100"}`}
          >
            {hasData ? (
              <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" aria-hidden="true" />
            )}
          </div>
          <div>
            {hasData ? (
              <>
                <p className="font-medium text-green-900">Device information retrieved</p>
                <p className="text-sm text-green-700">
                  All data was successfully extracted from your device
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-red-900">Unable to retrieve device info</p>
                <p className="text-sm text-red-700">Please try installing the profile again</p>
              </>
            )}
          </div>
        </Motion>
        <Motion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Smartphone className="h-5 w-5 text-slate-600" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Your Device Information</h1>
                <p className="text-sm text-slate-500">{model}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={share}
              className={buttonClass}
              title="Share device information"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </div>
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
            <p className="mb-3 text-xs font-medium tracking-wider text-slate-500 uppercase">
              Downloads
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => copyAll("txt")} className={buttonClass}>
                {copiedFormat === "txt" ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy All
                  </>
                )}
              </button>
              <button type="button" onClick={() => copyAll("json")} className={buttonClass}>
                {copiedFormat === "json" ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy JSON
                  </>
                )}
              </button>
              <button type="button" onClick={download} className={buttonClass}>
                Download .txt
              </button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-slate-600" aria-live="polite">
              {feedback}
            </p>
          </div>
          <div className="space-y-4 p-6">
            <DeviceInfoCard
              label="UDID"
              value={data.udid}
              type="udid"
              primary
              onCopy={({ fieldLabel, fieldType, outcome }) =>
                track("result_page_action", {
                  action: "copy_field",
                  field_label: fieldLabel,
                  field_type: fieldType,
                  outcome,
                })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DeviceInfoCard
                label="Device Model"
                value={model}
                type="model"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
              <DeviceInfoCard
                label="OS Version"
                value={osVersion.displayValue}
                copyValue={osVersion.copyValue}
                secondaryLabel="Build"
                {...(osVersion.rawBuild && osVersion.displayValue !== `Build ${osVersion.rawBuild}`
                  ? { secondaryValue: osVersion.rawBuild }
                  : {})}
                type="version"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <DeviceInfoCard
                label="Serial Number"
                value={data.serial}
                type="serial"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
              <DeviceInfoCard
                label="Product Type"
                value={data.product}
                type="product"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
            </div>
            {data.imei && (
              <DeviceInfoCard
                label="IMEI"
                value={data.imei}
                type="imei"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
            )}
            {data.meid && (
              <DeviceInfoCard
                label="MEID"
                value={data.meid}
                type="imei"
                onCopy={({ fieldLabel, fieldType, outcome }) =>
                  track("result_page_action", {
                    action: "copy_field",
                    field_label: fieldLabel,
                    field_type: fieldType,
                    outcome,
                  })
                }
              />
            )}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
            <p className="text-center text-xs text-slate-500 sm:text-left">
              This data was retrieved via a configuration profile and is not stored on our servers.
            </p>
          </div>
        </Motion>
        <Motion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            Need to register this device for development?{" "}
            <a
              href="https://developer.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Go to Apple Developer Portal →
            </a>
          </p>
        </Motion>
      </div>
    </main>
  );
}
