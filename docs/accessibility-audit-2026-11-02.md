# Website accessibility audit — 2 November 2026

This practical audit targets [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/).
It is not a conformance evaluation, certification, or accessibility percentage.
The findings below describe confirmed barriers and the evidence available in this
change. A tool pass cannot establish that everyone can complete the journey.

## Scope and environments

The production baseline covered 15 routes/states: home; the guides index and all
six guides; Privacy Policy; Terms; the built-in sample result; missing and invalid
results; an unknown page; and an unknown guide. It used Chrome 156.0.8078.79 on
macOS 26.7, axe, source review, and browser inspection. Only public content and the
built-in sample were used. No real device identifiers, result tokens, profile
bodies, or signing material were included in evidence.

The changed production build was tested locally on macOS 26.7 using Node.js
22.14.0, npm 11.19.0, Playwright 1.64.1, and axe-core 4.14.0:

| Project       | Engine       | Profile                         |
| ------------- | ------------ | ------------------------------- |
| Chromium      | 156.0.8078.4 | Desktop Chrome                  |
| Firefox       | 157          | Desktop Firefox                 |
| Mobile WebKit | 27.2         | Playwright iPhone 13 descriptor |

Mobile WebKit emulates device settings; it is not a physical iPhone, installed
Safari, or VoiceOver. The displayed Safari minimum is now 16.4+, matching the
installed Next.js supported-browser guidance, instead of the unsupported iOS 12+
claim. Safari 16.4 itself was not tested.

## Confirmed findings and changes

The baseline scanner reported 18 rule findings across 15 routes: label/name
mismatches on 13 routes, one result-label contrast finding, and four landmark/region
findings across the two missing-page states. Some findings were repeated instances
of one shared component. These counts are not a count of all WCAG failures.

| Area                                | Before                                                                                                                                                                                                                       | Change and evidence                                                                                                                                                                                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visible labels and accessible names | The desktop QR link replaced its visible instruction with an unrelated accessible name. The footer announced a full commit SHA while displaying an abbreviated SHA.                                                          | QR naming now comes from visible content; the footer name contains the displayed SHA. QR browser-name assertions and footer SSR assertions exercise these fixes (WCAG 2.5.3).                                                                                                                                                  |
| Contrast                            | A result metadata label used slate-400 on white, below the 4.5:1 minimum for ordinary text. Copy icons used the same low-contrast color.                                                                                     | Labels/icons use the darker slate-600. Feedback icons use darker success/error colors. Axe covers rendered text contrast; source/color review also checked icon visibility (1.4.3, 1.4.11).                                                                                                                                    |
| Missing pages                       | Framework fallback pages lacked a main landmark and useful site recovery navigation.                                                                                                                                         | A custom page supplies the normal shell, one main, one H1, and a home link. Both unknown-route cases pass structural assertions and axe. Landmark warnings alone are not a complete WCAG determination.                                                                                                                        |
| Result feedback and focus           | Individual copy failure text was visually hidden and quickly cleared; fallback copying could lose focus/selection or leave its temporary control behind. Repeating the same message did not reliably mutate the live region. | Failure guidance stays visible; status regions are atomic and update on repeated actions. Copy labels stay stable. Fallback cleanup restores focus and selection, including failure paths. Browser checks and 100% clipboard unit coverage exercise these cases. Actual spoken announcements still need screen-reader testing. |
| Recovery states                     | Missing/invalid results offered limited recovery, empty values appeared blank, and export controls remained available without data. Profile-download failures returned generic plain text to browsers.                       | Results identify unavailable data, provide instruction/retry links, and disable empty actions. Browser requests receive a named HTML error document with readable recovery links; non-HTML clients retain plain text. Unit and browser tests exercise the 500 response.                                                        |
| Narrow layouts                      | Fixed result-control sizing and header/card arrangements constrained enlargement and wrapping; horizontal overflow was clipped globally.                                                                                     | Controls and cards wrap; long text can break. Fifteen routes are checked at 320 CSS pixels, with 200% root text enlargement and text-spacing overrides. Guide tables retain their two-dimensional layout inside named, keyboard-focusable scroll regions.                                                                      |

## Additional usability and resilience improvements

These changes go beyond the scanner findings; they are not presented as proof
that every previous behavior failed WCAG AA:

- A visible-on-focus skip link moves focus to main content. Header links remain
  available at mobile widths, with scroll clearance for desktop sticky navigation.
- Primary navigation, footer navigation/social links, and result actions have at least 44-pixel
  targets. WCAG 2.5.8 AA has a 24-pixel minimum with exceptions; the former
  36-pixel controls were not automatically AA failures.
- Motion content renders visibly before hydration. The production home H1 was
  confirmed at opacity zero without JavaScript; source/SSR inspection found 37
  initially invisible animated elements. Initial hiding is removed, reduced-motion
  preferences also reach JavaScript animation, and forced colors retain gradient
  text. No-JavaScript content visibility is resilience evidence, not a standalone WCAG claim.
- The QR handoff includes an address someone can type on their device. Decorative
  step numbers are excluded from the accessible name; instructional text remains.
- Native-share success, cancellation, failure, and unavailable-API fallback provide
  distinct persistent feedback. Their APIs are stubbed in browser regression tests;
  a real operating-system share sheet was not assessed.
- The root error document has its own title, language, viewport, and stylesheet.
  This was source-reviewed and SSR-tested; an actual root-layout crash was not
  activated in the browser.

## Methods and results

**Local result: 75/75 browser tests and 141/141 unit tests passed.** Browser checks
run in all three projects. `npm run verify` passed formatting, linting, type checks,
coverage gates, npm-toolchain tests, and the production build. Coverage is 98.46%
statements, 96.61% branches, 100% functions, and 98.93% lines; clipboard coverage is
100% in every category. Public pages remain static/SSG; result and API routes remain
request-rendered.

Axe reported zero violations in the final checked routes/states, including the
browser-facing profile-download error. Baseline axe also returned **170 incomplete
contrast-node checks**: these require human interpretation and were not counted as
passes or confirmed failures. Gradient, transparency, and background-dependent
contrast cannot be settled by a single scanner result. Source/color review and
normal home screenshots in Chrome and WebKit supplemented the automated checks;
not every pixel/state received a measured manual contrast assessment.

Programmatic browser checks cover language, heading/main structure, names, 320-pixel
reflow, text enlargement/spacing, keyboard traversal in both directions, skip-link
focus, sticky-header obstruction, scrollable tables, 44-pixel controls, reduced
motion, forced colors, and content without JavaScript. Clipboard/share outcomes and
missing/invalid results have interaction checks. Keyboard input plus DOM/geometry
inspection is not a screen-reader session. On macOS WebKit, traversal uses
[Option-Tab as documented by Apple](https://support.apple.com/en-gb/guide/safari/cpsh003/27.0/mac/27),
with Shift-Option-Tab for reverse traversal.

`npm audit --audit-level=high` passed; 15 existing moderate minimatch dependency
entries remain unchanged. Registry verification passed for 526 packages, with 151
verified attestations. PR CI and the latest Codecov report must still be reviewed
after the implementation commit is pushed; these local results do not replace them.

## Reproduce

Use the repository's prescribed Node/npm versions and an available OpenSSL command:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
npx --no-install playwright install chromium firefox webkit
npm run test:a11y
npm audit --audit-level=high
npm audit signatures
```

Linux CI installs browser system dependencies with Playwright's `--with-deps`
option. The test server starts the existing production build behind a loopback TLS
proxy, generates disposable local certificate material at runtime, and removes it
on shutdown. Production CSP headers remain active. `ignoreHTTPSErrors` is confined
to the local Playwright contexts and server health check. Browser traces, video,
and automatic screenshots are disabled; tests use the built-in public sample and
never need production secrets. Profile signing still fails closed in production;
the unavailable-profile response is intentional in this unconfigured test server.

## Remaining limits and review

No real VoiceOver, NVDA, JAWS, speech-control, switch-control, or physical-device
assessment was performed. Screen-reader reading order, announcement timing, rotor
navigation, and recovery need a maintainer pass. Actual browser zoom at 400%,
OS-level text scaling, and a complete visual check of every enlarged state remain
unverified; 320-pixel reflow and CSS text enlargement are useful proxies.

Apple controls Safari download prompts and iOS/iPadOS Settings installation UI.
A complete signed-profile installation and return journey was not tested on a real
device. No changes here establish accessibility of those system screens. The site
is English-only and has no dark theme; dark-mode operating-system behavior is not
a separately supported site theme. There is no media/audio content to caption in
the audited pages.

The footer policy link depends on [website #128](https://github.com/udid-tools/website/pull/128)
landing first. Related content-only policies are [core #84](https://github.com/udid-tools/core/pull/84)
and [device-info #80](https://github.com/udid-tools/device-info/pull/80). One independent
CODEOWNER approval is still required; this work does not authorize merge or deploy.

This review follows [W3C evaluation guidance](https://www.w3.org/WAI/test-evaluate/),
[statement guidance](https://www.w3.org/WAI/planning/statements/), and the WCAG 2.2
criteria. Future content and interaction changes should repeat relevant automated
checks and record actual assistive-technology testing when available.
