# UDID Tools Website

[![CI](https://github.com/udid-tools/website/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/udid-tools/website/actions/workflows/ci.yml)
[![Security](https://github.com/udid-tools/website/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/udid-tools/website/actions/workflows/security.yml)
[![Coverage](https://codecov.io/gh/udid-tools/website/branch/main/graph/badge.svg)](https://codecov.io/gh/udid-tools/website)
[![Deployment](https://img.shields.io/github/actions/workflow/status/udid-tools/website/release.yml?label=deployment)](https://github.com/udid-tools/website/actions/workflows/release.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/udid-tools/website/badge)](https://scorecard.dev/viewer/?uri=github.com/udid-tools/website)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/14396/badge)](https://www.bestpractices.dev/projects/14396)
[![License: MIT](https://img.shields.io/github/license/udid-tools/website)](./LICENSE)

The official [UDID Tools](https://www.udid.tools) marketing website and free Safari-based utility for retrieving an iPhone or iPad UDID. It is also a public integration example for [`@udid-tools/core`](https://github.com/udid-tools/core) and [`@udid-tools/device-info`](https://github.com/udid-tools/device-info).

## What UDID Tools does

UDID Tools retrieves the Unique Device Identifier of an iPhone or iPad directly in Safari. The
public flow does not require an account, Apple ID, payment, desktop computer, USB cable, iTunes,
Xcode, or an app installation.

1. Open [udid.tools](https://www.udid.tools/) in Safari on the device to identify.
2. Allow the configuration-profile download.
3. Review and install the profile in iOS or iPadOS Settings.
4. Return to the result page and copy the identifier provided by iOS.

The profile requests the documented device-attribute categories used by Apple's Profile Service
flow. The website is not an MDM server and does not enroll the device in remote management.

## Privacy model

The application is designed to process device information only to complete the requested flow and
display the result, without creating an account or persisting a server-side UDID record. The iOS
response is encrypted into a versioned bearer token carried in the result-page URL, so that URL
should be treated as sensitive and shared only with an intended recipient.

Public informational pages use privacy-limited Vercel Web Analytics and Speed Insights. Sentry is
configured without request bodies, default personal information, or Session Replay, and monitoring
filters remove device identifiers, result tokens, and URL query strings. Hosting and operational
logging caveats are documented in the [Privacy Policy](https://www.udid.tools/privacy-policy).

## Canonical guides

- [How to find an iPhone or iPad UDID](https://www.udid.tools/guides/how-to-find-iphone-udid)
- [How to get an iPhone UDID without iTunes or a computer](https://www.udid.tools/guides/get-udid-without-itunes)
- [What an iPhone UDID is and why developers need it](https://www.udid.tools/guides/what-is-udid)
- [Whether it is safe to share a UDID](https://www.udid.tools/guides/is-it-safe-to-share-udid)
- [When app testing and provisioning need a UDID](https://www.udid.tools/guides/udid-for-app-testing)
- [UDID compared with serial number, IMEI, and MEID](https://www.udid.tools/guides/udid-vs-serial-number-vs-imei)

## Local development

Use Node.js 22.14.0 or newer and the npm version declared in `package.json`.

```bash
npm ci --ignore-scripts --no-audit --no-fund
cp .env.example .env.local
npm run dev
```

Local development defaults to unsigned configuration profiles and development-only cryptographic keys. Production and preview deployments must configure their own signing, response-verification, challenge, and result-token secrets.

Run the full quality gate before proposing a change:

```bash
npm run verify
npm audit --audit-level=high
npm audit signatures
```

## Release integrity

Releases contain the exact archived `.vercel/output` directory deployed to production, its checksum, CycloneDX SBOM, and portable Sigstore attestation bundles. Verify a downloaded artifact with:

```bash
gh attestation verify website-v1.0.0.vercel-output.tar.gz --repo udid-tools/website
sha256sum --check website-v1.0.0.vercel-output.tar.gz.sha256
```

Production deployment rebuilds nothing: Vercel receives the verified release artifact through `vercel deploy --prebuilt`.
The release build also embeds its validated signed tag and exact commit SHA in that artifact. The
footer links the tag to the corresponding GitHub Release and the full SHA to the immutable commit;
preview builds show only their commit, while local builds make no deployment-source claim.

## Security

Never report a vulnerability or share a real device identifier, result link, profile response, certificate, private key, or passphrase in a public issue. Use [private vulnerability reporting](https://github.com/udid-tools/website/security/advisories/new).

## License

[MIT](LICENSE) © UDID Tools contributors.
