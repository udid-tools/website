# ADR 0001: Review the pinned npm installer network and file flows

- Status: Accepted
- Date: 2026-11-23

## Context

CodeQL alerts 8 (`js/file-access-to-http`) and 9 (`js/http-to-file-access`)
flag intentional network and filesystem operations in `.github/scripts/install-npm.mjs`.
The script is repository CI tooling and is not part of application runtime.

## Review

The only production entry point reads committed npm-toolchain.json and package.json.
Before any download, validateConfiguration requires an exact numeric version matching
packageManager, the exact official registry.npmjs.org npm tarball URL for that version,
and a pinned SHA-512 digest. No file contents are sent as request headers or body.
The request is a download from that allow-listed URL, with redirects disabled and a
60-second timeout. Both declared and streamed sizes are limited to 32 MiB.

installNpm verifies the complete downloaded archive against the committed SHA-512
value before handing bytes to the installer. The destination is a new temporary
directory with a fixed npm.tgz basename; remote input cannot select a filesystem path.
The file is created with mode 0600, installed offline with lifecycle scripts disabled,
and removed in a finally block. Subprocesses do not use a shell, and the installed
version must equal the pinned version.

Tests cover invalid URLs and versions, malformed integrity, tampered bytes rejected
before installation, download limits, disabled redirects, failed installations,
cleanup and installed-version mismatches. The existing 90% toolchain coverage gates
remain enforced.

## Decision

Classify alerts 8 and 9 as false positives for the reviewed implementation rather
than disable either CodeQL query or exclude the installer from analysis. Revisit this
review whenever URL validation, integrity verification, download bounds, filesystem
paths or invocation order change. A changed finding requires fresh review.
