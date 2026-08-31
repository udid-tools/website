export type GuideSection = {
  title: string;
  body: string[];
  list?: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-find-iphone-udid",
    title: "How to find your iPhone UDID",
    metaTitle: "How to Find iPhone UDID Online",
    description:
      "A practical guide to finding your iPhone UDID online in Safari, without connecting your device to a computer.",
    eyebrow: "iPhone UDID guide",
    intro:
      "If a developer, beta testing service, or device management workflow asks for your iPhone UDID, you need the unique hardware identifier for that exact device. UDID Tools retrieves it through Safari using the same configuration profile flow Apple devices support for sharing device attributes.",
    sections: [
      {
        title: "The fastest option: use Safari on the iPhone",
        body: [
          "Open UDID Tools on the iPhone you want to identify, tap Get UDID, allow the configuration profile download, then finish the profile installation in Settings. After iOS sends the device response, the site shows your UDID and related device details.",
          "This approach is useful when you do not have a Mac nearby, do not want to open Xcode, or simply need to copy the identifier quickly for app provisioning.",
        ],
        list: [
          "Open the page in Safari on your iPhone.",
          "Tap Get UDID and allow the profile download.",
          "Go to Settings, open Profile Downloaded, and install it.",
          "Return to the result page and copy your UDID.",
        ],
      },
      {
        title: "When you might need a UDID",
        body: [
          "A UDID is commonly requested when a developer needs to register your device for ad hoc app builds, internal testing, troubleshooting, or device management workflows. It is different from your phone number, Apple ID, or serial number.",
        ],
      },
      {
        title: "What to check before sharing it",
        body: [
          "Only share a UDID with a developer, company, or service you trust. A UDID is a stable device identifier. It is not a password, but it can identify the same physical device across workflows where the identifier is used.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I find my iPhone UDID without a Mac?",
        answer:
          "Yes. You can use Safari on the iPhone itself and retrieve the UDID through the configuration profile flow.",
      },
      {
        question: "Is a UDID the same as an IMEI?",
        answer:
          "No. A UDID is an Apple device identifier used for development and management workflows. IMEI is a cellular modem identifier used by carriers and hardware support systems.",
      },
    ],
  },
  {
    slug: "get-udid-without-itunes",
    title: "Get your iPhone UDID without iTunes",
    metaTitle: "Get iPhone UDID Without iTunes or Xcode",
    description:
      "Find an iPhone or iPad UDID without iTunes, Finder, Xcode, a USB cable, or a desktop computer.",
    eyebrow: "No iTunes required",
    intro:
      "Older UDID instructions often mention iTunes, Finder, or Xcode. Those methods still work in some cases, but they require a computer. UDID Tools is built for the simpler case: you have the iPhone or iPad in your hand and need the UDID now.",
    sections: [
      {
        title: "Why this works without iTunes",
        body: [
          "iOS can provide device attributes during a configuration profile enrollment-style response. UDID Tools uses that browser-based profile flow to show the identifier back to you, so the process can happen directly on the device.",
        ],
      },
      {
        title: "Step-by-step",
        body: [
          "Use Safari, not an in-app browser, because iOS handles profile downloads through Safari and Settings. After the profile is installed, the result page displays the UDID so you can copy it.",
        ],
        list: [
          "Visit UDID Tools from Safari on the target device.",
          "Download the profile when Safari asks.",
          "Open Settings and install the downloaded profile.",
          "Copy the UDID from the results page.",
        ],
      },
      {
        title: "When Finder or Xcode may still be useful",
        body: [
          "If your organization blocks configuration profiles or the device is managed by a company policy, a computer-based method may be more appropriate. For personal devices and development testing, the Safari profile flow is usually faster.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I need a USB cable?",
        answer: "No. The UDID Tools flow runs on the iPhone or iPad through Safari and Settings.",
      },
      {
        question: "Does this install an app?",
        answer:
          "No. The process uses a configuration profile, not an App Store app. You can remove the profile from Settings after use if it remains visible.",
      },
    ],
  },
  {
    slug: "what-is-udid",
    title: "What is a UDID?",
    metaTitle: "What Is an iPhone UDID?",
    description:
      "Understand what an Apple UDID is, why developers ask for it, and how it differs from serial numbers and IMEI.",
    eyebrow: "UDID basics",
    intro:
      "UDID stands for Unique Device Identifier. For iPhone and iPad owners, it usually matters when a developer or device workflow needs to identify one exact Apple device.",
    sections: [
      {
        title: "What a UDID identifies",
        body: [
          "A UDID identifies a specific Apple device. Developers may use it to register devices for ad hoc builds, test distributions, or workflows where a device must be allowed before an app can run outside the public App Store.",
        ],
      },
      {
        title: "What a UDID is not",
        body: [
          "A UDID is not your Apple ID, phone number, passcode, or iCloud account. It is also not the same thing as your device serial number or IMEI, even though those identifiers may appear near each other in technical workflows.",
        ],
      },
      {
        title: "Should you keep it private?",
        body: [
          "Treat your UDID as device-identifying technical information. It is not enough to unlock your device or access your Apple account, but it can identify your device in systems that store or compare UDIDs.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does a developer need my UDID?",
        answer:
          "A developer may need it to register your device for ad hoc testing or a private app build.",
      },
      {
        question: "Can my UDID change?",
        answer:
          "For practical app testing workflows, you should treat the UDID as a stable identifier for that physical device.",
      },
    ],
  },
  {
    slug: "udid-for-app-testing",
    title: "UDID for app testing and provisioning",
    metaTitle: "iPhone UDID for App Testing and Provisioning",
    description:
      "Why iOS developers ask testers for a UDID and how to send the right device identifier for app provisioning.",
    eyebrow: "For testers",
    intro:
      "If someone is preparing an iOS app build for you to test, they may ask for your iPhone or iPad UDID. Sending the right identifier helps them register the exact device that will run the build.",
    sections: [
      {
        title: "Why testers are asked for UDIDs",
        body: [
          "Some app distribution methods require devices to be registered before an app can be installed. The UDID tells the developer which device should be included in the provisioning setup.",
        ],
      },
      {
        title: "How to avoid sending the wrong value",
        body: [
          "Do not substitute your serial number, model name, phone number, or Apple ID unless the developer specifically asks for those. Use a UDID finder and copy the UDID exactly as shown.",
        ],
      },
      {
        title: "What else you may need to share",
        body: [
          "Developers sometimes also ask for iOS version and device model. UDID Tools displays those details alongside the UDID, so you can copy the exact information needed for troubleshooting.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is UDID needed for TestFlight?",
        answer:
          "TestFlight usually uses Apple IDs and invitations. UDIDs are more common for ad hoc builds or other private testing workflows.",
      },
      {
        question: "Can I use the same UDID for my iPad and iPhone?",
        answer:
          "No. Each physical device has its own identifier. Run the flow on the exact device that needs to be registered.",
      },
    ],
  },
  {
    slug: "is-it-safe-to-share-udid",
    title: "Is it safe to share your UDID?",
    metaTitle: "Is It Safe to Share an iPhone UDID?",
    description:
      "A practical privacy guide for sharing an iPhone or iPad UDID with developers, testers, and device services.",
    eyebrow: "Privacy guide",
    intro:
      "A UDID is not a password, but it is still a device identifier. The safe answer is simple: share it only when there is a clear reason and only with people or services you trust.",
    sections: [
      {
        title: "What someone can do with a UDID",
        body: [
          "In normal development workflows, a UDID lets a developer register your device for testing or match the same device in their records. On its own, it should not give someone access to your photos, messages, Apple ID, or device contents.",
        ],
      },
      {
        title: "Why you should still be careful",
        body: [
          "Because a UDID is stable device-identifying information, it can become sensitive when combined with other data. Avoid posting it publicly and avoid sending it to unknown services that do not explain why they need it.",
        ],
      },
      {
        title: "How UDID Tools reduces risk",
        body: [
          "UDID Tools is an open-source utility designed around a no-account, no-payment, no-retention flow. The source code is public, and the service is built to show the result without creating a stored user profile.",
        ],
        list: [
          "No Apple ID required.",
          "No account or sign-up required.",
          "No payment flow.",
          "Open-source project on GitHub.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can someone hack my iPhone with my UDID?",
        answer:
          "A UDID alone should not let someone access or control your device. Still, avoid sharing it publicly because it identifies your device.",
      },
      {
        question: "Should I remove the profile after use?",
        answer:
          "Yes, it is a good habit to check Settings and remove any profile you no longer need.",
      },
    ],
  },
  {
    slug: "udid-vs-serial-number-vs-imei",
    title: "UDID vs serial number vs IMEI",
    metaTitle: "UDID vs Serial Number vs IMEI on iPhone",
    description:
      "Compare UDID, serial number, and IMEI so you know which iPhone identifier a developer or support team needs.",
    eyebrow: "Identifier comparison",
    intro:
      "iPhones and iPads have several identifiers, and they are easy to confuse. UDID, serial number, and IMEI all identify something different and are used in different workflows.",
    sections: [
      {
        title: "UDID",
        body: [
          "The UDID is commonly used in Apple development, app testing, provisioning, and device management contexts. If a developer asks for your device identifier for a test build, they usually mean UDID.",
        ],
      },
      {
        title: "Serial number",
        body: [
          "The serial number identifies hardware for support, warranty, repairs, and inventory. It is useful for Apple support and asset tracking, but it is not a replacement for a UDID in app provisioning workflows.",
        ],
      },
      {
        title: "IMEI",
        body: [
          "IMEI identifies the cellular modem in devices that have cellular hardware. Carriers use it for network and device eligibility workflows. Wi-Fi-only iPads may not have an IMEI.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which identifier should I send to a developer?",
        answer:
          "If they asked for a UDID, send the UDID exactly. Do not send the serial number or IMEI unless they asked for those separately.",
      },
      {
        question: "Can UDID Tools show more than the UDID?",
        answer:
          "Yes. When iOS provides the values, UDID Tools can show device model, OS version, serial number, IMEI, MEID, and related technical details.",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
