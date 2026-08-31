# Contributing to the UDID Tools Website

The project welcomes focused bug fixes, accessibility and compatibility improvements, tests, content corrections, and carefully scoped features.

Before contributing, read the [Code of Conduct](CODE_OF_CONDUCT.md) and [Security Policy](SECURITY.md), then search existing issues and pull requests. Never submit real device identifiers, result links, configuration-profile responses, certificates, private keys, or passphrases.

## Development

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

Keep the current public content, layout, and behavior intact unless an issue explicitly approves a visible change. Fix demonstrable defects in security, privacy, accessibility, standards compliance, and browser compatibility. Store public content in source control; do not introduce a CMS or database for static site content.

Use `@udid-tools/core` for profile generation and response parsing, and `@udid-tools/device-info` for device and operating-system metadata. Do not duplicate those libraries inside the website.

## Dependencies and security

Install only official npm releases, pin direct dependencies exactly, and justify every addition in the pull request. Dependency lifecycle scripts are disabled by default. Untrusted request paths require negative tests and explicit resource bounds.

## Commits and pull requests

Use small, imperative commits and complete the pull request template. Describe user-visible impact, privacy and security implications, browser checks, and exact verification performed. Do not commit, push, tag, release, or deploy on behalf of the maintainer unless explicitly requested.
