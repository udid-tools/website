import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for using UDID Tools.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service · UDID Tools",
    description: "Terms of Service for using UDID Tools.",
    url: "/terms",
    type: "website",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "Terms of Service · UDID Tools",
    description: "Terms of Service for using UDID Tools.",
    images: [],
  },
};

const sections: LegalSection[] = [
  {
    title: "Agreement to these Terms",
    paragraphs: [
      "By accessing or using UDID Tools, you agree to these Terms of Service. If you do not agree, do not use the service.",
      "UDID Tools is a free, open-source public utility created and maintained by a private individual. It is not a paid product, subscription service, or commercial account platform.",
    ],
  },
  {
    title: "What the service does",
    paragraphs: [
      "UDID Tools helps you obtain your Apple device UDID and related device information through Safari using an iOS configuration profile flow. After you download and install the temporary profile, iOS may send device attributes back to the service so the result can be shown to you.",
      "The service is intended for people who need device identifiers or related technical details for development, testing, device registration, or similar purposes.",
    ],
  },
  {
    title: "Free and open-source utility",
    paragraphs: [
      "The hosted service is provided free of charge. Source code may be available publicly as part of the open-source project, but the hosted service is still provided as is and as available.",
      "The service may change, break, become unavailable, be discontinued, or be removed at any time without notice.",
    ],
  },
  {
    title: "Configuration profiles",
    paragraphs: [
      "You are responsible for understanding what an iOS configuration profile is before downloading or installing it. If you are not comfortable installing a profile, do not use this service.",
      "You should remove the profile after use if you no longer need it. You remain responsible for checking your device settings and removing any profile that remains installed.",
    ],
  },
  {
    title: "No warranties or guarantees",
    paragraphs: [
      "Use of the service is at your own risk. To the fullest extent permitted by applicable law, I make no warranties or guarantees of any kind, whether express, implied, or statutory.",
      "I do not guarantee accuracy, availability, security, compatibility, uninterrupted operation, fitness for a particular purpose, or that the service will work with every device, iOS or iPadOS version, browser, Apple workflow, or third-party service.",
    ],
  },
  {
    title: "Limitation of responsibility",
    paragraphs: [
      "To the fullest extent permitted by applicable law, I am not responsible for any loss, damage, issue, claim, or consequence arising from or related to your use of the service.",
      "This includes, without limitation, responsibility for:",
    ],
    items: [
      "device issues;",
      "profile installation, behavior, or removal issues;",
      "incorrect UDID or device information;",
      "problems with Apple Developer accounts;",
      "provisioning profiles;",
      "app signing;",
      "TestFlight;",
      "MDM or device management workflows;",
      "third-party services;",
      "data loss;",
      "business losses;",
      "indirect, incidental, consequential, or special damages;",
      "any other issue arising from or related to use of the service.",
    ],
  },
  {
    title: "Prohibited uses",
    paragraphs: [
      "You agree not to use the service for any improper or harmful purpose, including:",
    ],
    items: [
      "unlawful activity;",
      "abuse, scraping, overloading, attacking, or reverse-engineering the hosted infrastructure;",
      "attempting unauthorized access to systems, data, or accounts;",
      "using the service to harm, track, impersonate, exploit, or interfere with others.",
    ],
  },
  {
    title: "Third-party links and services",
    paragraphs: [
      "The site may link to third-party websites or services, including Apple resources or the project source repository. Those resources are controlled by their respective owners, and I am not responsible for their content, policies, availability, or behavior.",
    ],
  },
  {
    title: "Changes to these Terms",
    paragraphs: [
      "These Terms may be updated from time to time. The updated version will be posted on this page. Continued use of the service after changes are posted means you accept the updated Terms.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Questions about these Terms should be opened as an issue at https://github.com/udid-tools/website/issues.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      title="Terms of Service"
      description="Please read these Terms before using UDID Tools. The service is a free, open-source public utility provided as is and at your own risk."
      lastUpdated="August 31, 2026"
      sections={sections}
    />
  );
}
