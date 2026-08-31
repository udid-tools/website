import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for UDID Tools and the UDID extraction flow.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy · UDID Tools",
    description: "Privacy Policy for UDID Tools and the UDID extraction flow.",
    url: "/privacy-policy",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy · UDID Tools",
    description: "Privacy Policy for UDID Tools and the UDID extraction flow.",
    images: [],
  },
};

const sections: LegalSection[] = [
  {
    title: "Overview",
    paragraphs: [
      "UDID Tools is a free, open-source public utility that helps you retrieve your Apple device UDID and related technical information through Safari using an iOS configuration profile flow.",
      "This Privacy Policy explains what information may be processed when you use the service. If you do not agree with this policy, do not use the service.",
    ],
  },
  {
    title: "Information processed during the UDID flow",
    paragraphs: [
      "When you choose to download and install the configuration profile, iOS may send device attributes back to the service as part of Apple’s profile response. The current code parses those attributes and redirects you to a results page so they can be displayed in your browser.",
      "The information may include:",
    ],
    items: [
      "UDID;",
      "device name or related device label, if provided by iOS;",
      "product type or model, such as an iPhone or iPad product identifier;",
      "iOS or iPadOS version;",
      "serial number, IMEI, MEID, or similar identifiers if provided by iOS;",
      "other technical attributes provided by Apple or iOS as part of the profile response.",
    ],
  },
  {
    title: "How the information is used",
    paragraphs: [
      "The UDID and device information are used only to complete the requested flow and display the result to you. The service is designed not to persist or store your UDID or personal information on the server.",
      "The service encrypts the iOS profile response into a versioned result token carried in the success-page URL. This allows the browser to show and share the result without creating an account or saving a server-side record.",
    ],
  },
  {
    title: "No accounts, payments, or marketing features",
    paragraphs: [
      "The app currently does not provide user accounts, payment features, newsletters, marketing features, or paid services. No payment data is collected because the service is free.",
      "The service does not sell data, run advertising, or use marketing tracking.",
    ],
  },
  {
    title: "Vercel Web Analytics and Speed Insights",
    paragraphs: [
      "UDID Tools uses Vercel Web Analytics on public informational pages to understand aggregate traffic, page views, referrers, devices, countries or regions, and similar usage metrics. This helps evaluate whether SEO and documentation improvements are working.",
      "Vercel Speed Insights measures real-user performance signals such as page loading, visual stability, responsiveness, and server response timing, grouped by public route and technical context. These measurements help identify slow pages and regressions.",
      "Vercel Web Analytics and Speed Insights are intended for product, traffic, reliability, and performance measurement, not advertising or cross-site marketing tracking. The client-side analytics and speed components are not intentionally rendered on the /success results page because its URL contains an encrypted result token. The /success page may send limited server-side custom analytics events, such as result source, field count, button action, field type, and outcome. Those events are designed to exclude the result token, UDID, serial number, IMEI, MEID, and other device identifier values.",
    ],
  },
  {
    title: "Sentry error and performance monitoring",
    paragraphs: [
      "UDID Tools uses Sentry to detect application errors, diagnose failures, measure request and operation durations, and understand the health of the profile retrieval flow. Sentry may process error messages, stack traces, route names, timestamps, release and environment identifiers, browser or device category, request status, timing data, and privacy-limited technical breadcrumbs.",
      "The integration is configured not to send default personal information or request bodies. Device identifiers, result tokens, and URL query parameters are filtered from Sentry events, and performance traces for the /success results page are not sampled. Session Replay is not enabled. Sentry data is used for security, reliability, debugging, and performance monitoring, not advertising.",
    ],
  },
  {
    title: "Technical logs and hosting infrastructure",
    paragraphs: [
      "Although UDID Tools is designed not to store UDID or personal information, hosting providers, CDNs, network infrastructure, or serverless platforms may automatically process technical data for security, debugging, abuse prevention, and operation.",
      "That technical data may include IP address, user-agent, timestamps, request paths, referrer information, response status, error details, basic request logs, traces, metrics, and analytics events for public pages. The app also records structured operational events when profile signing or XML parsing succeeds or fails; these records intentionally exclude device identifiers and profile payloads.",
    ],
  },
  {
    title: "Data retention",
    paragraphs: [
      "UDID and device data are not intentionally stored by the service. They are processed to display the requested result and complete the flow.",
      "Transient technical logs, errors, traces, and metrics may exist in Vercel or Sentry according to the configured provider retention periods and operational needs.",
    ],
  },
  {
    title: "Security",
    paragraphs: [
      "Reasonable care is taken to operate the service safely, but no internet service can be guaranteed to be 100% secure. You use the service at your own risk.",
      "Only install a configuration profile if you understand what it is and are comfortable with the flow. Remove the profile after use if you no longer need it.",
    ],
  },
  {
    title: "Children’s privacy",
    paragraphs: [
      "The service is a technical utility and is not directed to children. I do not knowingly collect children’s personal data. If you believe a child has provided information through the service, please use the contact options below.",
    ],
  },
  {
    title: "Your rights and choices",
    paragraphs: [
      "Depending on where you live, you may have rights regarding personal information that applies to you. Because the service is designed not to intentionally store UDID or personal information, there may be no account record or stored UDID record to access, correct, or delete.",
      "If you have a privacy request or question, open an issue at https://github.com/udid-tools/website/issues.",
    ],
  },
  {
    title: "Changes to this Privacy Policy",
    paragraphs: [
      "This Privacy Policy may be updated from time to time. The updated version will be posted on this page. Continued use of the service after changes are posted means you accept the updated policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy Policy"
      description="This policy describes how UDID Tools processes information while helping you retrieve your Apple device UDID and related device details."
      lastUpdated="August 31, 2026"
      sections={sections}
    />
  );
}
