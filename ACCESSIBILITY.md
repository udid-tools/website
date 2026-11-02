# Accessibility

We want people with disabilities to be able to use and contribute to UDID Tools.
Our target for web content we maintain is
[WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/). This is a working target,
not a certification or a claim of verified conformance. Accessibility requires
ongoing work and feedback from people using assistive technology.

## Scope

This policy covers the public [UDID Tools website](https://www.udid.tools/):
public pages, guides and instructions, navigation, starting UDID retrieval,
waiting and error messages, and displaying, copying, sharing, or downloading a
result. It also covers this repository's README, examples, and contributor content.

Apple's Safari download prompts and iOS/iPadOS Settings profile installation
screens are part of the end-to-end journey, but Apple controls their interface.
We can improve our instructions and explain alternatives; we cannot change those
system screens. The SDKs have their own policies for the content they maintain.

## Shared principles

All three UDID Tools repositories follow these principles within their scope:

- Use semantic headings, landmarks, lists, tables, and controls with clear names.
- Make interactive content usable by keyboard, with logical focus order, visible
  focus, a way to bypass repeated navigation, and no keyboard traps.
- Provide useful text alternatives. Keep decorative images and icons out of the
  accessible name; do not rely on color, images, position, or motion alone.
- Keep text and controls readable with sufficient contrast, text enlargement,
  narrow screens, and user preferences such as reduced motion.
- Use descriptive links, plain instructions, a declared content language, and
  programmatically available errors, status changes, and control states.
- Preserve privacy when testing or helping someone complete a task.

## Report a barrier or request help

Open an [accessibility issue](https://github.com/udid-tools/website/issues/new)
with “Accessibility” in the title, or email [hello@udid.tools](mailto:hello@udid.tools)
if GitHub is difficult to use or the report should stay private. You do not need
to identify a WCAG criterion or disclose a disability.

When safe, include:

- The page path or documentation heading, and what you were trying to do.
- Steps to reproduce, what happened, and what you expected.
- Browser, operating system, viewport or zoom level, and assistive technology
  with versions if known.
- The impact on completing the task and any workaround you found.

Share a page path without a query string. Never include a real UDID, IMEI, MEID,
serial number, result link or token, challenge value, profile body, certificate,
private key, passphrase, or other confidential information. Use invented examples;
remove sensitive content from screenshots and recordings before sharing. If the
barrier also exposes a security problem, use the private channel in
[SECURITY.md](./SECURITY.md).

## How the two maintainers respond

[Baskerville42](https://github.com/Baskerville42) and
[nastyabon8](https://github.com/nastyabon8) share responsibility for accessibility.
Either can acknowledge and triage a report; one coordinates the fix and updates
the reporter. Changes receive an independent review from the other CODEOWNER;
a change's author does not approve their own work.

We aim to acknowledge reports within one week and discuss impact and next steps
at the next available maintainer session. These are best-effort expectations for
two maintainers, not a staffed support service or a guaranteed repair deadline.
If you have not heard back after two weeks, please follow up through either
channel. We prioritize barriers that prevent a core task, affect many pages, or
have no reasonable workaround. We agree a practical next step after triage,
explain delays or dependencies, and offer a safe workaround when possible.

A report stays open until the fix is checked, the limitation and next step are
explained, or the reporter confirms an alternative works. We ask for reporter
feedback when useful, without making their availability a condition of a fix.

## Contributor checks

For changes to web UI or documentation rendering, combine an automated scan
with keyboard checks. Check meaningful reading order, headings and landmarks,
accessible names and states, status/error feedback, contrast, zoom/reflow,
touch targets, and reduced motion. Check light/dark themes if the affected surface
supports them. For substantial interaction changes, include a real screen-reader
check when available and identify untested combinations.

For content changes, check plain instructions, link purpose, text alternatives,
code explanations, and table headers. Keep existing verification and coverage
gates. A successful build, linter, test suite, or automated accessibility scan is
useful evidence, but does not prove WCAG conformance.

In the pull request, record the date, routes/states, browser and OS versions,
tools, manual steps, results, and remaining limitations. Distinguish a DOM or
accessibility-tree inspection from actual screen-reader use. Recheck reported
barriers after a fix, and revisit this statement when scope, verified support, or
known limitations change. We use free tools and do not require a paid service.

## Assessment and known limitations

Statement last reviewed: **2 November 2026**.

This initial statement was prepared through repository and source review in a
macOS 26.7 development environment. It records the policy and the scope of our work;
it is not a completed conformance evaluation. Repository build and test results
are reported separately in the related pull request. There is no independent
accessibility certification, and no claim that every browser or assistive
technology combination has been tested.

- The website is in English; translations are not currently provided.
- The profile-installation journey requires a supported iPhone or iPad and Safari.
  Desktop QR access is an additional route to the website, not a replacement for
  readable instructions or a direct link.
- Apple controls system prompts and Settings. Reports about those steps still help
  us improve explanations and identify where an alternative is needed.
- A complete real-device Safari/VoiceOver and Windows/NVDA assessment has not been
  completed for this statement. Automated scans, source inspection, and browser
  emulation cannot establish those results.

The README's “Accessibility: policy” badge links here. It describes the existence
of this policy, not an audit score or conformance level.

## References

- [W3C guidance on accessibility statements](https://www.w3.org/WAI/planning/statements/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Open Source Accessibility Toolkit statement template](https://github.com/open-source-accessibility/accessibility-toolkit/blob/main/ACCESSIBILITY.md)
- [Shields.io static badge documentation](https://shields.io/badges/static-badge)

References reviewed on 2 November 2026.
