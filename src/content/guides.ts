export type GuideSection = {
  title: string;
  body: string[];
  list?: string[];
  table?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
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
  publishedAt: string;
  updatedAt?: string;
  relatedGuideSlugs?: string[];
  visual?: {
    src: string;
    alt: string;
    caption: string;
    width: number;
    height: number;
  };
  sections: GuideSection[];
  faqs: GuideFaq[];
  sources?: Array<{
    publisher: string;
    title: string;
    url: string;
  }>;
};

export const guides: Guide[] = [
  {
    slug: "how-to-find-iphone-udid",
    title: "How to find your iPhone UDID",
    metaTitle: "How to Find Your iPhone UDID: 3 Methods",
    description:
      "Find your iPhone or iPad UDID with Safari, Finder, or Xcode Device Hub, and choose the right method for your device and testing workflow.",
    eyebrow: "iPhone UDID guide",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: ["get-udid-without-itunes", "what-is-udid"],
    visual: {
      src: "/udid-safari-flow.svg",
      alt: "Four-step diagram: open UDID Tools in Safari, allow the profile download, review and install it in iOS Settings, then copy the UDID from the result page.",
      caption:
        "The Safari method stays on the target device: you approve the profile download and installation before iOS returns the requested identifier.",
      width: 1200,
      height: 800,
    },
    intro:
      "You can find an iPhone or iPad UDID directly on the device with Safari and UDID Tools, on a Mac with Finder, or in Xcode Device Hub. Safari is the fastest option when you have no computer; Finder and Xcode are Apple-documented alternatives when the device can connect to a Mac.",
    sections: [
      {
        title: "Choose the best UDID method",
        body: [
          "Each method returns the device identifier for the same physical iPhone or iPad, but the requirements differ. Use Safari for a phone-only flow, Finder for a connected-device method without developer tools, or Xcode Device Hub when you already work in Xcode.",
        ],
        table: {
          caption: "Ways to find an iPhone or iPad UDID",
          headers: ["Method", "What you need", "Best for"],
          rows: [
            [
              "Safari and UDID Tools",
              "The target device and internet access",
              "No-computer access",
            ],
            ["Finder", "A Mac and a cable", "Apple-documented lookup without Xcode"],
            ["Xcode Device Hub", "A Mac with Xcode", "Development and device registration"],
          ],
        },
      },
      {
        title: "Method 1: find the UDID in Safari",
        body: [
          "Open UDID Tools in Safari on the exact iPhone or iPad you want to identify. The site downloads a temporary configuration profile; you review and approve it in Settings, and iOS returns the requested device information to the result page.",
          "This method does not require a Mac, PC, USB cable, Apple ID, iTunes, Xcode, or an App Store installation. Use Safari rather than an in-app browser so iOS can hand the profile download to Settings correctly.",
        ],
        list: [
          "Open udid.tools in Safari on the target iPhone or iPad.",
          "Tap Get iPhone UDID and allow the profile download.",
          "Open Settings, select Profile Downloaded, and review the profile.",
          "Approve the installation and return to the result page.",
          "Copy the UDID exactly as displayed.",
        ],
      },
      {
        title: "Method 2: copy the UDID in Finder",
        body: [
          "Apple documents Finder as a way to locate a device ID without pairing the device through Xcode Device Hub. Connect the iPhone or iPad to a Mac, select it under Locations in Finder, and complete the Trust prompt if it appears.",
          "Under the device name, click the device-family label twice to display the device ID. Control-click the value and choose Copy UDID. Finder rotates through other device details as you click, so confirm the label says UDID before copying.",
        ],
        list: [
          "Connect the device to a Mac and approve Trust if requested.",
          "Open Finder and select the device under Locations.",
          "Click the device-family label twice until the UDID appears.",
          "Control-click the value and choose Copy UDID.",
        ],
      },
      {
        title: "Method 3: use Xcode Device Hub",
        body: [
          "If you already use Xcode, open Device Hub and select the connected or paired physical device. In the Info inspector, Apple displays the device ID under Hardware Properties in the UDID field. If that field is hidden, use Edit Visibility to show the UDID property.",
          "Xcode is the most useful option when the same developer will register the device or run a development build. With automatic signing, Xcode can register a connected device as part of the development workflow.",
        ],
      },
      {
        title: "Check the value before sharing it",
        body: [
          "A UDID is not the same as a serial number, IMEI, phone number, Apple ID, or identifierForVendor. Copy the value from the field explicitly labeled UDID or device ID and do not retype it manually.",
          "Share the UDID only with a developer, company, or service you trust and only for a stated purpose such as Development or Ad Hoc device registration. A UDID is not a password, but it persistently identifies the same physical device in workflows that use it.",
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
        question: "Where is the UDID in iPhone Settings?",
        answer:
          "iPhone Settings shows values such as the serial number and IMEI under General > About, but it does not normally expose a copyable UDID there. Use Safari with UDID Tools, Finder, or Xcode Device Hub instead.",
      },
      {
        question: "Can I find an iPad UDID the same way?",
        answer:
          "Yes. The Safari, Finder, and Xcode Device Hub methods also work for supported iPad devices. Run the method on or with the exact iPad that needs to be identified.",
      },
      {
        question: "Is a UDID the same as an IMEI or serial number?",
        answer:
          "No. A UDID is used for Apple development and registered-device workflows, a serial number identifies the hardware for support and inventory, and an IMEI identifies cellular hardware for carrier use.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Locating device identifiers",
        url: "https://developer.apple.com/documentation/xcode/locating-device-identifiers",
      },
      {
        publisher: "Apple Developer",
        title: "Distributing your app to registered devices",
        url: "https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices",
      },
    ],
  },
  {
    slug: "get-udid-without-itunes",
    title: "Get your iPhone UDID without iTunes",
    metaTitle: "Find iPhone UDID Without a Computer or iTunes",
    description:
      "Find your iPhone or iPad UDID in Safari without a computer, iTunes, Finder, Xcode, or a USB cable, with clear profile steps and troubleshooting.",
    eyebrow: "No iTunes required",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: ["how-to-find-iphone-udid", "what-is-udid"],
    intro:
      "You can find an iPhone or iPad UDID without a computer, iTunes, Finder, Xcode, or a USB cable. Open UDID Tools in Safari on the device, approve the temporary configuration profile in Settings, and copy the UDID from the result page.",
    sections: [
      {
        title: "How the no-computer method works",
        body: [
          "Apple's Profile Service flow lets a configuration profile list the device attributes it requests and provide a URL for the device's response. UDID Tools uses that device-approved response to display the identifier back in Safari, so the iPhone or iPad does not need to pair with a desktop computer.",
          "This is a configuration-profile exchange, not an App Store app or an iTunes sync. You review and approve the profile on the target device before iOS sends the requested response.",
        ],
      },
      {
        title: "Find the UDID in Safari",
        body: [
          "Use Safari on the exact iPhone or iPad you need to identify. In-app browsers may not hand the profile download to Settings correctly, so reopen the site in Safari before starting.",
        ],
        list: [
          "Open https://www.udid.tools/ in Safari on the target device.",
          "Tap Get iPhone UDID and allow the profile download.",
          "Open Settings and select Profile Downloaded, or open General > VPN & Device Management.",
          "Review the profile description and approve the installation.",
          "Return to the result page and copy the UDID exactly as displayed.",
        ],
      },
      {
        title: "What the profile requests",
        body: [
          "The current UDID Tools profile asks iOS for the UDID, product identifier, OS version, serial number, IMEI, and MEID. Some fields are unavailable on some devices; the UDID is the required value for this flow.",
          "The service is designed to process the response into an encrypted result link without creating an account or intentionally storing the device identifiers as a server-side user record. Keep the result link private because it acts as a bearer link to the displayed result.",
        ],
      },
      {
        title: "If the downloaded profile does not appear",
        body: [
          "First confirm that the download started in Safari rather than inside another app. Then check Settings for Profile Downloaded or open General > VPN & Device Management to review available profiles.",
          "A work, school, or otherwise managed device may restrict configuration-profile installation. Do not bypass an organization's policy; ask its administrator or use an approved Finder or Xcode method instead.",
        ],
      },
      {
        title: "When Finder or Xcode is the better method",
        body: [
          "Use Finder when you prefer Apple's connected-device lookup or when profile installation is unavailable. Use Xcode Device Hub when the developer already has the device connected and plans to register it for development. The separate how-to guide compares all three methods in detail.",
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
          "No. The process uses a configuration profile, not an App Store app. Review the profile before approving it and remove it from Settings afterward if it remains installed and you no longer need it.",
      },
      {
        question: "Can I copy the UDID directly from iPhone Settings?",
        answer:
          "Settings > General > About exposes identifiers such as the serial number and IMEI, but it does not normally show a copyable UDID. Use the Safari profile method, Finder, or Xcode Device Hub.",
      },
      {
        question: "Can I use Chrome or an in-app browser?",
        answer:
          "Safari is the supported path for the UDID Tools profile flow. If you opened the page from a social, email, or other in-app browser, choose Open in Safari before downloading the profile.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Creating a Profile Server for Over-The-Air Enrollment and Configuration",
        url: "https://developer.apple.com/library/archive/documentation/NetworkingInternet/Conceptual/iPhoneOTAConfiguration/profile-service/profile-service.html",
      },
      {
        publisher: "Apple Support",
        title: "Install or remove configuration profiles on iPhone",
        url: "https://support.apple.com/guide/iphone/install-or-remove-configuration-profiles-iph6c493b19/ios",
      },
      {
        publisher: "UDID Tools",
        title: "Privacy Policy",
        url: "https://www.udid.tools/privacy-policy",
      },
    ],
  },
  {
    slug: "what-is-udid",
    title: "What is an iPhone UDID?",
    metaTitle: "What Is an iPhone UDID and Why Is It Needed?",
    description:
      "Learn what an iPhone UDID is, why developers need it for registered-device testing, when TestFlight does not need it, and how it differs from IMEI.",
    eyebrow: "UDID basics",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: [
      "how-to-find-iphone-udid",
      "udid-vs-serial-number-vs-imei",
      "udid-for-app-testing",
    ],
    intro:
      "An iPhone UDID is a persistent, unique device identifier that distinguishes one physical Apple device. Developers mainly need it to register an iPhone or iPad for Development or Ad Hoc app distribution. TestFlight normally does not require testers to provide a UDID.",
    sections: [
      {
        title: "What UDID means",
        body: [
          "UDID stands for Unique Device Identifier. Apple describes a device ID as a persistent, unique identifier for one physical device. For iPhone and iPad development, that identifier lets a developer distinguish the exact device that should be registered with an Apple Developer team.",
          "A UDID identifies hardware, not a person or an Apple Account. It is not a password, passcode, phone number, or sign-in credential, but it is still device-identifying information and should not be posted publicly.",
        ],
      },
      {
        title: "Why developers ask for your UDID",
        body: [
          "Apple requires a registered device when a developer creates a Development or Ad Hoc provisioning profile for that device. The developer records the device name and UDID in their Apple Developer account, then includes the registered device in the appropriate provisioning profile.",
          "With automatic signing, Xcode can register a connected device for the developer. When a tester is remote, the developer may instead ask the tester to send the UDID so the correct iPhone or iPad can be registered before the private build is installed.",
        ],
        list: [
          "Running a development build on a registered physical device.",
          "Installing an Ad Hoc build distributed to a known set of devices.",
          "Confirming which device belongs in a provisioning or testing workflow.",
        ],
      },
      {
        title: "When you do not need a UDID",
        body: [
          "TestFlight does not normally require a tester's UDID. Apple distributes TestFlight builds through App Store Connect invitations or public links, so a developer does not need to register each tester's device first. Apps installed from the public App Store also do not require you to send a UDID to the developer.",
          "If someone asks for your UDID, ask which distribution or support workflow needs it. A clear answer such as Development, Ad Hoc, or device registration is more trustworthy than a request with no stated purpose.",
        ],
      },
      {
        title: "UDID vs serial number vs IMEI",
        body: [
          "These identifiers may appear together in device information, but they are not interchangeable. Send the exact identifier a developer, carrier, or support representative requests.",
        ],
        table: {
          caption: "Common Apple device identifiers and their typical uses",
          headers: ["Identifier", "What it identifies", "Typical use"],
          rows: [
            ["UDID", "One physical Apple device", "Development and Ad Hoc device registration"],
            [
              "Serial number",
              "The hardware unit",
              "Apple support, warranty, repair, and inventory",
            ],
            ["IMEI", "A cellular modem", "Carrier networks and cellular-device eligibility"],
          ],
        },
      },
      {
        title: "How to find your iPhone or iPad UDID",
        body: [
          "Apple documents Finder and Xcode Device Hub as computer-based ways to copy a device ID. UDID Tools provides a phone-only option: Safari downloads a temporary configuration profile, you explicitly approve it in Settings, and the result page displays the identifier returned by iOS.",
        ],
        list: [
          "Open UDID Tools in Safari on the device you need to identify.",
          "Tap Get UDID and allow the configuration profile download.",
          "Open Settings, select Profile Downloaded, and approve the profile.",
          "Return to the result page and copy the UDID.",
        ],
      },
      {
        title: "Is an iPhone UDID private?",
        body: [
          "Treat a UDID as device-identifying technical information. A UDID by itself should not unlock your iPhone, reveal your passcode, or provide access to your Apple Account, but it can let a service recognize the same device in records that use the identifier.",
          "Share it only with a developer, organization, or service you trust and only for a stated purpose. UDID Tools does not require an account or Apple ID and is designed not to persist the identifier; the privacy policy describes the operational logging and hosting details.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why does a developer need my UDID?",
        answer:
          "A developer may need it to register your exact device for a Development or Ad Hoc build and include that device in the appropriate provisioning profile.",
      },
      {
        question: "Does TestFlight require my UDID?",
        answer:
          "No, not normally. TestFlight uses App Store Connect invitations or public links and does not require developers to register each tester's device UDID.",
      },
      {
        question: "Is a UDID the same as an IMEI or serial number?",
        answer:
          "No. A UDID is used for Apple development and registered-device workflows, a serial number identifies the hardware for support and inventory, and an IMEI identifies cellular hardware for carrier use.",
      },
      {
        question: "Can someone access my iPhone with only its UDID?",
        answer:
          "A UDID alone should not provide access to your device, passcode, photos, messages, or Apple Account. It still identifies the device, so avoid publishing it or sharing it without a clear reason.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Locating device identifiers",
        url: "https://developer.apple.com/documentation/xcode/locating-device-identifiers",
      },
      {
        publisher: "Apple Developer",
        title: "Register a single device",
        url: "https://developer.apple.com/help/account/devices/register-a-single-device",
      },
      {
        publisher: "Apple Developer",
        title: "TestFlight overview",
        url: "https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/",
      },
    ],
  },
  {
    slug: "udid-for-app-testing",
    title: "UDID for app testing and provisioning",
    metaTitle: "iPhone UDID for App Testing: Ad Hoc vs TestFlight",
    description:
      "Learn when iPhone app testing needs a UDID, how Development and Ad Hoc provisioning use registered devices, and why TestFlight normally does not.",
    eyebrow: "For testers",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: ["what-is-udid", "is-it-safe-to-share-udid"],
    intro:
      "A tester's UDID is needed when an iPhone or iPad must be registered for a Development or Ad Hoc build. TestFlight normally does not require the tester to send a UDID because Apple distributes the beta through an invitation or public link.",
    sections: [
      {
        title: "Which app-testing methods need a UDID?",
        body: [
          "The requirement depends on how the app is signed and distributed. Registered-device builds name the eligible hardware in provisioning, while TestFlight manages testers through App Store Connect instead.",
        ],
        table: {
          caption: "When an iPhone or iPad tester needs to provide a UDID",
          headers: ["Testing method", "Tester sends a UDID?", "How access is granted"],
          rows: [
            [
              "Development build",
              "Yes, for a physical test device",
              "The device is registered with the developer team and included by provisioning",
            ],
            [
              "Ad Hoc distribution",
              "Yes",
              "The registered device is selected in the Ad Hoc provisioning profile",
            ],
            [
              "TestFlight",
              "Normally no",
              "The tester accepts an email invitation or public link in TestFlight",
            ],
            ["Public App Store", "No", "The user installs the approved public release"],
          ],
        },
      },
      {
        title: "How a UDID enters the provisioning workflow",
        body: [
          "For manual registration, the developer adds a device name and UDID to their Apple Developer account. They then select the registered device when creating or updating a Development or Ad Hoc provisioning profile and export a build signed with that profile.",
          "Adding a device after an app was exported does not change the old build. The developer needs to update the provisioning profile and distribute a build that contains the updated eligibility information.",
        ],
        list: [
          "The tester copies the UDID from the exact iPhone or iPad that will run the app.",
          "The developer registers that device with their Apple Developer team.",
          "The developer includes the device in the appropriate provisioning profile.",
          "The developer exports and shares a build signed for the registered device.",
        ],
      },
      {
        title: "What the tester should send",
        body: [
          "Send the UDID exactly as copied; do not substitute a serial number, IMEI, model name, phone number, or Apple Account email. Each physical device has its own identifier, so an iPad UDID cannot register an iPhone and a replacement phone needs its own registration.",
          "A developer may also ask for the device model and iOS or iPadOS version when diagnosing compatibility. Share the UDID privately and only with the developer or organization responsible for the build.",
        ],
      },
      {
        title: "Why a registered-device build may still fail",
        body: [
          "If installation reports that the device is not registered or eligible, first confirm that the copied UDID belongs to the device receiving the app. The developer should then verify that the device is active in the correct team and included in the provisioning profile used to sign the delivered build.",
          "A build exported before the device was added can still carry the previous profile. The developer may need to regenerate or refresh provisioning, export again, and resend the build. Apple also requires Developer Mode when running exported iOS or iPadOS app packages outside TestFlight or the App Store.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is UDID needed for TestFlight?",
        answer:
          "Normally no. TestFlight testers accept an email invitation or public link and install through the TestFlight app. Development and Ad Hoc registered-device builds are the common cases that need a UDID.",
      },
      {
        question: "Can I use the same UDID for my iPad and iPhone?",
        answer:
          "No. Each physical device has its own identifier. Run the flow on the exact device that needs to be registered.",
      },
      {
        question: "Can a developer add my UDID after creating the app build?",
        answer:
          "They can register the device afterward, but the existing exported build does not update itself. The developer needs to update the provisioning profile and provide a build signed with the refreshed profile.",
      },
      {
        question: "Why does the app say my device is not registered?",
        answer:
          "The UDID may be from a different device, the device may be inactive or registered under another team, or the delivered build may use a provisioning profile created before your device was added.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Distributing your app to registered devices",
        url: "https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices",
      },
      {
        publisher: "Apple Developer",
        title: "Create an Ad Hoc provisioning profile",
        url: "https://developer.apple.com/help/account/provisioning-profiles/create-an-ad-hoc-provisioning-profile",
      },
      {
        publisher: "Apple Developer",
        title: "TestFlight overview",
        url: "https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/",
      },
    ],
  },
  {
    slug: "is-it-safe-to-share-udid",
    title: "Is it safe to share your UDID?",
    metaTitle: "Is It Safe to Share Your iPhone UDID?",
    description:
      "Sharing an iPhone UDID with a trusted developer can be reasonable for device registration. Learn the risks, red flags, and how to inspect or remove a profile.",
    eyebrow: "Privacy guide",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: ["what-is-udid", "udid-for-app-testing"],
    intro:
      "Sharing your UDID with a trusted developer is generally reasonable when they need to register your iPhone or iPad for Development or Ad Hoc testing. A UDID identifies the device; it is not an Apple Account password. Do not post it publicly or send it to a service that cannot explain why it needs it.",
    sections: [
      {
        title: "When sharing a UDID is reasonable",
        body: [
          "Apple requires a device name and UDID when a developer manually registers an iPhone or iPad for Development or Ad Hoc distribution. The request is reasonable when you recognize the developer or organization and they explain that specific testing purpose.",
        ],
        list: [
          "You know which developer or organization will receive the UDID.",
          "They explain the Development, Ad Hoc, or device-registration workflow that needs it.",
          "They ask for the UDID, not your Apple Account password, device passcode, or verification code.",
          "You send it through a private channel instead of posting it publicly.",
        ],
      },
      {
        title: "What a developer can do with a UDID",
        body: [
          "A developer can register the device in their Apple Developer account and include that registered device in a Development or Ad Hoc provisioning profile. This lets an eligible private build run on that specific device.",
          "A UDID by itself is not a sign-in credential and does not provide access to your Apple Account, photos, messages, passcode, or device controls. It is still a persistent identifier, so treat it as device-identifying information rather than something to publish openly.",
        ],
      },
      {
        title: "Red flags: when not to share it",
        body: [
          "Do not share a UDID when the recipient is unknown, the purpose is vague, or the request is bundled with unrelated credentials or payment. A legitimate tester-onboarding request should be able to name the app and explain why registered-device distribution is being used.",
        ],
        list: [
          "The service does not identify who operates it or why the UDID is needed.",
          "You are asked to post the value publicly or enter it into an unrelated form.",
          "The request also asks for your Apple Account password, device passcode, or two-factor code.",
          "A configuration profile contains management, certificate, network, or account settings you did not expect.",
        ],
      },
      {
        title: "Review a configuration profile before installing it",
        body: [
          "Apple asks for permission before installing a downloaded configuration profile and shows information about what the profile contains. Read that information before approving it; finding a UDID does not require handing over your Apple Account password or device passcode to a website.",
          "You can review installed profiles in Settings > General > VPN & Device Management. If you remove a profile, Apple notes that the settings, apps, and data associated with that profile are also removed, so check what it controls before deleting a profile used by work or school.",
        ],
      },
      {
        title: "How UDID Tools reduces risk",
        body: [
          "UDID Tools is an open-source utility designed around a no-account and no-payment flow. The service processes the profile response to display the result and is designed not to persist the UDID or device information as a server-side account record.",
          "The result is carried in a versioned encrypted token so the browser can display it without creating an account. Treat that result link as private because anyone who receives the bearer link may be able to view the result.",
        ],
        list: [
          "No Apple ID required.",
          "No account or sign-up required.",
          "No payment flow.",
          "Public source code and a detailed privacy policy.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can someone hack my iPhone with my UDID?",
        answer:
          "A UDID alone is not a password or remote-control credential and does not provide access to your iPhone. A malicious profile or a request for your passcode or Apple Account credentials is a separate risk, which is why you should review the profile and trust the recipient.",
      },
      {
        question: "Should I remove the profile after use?",
        answer:
          "Check Settings > General > VPN & Device Management after the flow. You can remove a profile you no longer need, but first review it because removing a work or school profile also removes the settings, apps, and data associated with that profile.",
      },
      {
        question: "Is it safe to post a UDID publicly?",
        answer:
          "No. A UDID persistently identifies one device, so send it privately to the trusted developer who needs it instead of placing it in a public issue, forum, screenshot, or social post.",
      },
      {
        question: "Why would an app developer need my UDID?",
        answer:
          "A developer may need it to register your device for a Development or Ad Hoc build. TestFlight and public App Store installation normally do not require you to send a UDID.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Register a single device",
        url: "https://developer.apple.com/help/account/devices/register-a-single-device",
      },
      {
        publisher: "Apple Support",
        title: "Install or remove configuration profiles on iPhone",
        url: "https://support.apple.com/guide/iphone/install-or-remove-configuration-profiles-iph6c493b19/ios",
      },
      {
        publisher: "UDID Tools",
        title: "Privacy Policy",
        url: "https://www.udid.tools/privacy-policy",
      },
    ],
  },
  {
    slug: "udid-vs-serial-number-vs-imei",
    title: "UDID vs serial number vs IMEI: what is the difference?",
    metaTitle: "UDID vs Serial Number vs IMEI: Key Differences",
    description:
      "Compare iPhone UDID, serial number, IMEI, and MEID: what each identifier represents, where to find it, and which one a developer, Apple, or a carrier needs.",
    eyebrow: "Identifier comparison",
    publishedAt: "2026-08-31",
    updatedAt: "2026-10-18",
    relatedGuideSlugs: ["what-is-udid", "how-to-find-iphone-udid"],
    intro:
      "A UDID identifies one Apple device for development and registered-device app distribution. A serial number identifies the hardware for Apple support, warranty, repair, and inventory. An IMEI or MEID identifies cellular hardware for carrier workflows. These values are not interchangeable: send the exact identifier that was requested.",
    sections: [
      {
        title: "UDID, serial number, and IMEI compared",
        body: [
          "The quickest way to choose the right value is to match the identifier to the task. A developer preparing a Development or Ad Hoc build may need the UDID. Apple Support commonly asks for a serial number. A mobile carrier may ask for an IMEI or MEID when checking cellular hardware or service eligibility.",
        ],
        table: {
          caption: "Differences between an Apple device UDID, serial number, IMEI, and MEID",
          headers: ["Identifier", "What it identifies", "Common use", "Where to find it"],
          rows: [
            [
              "UDID",
              "One physical Apple device",
              "Development and Ad Hoc device registration",
              "Finder, Xcode Device Hub, or a device-approved profile flow",
            ],
            [
              "Serial number",
              "The hardware unit",
              "Apple support, warranty, repair, and inventory",
              "Settings > General > About, Finder, or the original packaging",
            ],
            [
              "IMEI / MEID",
              "Cellular hardware",
              "Carrier service, activation, and device eligibility",
              "Settings > General > About or Finder on cellular-capable models",
            ],
          ],
        },
      },
      {
        title: "What is a UDID used for?",
        body: [
          "Apple describes the device ID used for development as a persistent, unique identifier for one physical device. A developer can register that identifier in their Apple Developer account and include the device in a Development or Ad Hoc provisioning profile.",
          "Apple documents Finder and Xcode Device Hub as ways to copy the UDID. UDID Tools offers a phone-only alternative in Safari: iOS shows a configuration profile for your approval and returns the device information through the profile service flow. A serial number or IMEI cannot replace the UDID when the developer specifically needs device registration.",
        ],
        list: [
          "Registering an iPhone or iPad for a Development build.",
          "Including a known device in an Ad Hoc provisioning profile.",
          "Matching the correct physical device to a private testing workflow.",
        ],
      },
      {
        title: "What is a serial number used for?",
        body: [
          "A serial number identifies the hardware unit for support and inventory purposes. Apple says you can find it in Settings > General > About, in Finder or the Apple Devices app, on the original packaging, and in your Apple Account device list.",
          "Use the serial number when Apple Support, a repair provider, an administrator, or an inventory system asks for it. Do not substitute it for a UDID in a registered-device development workflow.",
        ],
      },
      {
        title: "What are IMEI and MEID used for?",
        body: [
          "IMEI and MEID identify cellular hardware. Carriers use these values for cellular service, activation, support, and eligibility checks. Apple lists them in Settings > General > About on supported devices and in Finder or the Apple Devices app when the device is connected.",
          "A Wi-Fi-only iPad does not have cellular hardware and therefore may not have an IMEI. Even on an iPhone, the IMEI is not the value a developer needs when asking for a UDID.",
        ],
      },
      {
        title: "Which identifier should you share?",
        body: [
          "Ask the recipient to name both the identifier and its purpose. Send a UDID for Apple development device registration, a serial number for hardware support or inventory, and an IMEI or MEID for carrier-related work. If the request is vague, confirm it before sharing any value.",
          "All of these identifiers describe a device, so avoid posting them publicly. Share only the requested value with a developer, organization, support representative, or carrier you trust.",
        ],
      },
    ],
    faqs: [
      {
        question: "Is an iPhone UDID the same as its serial number?",
        answer:
          "No. A UDID is used for Apple development and registered-device workflows, while a serial number identifies the hardware for support, warranty, repair, and inventory.",
      },
      {
        question: "Is UDID the same as IMEI?",
        answer:
          "No. A UDID identifies the Apple device for development workflows. An IMEI identifies cellular hardware for carrier and network-related workflows.",
      },
      {
        question: "Which identifier should I send to an iOS developer?",
        answer:
          "If the developer is registering your device for a Development or Ad Hoc build, send the UDID exactly as shown. TestFlight normally does not require you to provide a UDID.",
      },
      {
        question: "Does every iPad have an IMEI?",
        answer:
          "No. IMEI identifies cellular hardware, so a Wi-Fi-only iPad does not normally have one. Cellular-capable iPad models can show an IMEI in Settings > General > About.",
      },
    ],
    sources: [
      {
        publisher: "Apple Developer",
        title: "Locating device identifiers",
        url: "https://developer.apple.com/documentation/xcode/locating-device-identifiers",
      },
      {
        publisher: "Apple Developer",
        title: "Register a single device",
        url: "https://developer.apple.com/help/account/devices/register-a-single-device",
      },
      {
        publisher: "Apple Support",
        title: "Find the serial number or IMEI on your iPhone or iPad",
        url: "https://support.apple.com/en-us/108037",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
