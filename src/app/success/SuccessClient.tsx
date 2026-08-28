"use client";

import * as Sentry from "@sentry/nextjs";
import { formatOsVersion, getDeviceModelName } from "@udid-tools/device-info";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  ArrowLeft,
  Share2,
  Info,
} from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import MotionWrapper from "@/app/components/MotionWrapper";
import DeviceInfoCard from "@/app/components/success/DeviceInfoCard";
import { Button } from "@/app/components/ui/button";
import {
  PROFILE_RESULT_SOURCE,
  sampleDeviceData,
  SAMPLE_RESULT_QUERY_PARAM,
  SAMPLE_RESULT_SOURCE,
} from "@/app/success/sampleDeviceData";
import { writeClipboardSafe } from "@/utils/clipboard";

type FieldKey = "UDID" | "IMEI" | "MEID" | "PRODUCT" | "SERIAL" | "VERSION";

type DeviceData = Record<keyof typeof sampleDeviceData, string>;
type ResultAnalyticsEventName = "result_page_viewed" | "result_page_action";
type ResultAnalyticsAttributes = {
  action?: string;
  button?: string;
  field_label?: string;
  field_type?: string;
  format?: string;
  outcome?: string;
  share_available?: boolean;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const [copiedFormat, setCopiedFormat] = useState<"txt" | "json" | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status] = useState("success"); // 'success', 'error', 'pending'

  const fields = useMemo(() => {
    const get = (k: FieldKey) => searchParams.get(k) ?? "";
    return [
      { label: "UDID", key: "UDID", value: get("UDID"), type: "udid" },
      { label: "IMEI", key: "IMEI", value: get("IMEI"), type: "imei" },
      { label: "MEID", key: "MEID", value: get("MEID"), type: "imei" },
      { label: "PRODUCT", key: "PRODUCT", value: get("PRODUCT"), type: "product" },
      { label: "SERIAL", key: "SERIAL", value: get("SERIAL"), type: "serial" },
      { label: "VERSION", key: "VERSION", value: get("VERSION"), type: "version" },
    ] as const;
  }, [searchParams]);

  const nonEmpty = fields.filter((field) => !!field.value);
  const hasDeviceInfo = nonEmpty.length > 0;
  const resultSource =
    searchParams.get(SAMPLE_RESULT_QUERY_PARAM) === SAMPLE_RESULT_SOURCE
      ? SAMPLE_RESULT_SOURCE
      : PROFILE_RESULT_SOURCE;
  const isSampleResult = resultSource === SAMPLE_RESULT_SOURCE;

  const trackResultAnalytics = useCallback(
    (eventName: ResultAnalyticsEventName, attributes: ResultAnalyticsAttributes = {}) => {
      const payload = {
        event_name: eventName,
        field_count: nonEmpty.length,
        has_device_info: hasDeviceInfo,
        result_source: resultSource,
        ...attributes,
      };

      Sentry.addBreadcrumb({
        category: "udid-flow.analytics",
        message: eventName,
        data: payload,
      });
      void fetch("/api/analytics/result-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
        referrerPolicy: "no-referrer",
      }).catch(() => {
        Sentry.addBreadcrumb({
          category: "udid-flow.analytics",
          message: "Result analytics event failed",
          level: "warning",
          data: { event_name: eventName, result_source: resultSource },
        });
      });
    },
    [hasDeviceInfo, nonEmpty.length, resultSource]
  );

  useEffect(() => {
    const outcome = hasDeviceInfo ? "success" : "missing_device_info";
    const attributes = {
      field_count: nonEmpty.length,
      outcome,
      result_source: resultSource,
      stage: "result_rendered",
    };

    Sentry.addBreadcrumb({
      category: "udid-flow",
      message: "Device result rendered",
      data: attributes,
    });
  }, [hasDeviceInfo, nonEmpty.length, resultSource]);

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []);

  const setTemporaryFeedback = (message: string | null) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setActionFeedback(message);
    if (message) {
      feedbackTimer.current = setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  useEffect(() => {
    trackResultAnalytics("result_page_viewed", {
      outcome: hasDeviceInfo ? "success" : "missing_device_info",
      share_available: "share" in navigator,
    });
  }, [hasDeviceInfo, trackResultAnalytics]);

  const getDeviceDataValue = (field: FieldKey, sampleKey: keyof typeof sampleDeviceData) =>
    searchParams.get(field) ?? (isSampleResult ? sampleDeviceData[sampleKey] : "");

  const productIdentifier = getDeviceDataValue("PRODUCT", "model");
  const deviceData: DeviceData = {
    udid: getDeviceDataValue("UDID", "udid"),
    model: getDeviceModelName(productIdentifier) ?? productIdentifier,
    version: getDeviceDataValue("VERSION", "version"),
    serial: getDeviceDataValue("SERIAL", "serial"),
    product: getDeviceDataValue("PRODUCT", "product"),
    imei: getDeviceDataValue("IMEI", "imei"),
    meid: getDeviceDataValue("MEID", "meid"),
  };
  const osVersion = formatOsVersion({
    productIdentifier: deviceData.product,
    build: deviceData.version,
  });

  const formatFields = (includeEmpty = false) =>
    (includeEmpty ? fields : nonEmpty)
      .map((field) => `${field.label}: ${field.value || "-"}`)
      .join("\n");

  const handleCopyAll = async (as: "txt" | "json" = "txt") => {
    const text =
      as === "json"
        ? JSON.stringify(
            Object.fromEntries(nonEmpty.map((field) => [field.key, field.value])),
            null,
            2
          )
        : formatFields();
    const ok = await writeClipboardSafe(text);
    Sentry.addBreadcrumb({
      category: "udid-flow.action",
      message: "Copy device info attempted",
      data: { format: as, outcome: ok ? "success" : "failure" },
    });
    if (ok) {
      setCopiedFormat(as);
      setTemporaryFeedback(`All device info${as === "json" ? " (JSON)" : ""} copied`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } else {
      setTemporaryFeedback("Copy failed. Please copy manually.");
    }
    trackResultAnalytics("result_page_action", {
      action: "copy_all",
      button: as === "json" ? "copy_json" : "copy_all",
      format: as,
      outcome: ok ? "success" : "failure",
    });
  };

  const downloadTxt = () => {
    const blob = new Blob([formatFields(true)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device-info.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    Sentry.addBreadcrumb({
      category: "udid-flow.action",
      message: "Device info downloaded",
      data: { format: "txt" },
    });
    trackResultAnalytics("result_page_action", {
      action: "download",
      button: "download_txt",
      format: "txt",
      outcome: "success",
    });
  };

  const shareAll = async () => {
    if (!navigator.share) {
      const ok = await writeClipboardSafe(formatFields(true));
      trackResultAnalytics("result_page_action", {
        action: "share",
        button: "share",
        outcome: ok ? "copied_fallback" : "unavailable",
        share_available: false,
      });
      if (ok) {
        setTemporaryFeedback("Native sharing is unavailable, so device info was copied");
      } else {
        setTemporaryFeedback("Sharing is unavailable in this browser. Please copy manually.");
      }
      return;
    }

    try {
      await navigator.share({ title: "Device info", text: formatFields(true) });
      Sentry.addBreadcrumb({
        category: "udid-flow.action",
        message: "Native share completed",
      });
      trackResultAnalytics("result_page_action", {
        action: "share",
        button: "share",
        outcome: "success",
        share_available: true,
      });
    } catch {
      Sentry.addBreadcrumb({
        category: "udid-flow.action",
        message: "Native share dismissed",
        level: "info",
      });
      trackResultAnalytics("result_page_action", {
        action: "share",
        button: "share",
        outcome: "dismissed",
        share_available: true,
      });
    }
  };

  const handleFieldCopy = (details: {
    field_label: string;
    field_type: string;
    outcome: string;
  }) => {
    trackResultAnalytics("result_page_action", {
      action: "copy_field",
      button: "copy_field",
      field_label: details.field_label,
      field_type: details.field_type,
      outcome: details.outcome,
    });
  };

  return (
    <main className="flex-1 py-12 md:py-20">
      <div className="mx-auto max-w-2xl px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {hasDeviceInfo && status === "success" && isSampleResult ? (
          <MotionWrapper
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Sample result preview</p>
              <p className="text-sm text-blue-700">
                The details below show an example of the information we receive from a device.
              </p>
            </div>
          </MotionWrapper>
        ) : null}

        <MotionWrapper
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 flex items-center gap-3 rounded-xl p-4 ${
            !hasDeviceInfo || status === "error"
              ? "border border-red-200 bg-red-50"
              : status === "success"
                ? "border border-green-200 bg-green-50"
                : status === "error"
                  ? "border border-red-200 bg-red-50"
                  : "border border-amber-200 bg-amber-50"
          }`}
        >
          {hasDeviceInfo && status === "success" ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Device information retrieved</p>
                <p className="text-sm text-green-700">
                  All data was successfully extracted from your device
                </p>
              </div>
            </>
          ) : !hasDeviceInfo || status === "error" ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-900">Unable to retrieve device info</p>
                <p className="text-sm text-red-700">Please try installing the profile again</p>
              </div>
            </>
          ) : null}
        </MotionWrapper>

        <MotionWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Smartphone className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Your Device Information</h1>
                <p className="text-sm text-slate-500">{deviceData.model}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={shareAll}
              className="gap-2"
              title="Share device information"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
            <p className="mb-3 text-xs font-medium tracking-wider text-slate-500 uppercase">
              Downloads
            </p>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button variant="outline" onClick={() => handleCopyAll()} className="gap-2">
                {copiedFormat === "txt" ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy All
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => handleCopyAll("json")} className="gap-2">
                {copiedFormat === "json" ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy JSON
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadTxt} className="gap-2">
                Download .txt
              </Button>
            </div>
            <p className="mt-3 min-h-5 text-sm text-slate-600" aria-live="polite">
              {actionFeedback}
            </p>
          </div>

          <div className="space-y-4 p-6">
            <DeviceInfoCard
              label="UDID"
              value={deviceData.udid}
              type="udid"
              isPrimary={true}
              onCopy={handleFieldCopy}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <DeviceInfoCard
                label="Device Model"
                value={deviceData.model}
                type="model"
                onCopy={handleFieldCopy}
              />
              <DeviceInfoCard
                label="OS Version"
                value={osVersion.displayValue}
                copyValue={osVersion.copyValue}
                secondaryLabel="Build"
                secondaryValue={
                  osVersion.rawBuild && osVersion.displayValue !== `Build ${osVersion.rawBuild}`
                    ? osVersion.rawBuild
                    : undefined
                }
                type="version"
                onCopy={handleFieldCopy}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DeviceInfoCard
                label="Serial Number"
                value={deviceData.serial}
                type="serial"
                onCopy={handleFieldCopy}
              />
              <DeviceInfoCard
                label="Product Type"
                value={deviceData.product}
                type="product"
                onCopy={handleFieldCopy}
              />
            </div>

            {deviceData.imei && (
              <DeviceInfoCard
                label="IMEI"
                value={deviceData.imei}
                type="imei"
                onCopy={handleFieldCopy}
              />
            )}

            {deviceData.meid && (
              <DeviceInfoCard
                label="MEID"
                value={deviceData.meid}
                type="imei"
                onCopy={handleFieldCopy}
              />
            )}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row">
            <p className="text-center text-xs text-slate-500 sm:text-left">
              This data was retrieved via MDM profile and is not stored on our servers.
            </p>
          </div>
        </MotionWrapper>

        <MotionWrapper
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
              onClick={() =>
                trackResultAnalytics("result_page_action", {
                  action: "open_external_link",
                  button: "apple_developer_portal",
                  outcome: "clicked",
                })
              }
            >
              Go to Apple Developer Portal →
            </a>
          </p>
        </MotionWrapper>
      </div>
    </main>
  );
}

export default function SuccessClient() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <SuccessContent />
      </Suspense>

      <Footer />
    </div>
  );
}
