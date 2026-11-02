# Repository and deployment settings

## GitHub repository

- Keep the repository public and enable Private Vulnerability Reporting, secret scanning, push protection, Dependabot alerts, and dependency graph.
- Protect `main`; require pull requests, approval from the other maintainer, CODEOWNER review for sensitive files, conversation resolution, signed commits, linear history, and the CI, CodeQL, CodeQL Actions, Secret scanning, dependency-review, and npm-audit checks. Do not allow administrator bypass.
- Keep paid GitHub Code Quality disabled. Run the free CodeQL `security-and-quality` suite together with `security-extended`, and use the free Gitleaks CLI for additional secret scanning.
- Keep OpenSSF Scorecard enabled for pushes, branch-protection changes, and its weekly schedule; it is not a pull-request check.
- Restrict tag creation for `v*` to maintainers. The release workflow additionally rejects lightweight or unverified tags.
- Enable Immutable Releases. The workflow creates all assets in one operation so GitHub can lock the tag and assets and generate its release attestation.
- Give Actions read-only repository permissions by default and allow workflows to create pull requests only if later needed.

## Dependency verification

All Node.js workflows install the npm version declared in `packageManager` through `.github/scripts/install-npm.mjs`. The installer verifies the official registry tarball against the SHA-512 integrity value in `.github/npm-toolchain.json` before installing it with lifecycle scripts disabled. Keep the declared version and integrity metadata synchronized when reviewing an npm update. Registry signatures and provenance attestations remain mandatory.

Scoped overrides upgrade the build-time `glob` consumers in the Sentry bundler and Next.js lint plugin to the patched API-compatible release. The TypeScript parser uses the patched modern `minimatch` API. The legacy ESLint packages still require the callable CommonJS API of `minimatch` 3; replacing it with version 11 would break those consumers. Keep this upstream dependency finding visible until compatible official releases are available. The integrity-pinned npm CLI also bundles older `glob` and `minimatch`; no compatible official npm release currently removes both findings.

## Free supplementary scanning

The JavaScript/TypeScript CodeQL job runs both `security-extended` and `security-and-quality`. The latter adds maintainability and reliability queries while retaining the extended security suite. The dedicated Actions analysis remains enabled separately. Public repositories use the existing free CodeQL scanning capability; no paid Code Quality product is required.

The `Secret scanning` job runs the MIT-licensed Gitleaks CLI 8.30.1 directly, verified against a pinned official-release SHA-256 checksum. It scans all Git refs and the tracked working tree with upstream default rules, ignores inline bypass comments, and does not load repository allowlists. Every invocation uses 100% redaction; scanner output is discarded and no finding reports or artifacts are uploaded. A failed scan produces only a generic failure message. Investigate locally with the same pinned CLI and full redaction.

## npm installer data-flow controls

The npm installer intentionally downloads public package metadata from its validated exact official HTTPS URL. Downloads reject redirects and are bounded to 32 MiB and 60 seconds. SHA-512 is verified before the archive is written or installed; the temporary directory is private and the archive is mode 0600. Installation runs without a shell, with network fallback and lifecycle scripts disabled. These controls address the outbound-network and downloaded-file data flows without query exclusions or inline suppressions.

## GitHub environments

Create `release`, `production`, and `preview` environments. Require maintainer approval for `release` and `production`. Store these Vercel credentials as environment secrets where they are used:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Set the repository or preview-environment variable `VERCEL_PREVIEW_DOMAIN` to a stable preview hostname such as `preview.udid.tools`.

Store the production-only ownership verification contents as repository Actions secrets. The release workflow writes them directly into the signed deployment artifact; the files themselves remain outside Git:

- `SITE_VERIFICATION_TXT_CONTENT`
- `GOOGLE_SITE_VERIFICATION_HTML_CONTENT`

## Vercel

- Keep the Git repository disconnected from the Vercel project. `vercel.json` also disables Git-based deployments as defense in depth. Production must be deployed only by `.github/workflows/release.yml`.
- Configure the production environment with `UDID_TOOLS_PUBLIC_ORIGIN=https://www.udid.tools`, signed profile mode, the PKCS#12 identity and certificate chain, response-verification policy, challenge secret, and result-token keyring from `.env.example`.
- Configure preview with a stable HTTPS origin matching `VERCEL_PREVIEW_DOMAIN`. The manual preview workflow updates that alias and exercises the full profile flow.
- Keep previous result-token keys in the JSON keyring when rotating the active key; removing a key invalidates links created with it.
- Configure Sentry variables only if monitoring is enabled. Session Replay and default PII collection must remain disabled.

The Vercel CLI is intentionally isolated from the application lockfile and invoked at an exact npm version inside deployment workflows. The application dependency audit covers the application and development dependencies in that lockfile; it does not audit temporary Vercel CLI installations.
