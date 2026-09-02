# UDID Tools Website

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/14396/badge)](https://www.bestpractices.dev/projects/14396)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/udid-tools/website/badge)](https://scorecard.dev/viewer/?uri=github.com/udid-tools/website)

The official [UDID Tools](https://www.udid.tools) marketing website and free Safari-based utility for retrieving an iPhone or iPad UDID. It is also a public integration example for [`@udid-tools/core`](https://github.com/udid-tools/core) and [`@udid-tools/device-info`](https://github.com/udid-tools/device-info).

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

## Security

Never report a vulnerability or share a real device identifier, result link, profile response, certificate, private key, or passphrase in a public issue. Use [private vulnerability reporting](https://github.com/udid-tools/website/security/advisories/new).

## License

[MIT](LICENSE) © UDID Tools contributors.
