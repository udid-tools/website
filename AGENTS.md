<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UDID Tools website engineering contract

This repository is the official marketing website and free UDID utility. Preserve its public content, visual design, route structure, and interaction behavior unless a task explicitly authorizes a visible change. Fix genuine security, privacy, accessibility, standards, and compatibility defects.

## Commit and pull request titles

- Every commit subject and pull request title must follow Conventional Commits:
  `<type>[optional scope][!]: <description>`.
- Use `fix` for every defect correction, including UI and CSS defects, and `feat` for new
  behavior. Other appropriate types include `docs`, `refactor`, `test`, `perf`, `build`, `ci`,
  `chore`, and `revert`.
- Never use an untyped subject or title such as `Fix ...` or `Update ...`. A bug fix must start
  with `fix:` or `fix(scope):`.
- Check both the commit subject and pull request title before pushing or opening the pull request.
  Keep them compliant when amending or updating an open pull request.

## Architecture

- Next.js App Router, React, TypeScript, Tailwind CSS, and Node.js 22.14 or newer.
- Keep public pages static or SSG. Only result and API routes should render per request.
- Content remains hardcoded in the repository. Do not add a CMS or database for public content.
- Use `@udid-tools/core` for configuration-profile generation and response parsing.
- Use `@udid-tools/device-info` for device-model and operating-system metadata.
- Result links are versioned AES-256-GCM bearer tokens. Never restore plaintext device query parameters.
- Local unsigned profile mode is development-only. Production signing fails closed and accepts only configured PKCS#12 and PEM material.
- Environment names describe application roles, not a certificate vendor or a broader device-management product.

## Privacy and security

Never log, track, commit, fixture, or place in errors: profile bodies, result tokens, challenge values, UDID, IMEI, MEID, serial numbers, certificates, private keys, or passphrases. Bound request bodies before parsing. Keep Sentry body capture, default PII, and Session Replay disabled, and strip query strings from monitoring events.

## Dependencies and verification

Use only official npm releases, install through npm, and pin every direct dependency exactly. Lifecycle scripts remain disabled unless separately reviewed. Run:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npm audit --audit-level=high
npm audit signatures
```

Coverage gates match the organization baseline at 90% for lines, statements, functions, and branches. Do not weaken pinned GitHub Action SHAs, CodeQL, dependency review, Scorecard, release attestations, or exact-artifact deployment.

## Releases

Releases require a GitHub-verified signed annotated tag. Build `.vercel/output` once, generate checksum and SBOM, attest it with Sigstore, publish every verification asset, and deploy that exact archive with `vercel deploy --prebuilt`. Never rebuild between release and production deployment. Do not commit, push, tag, publish, or deploy unless the repository owner explicitly requests it.
