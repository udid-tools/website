# UDID Tools

UDID Tools is a free, open-source web utility for retrieving an iPhone or iPad
UDID in Safari. It is built for developers, QA teams, beta-testing workflows,
and anyone who needs to register an Apple device for ad hoc distribution without
installing an app, connecting a cable, opening iTunes, or using Xcode.

Live site: [https://www.udid.tools](https://www.udid.tools)

[![VirusTotal domain report](https://img.shields.io/badge/VirusTotal-domain_report-394EFF?logo=virustotal&logoColor=white)](https://www.virustotal.com/gui/domain/udid.tools)
[![Google Safe Browsing status](https://img.shields.io/badge/Google_Safe_Browsing-check_status-4285F4?logo=googlechrome&logoColor=white)](https://transparencyreport.google.com/safe-browsing/search?url=udid.tools)
[![MDN HTTP Observatory scan](https://img.shields.io/badge/MDN_HTTP_Observatory-view_scan-000000?logo=mdnwebdocs&logoColor=white)](https://developer.mozilla.org/en-US/observatory/analyze?host=www.udid.tools)

## Why This Exists

Apple device registration still often starts with the same small but annoying
question: "What is the UDID of this iPhone or iPad?"

UDID Tools provides a focused answer:

- Get an iPhone or iPad UDID directly in Safari.
- Avoid desktop-only flows with Finder, iTunes, Xcode, or USB cables.
- Help testers share the right identifier for ad hoc builds and provisioning.
- Give developers a transparent, open-source alternative to opaque UDID lookup
  sites.

## Common Use Cases

- Register a tester's iPhone or iPad for an Apple Developer ad hoc build.
- Collect device identifiers before adding devices to a provisioning profile.
- Help beta testers find their UDID without asking them to install extra apps.
- Support mobile QA, app testing, MDM, and device inventory workflows.
- Explain UDID-related concepts with short public guides.

## How It Works

1. Open [udid.tools](https://www.udid.tools) in Safari on the iPhone or iPad.
2. Tap **Get UDID**.
3. iOS downloads a temporary configuration profile.
4. After the user approves the profile flow in Settings, the device sends the
   supported device attributes back to the service.
5. UDID Tools shows the result in the browser.
6. The temporary profile can be removed from iOS Settings after the result is
   copied.

The profile flow is the Apple-supported mechanism for reading device attributes
that iOS exposes through configuration profile enrollment responses.

## Returned Device Attributes

Depending on the device and iOS version, the service can show:

- UDID
- IMEI
- MEID
- serial number
- product identifier
- iOS version

UDID is the primary value this project is designed around. Other fields are
shown when iOS includes them in the profile response.

## Privacy And Safety

UDID Tools is intentionally small and transparent:

- No user account is required.
- No payment flow is required.
- No native app installation is required.
- The source code is public.
- The result page is excluded from search indexing.
- Vercel Web Analytics is used only on public pages, not on the result page.

The service should still be treated as a developer utility, not as an identity,
security, or device-management platform. A UDID identifies a specific Apple
device for development and provisioning workflows, so share it only with people
or teams you trust.

## Independent Security Checks

The badges at the top of this README link to live reports from independent
security services:

| Service                                                                                             | What it checks                                                         |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [VirusTotal](https://www.virustotal.com/gui/domain/udid.tools)                                      | Domain reputation across security vendors and threat-intelligence data |
| [Google Safe Browsing](https://transparencyreport.google.com/safe-browsing/search?url=udid.tools)   | Known malware, phishing, deceptive pages, and unwanted software        |
| [MDN HTTP Observatory](https://developer.mozilla.org/en-US/observatory/analyze?host=www.udid.tools) | HTTP security headers and browser-facing defensive configuration       |

These reports are maintained by third parties, may reflect different scan
times, and cover different parts of the security posture. They are useful
independent signals, not a certification or a guarantee that the service is
free of every vulnerability. To report a security issue privately, follow the
[security policy](SECURITY.md).

## Guides

The website includes short guides for common UDID questions:

- [How to find your iPhone UDID](https://www.udid.tools/guides/how-to-find-iphone-udid)
- [Get your iPhone UDID without iTunes](https://www.udid.tools/guides/get-udid-without-itunes)
- [What is a UDID?](https://www.udid.tools/guides/what-is-udid)
- [UDID for app testing](https://www.udid.tools/guides/udid-for-app-testing)
- [Is it safe to share a UDID?](https://www.udid.tools/guides/is-it-safe-to-share-udid)
- [UDID vs serial number vs IMEI](https://www.udid.tools/guides/udid-vs-serial-number-vs-imei)

## Open-Source Positioning

UDID Tools is a practical open-source developer tool for a narrow iOS workflow:
getting the correct device identifier when a tester, developer, or QA engineer
needs to register an Apple device.

Suggested directory description:

> UDID Tools is a free, open-source web utility for retrieving an iPhone or iPad
> UDID in Safari without iTunes, Xcode, a USB cable, or an app install. Useful
> for Apple Developer ad hoc device registration, beta testing, mobile QA, and
> provisioning workflows.

## Tech Stack

- [Next.js](https://nextjs.org)
- React
- TypeScript
- Tailwind CSS
- Vercel

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration Profile Signing

To run the full UDID retrieval flow locally, you need valid Apple certificates
for signing the generated configuration profile:

- Apple Distribution Certificate in `.p12` format, encoded as base64.
- Password for the `.p12` certificate.
- Apple Root and Intermediate certificates for the trust chain.

Required environment variables:

```bash
MDM_SERVER_P12_BASE64=
MDM_SERVER_P12_PASSCODE=
APPLE_ROOT_CERT_URL=https://www.apple.com/appleca/AppleIncRootCertificate.cer
APPLE_INTERMEDIATE_CERT_URL=https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer
```

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Build the production app and generate sitemap files
npm run start    # Start the production server
npm run lint     # Run Next.js linting
npm run indexnow:dry-run  # Preview the IndexNow payload from the live sitemap
npm run indexnow:submit   # Submit live sitemap URLs to IndexNow
npm run format   # Format the repository with Prettier
```

## Search Engine Presence

UDID Tools is prepared for discovery beyond Google:

- `robots.txt` allows standard crawlers plus Bingbot, DuckDuckBot,
  OAI-SearchBot, ChatGPT-User, and GPTBot.
- `sitemap.xml` is generated by `next-sitemap`.
- IndexNow verification is available at
  `https://www.udid.tools/e67fc0a36f388fc28107bace704aae67029e7c53858f74abbad717c694e31052.txt`.
- `npm run indexnow:submit` reads the live sitemap and submits public URLs to
  the IndexNow endpoint.

After adding the site in Bing Webmaster Tools, submit:

```text
https://www.udid.tools/sitemap.xml
```

For IndexNow, use this key:

```text
e67fc0a36f388fc28107bace704aae67029e7c53858f74abbad717c694e31052
```

## Contributing

Contributions are welcome, especially improvements to:

- UDID and iOS device identifier guides
- accessibility
- metadata and SEO correctness
- privacy and security documentation
- developer experience
- test coverage

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Security

Please do not open a public issue with sensitive security details. Read
[SECURITY.md](SECURITY.md) for responsible disclosure guidance.

## License

UDID Tools is released under the [MIT License](LICENSE).
