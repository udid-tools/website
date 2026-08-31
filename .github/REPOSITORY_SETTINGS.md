# Repository and deployment settings

## GitHub repository

- Keep the repository public and enable Private Vulnerability Reporting, secret scanning, push protection, Dependabot alerts, and dependency graph.
- Protect `main`; require pull requests, CODEOWNER review for sensitive files, conversation resolution, signed commits, linear history, and the CI, CodeQL, dependency-review, and npm-audit checks.
- While the organization has only one CODEOWNER, allow organization administrators to bypass the rules only through a pull request so the repository is not deadlocked. Do not allow direct-push bypass, and remove the exception once independent reviewers are available.
- Keep OpenSSF Scorecard enabled for pushes, branch-protection changes, and its weekly schedule; it is not a pull-request check.
- Restrict tag creation for `v*` to maintainers. The release workflow additionally rejects lightweight or unverified tags.
- Enable Immutable Releases. The workflow creates all assets in one operation so GitHub can lock the tag and assets and generate its release attestation.
- Give Actions read-only repository permissions by default and allow workflows to create pull requests only if later needed.

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

The Vercel CLI is intentionally isolated from the application lockfile and invoked at an exact npm version inside deployment workflows. The application dependency audit therefore covers only code shipped with the website.
