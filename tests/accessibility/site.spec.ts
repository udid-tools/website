import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/guides",
  "/guides/how-to-find-iphone-udid",
  "/guides/get-udid-without-itunes",
  "/guides/what-is-udid",
  "/guides/udid-for-app-testing",
  "/guides/is-it-safe-to-share-udid",
  "/guides/udid-vs-serial-number-vs-imei",
  "/privacy-policy",
  "/terms",
  "/success?result=sample",
  "/success",
  "/success?result=invalid",
  "/missing-page",
  "/guides/missing-guide",
];

async function focusedTargetIsVisible(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return true;
    const r = el.getBoundingClientRect();
    const x = Math.max(0, r.left) + Math.min(r.width / 2, 10);
    const y = Math.max(0, r.top) + Math.min(r.height / 2, 10);
    const hit = document.elementFromPoint(x, y);
    return !!hit && (el.contains(hit) || hit.contains(el));
  });
}

// Test only public pages and the built-in sample. No real device data or trace artifacts.
for (const route of routes) {
  test(`accessible structure, names, contrast and reflow: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))
    ).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    // Simulate 200% text enlargement independently of viewport/device scaling.
    await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.locator("main a, main button").evaluateAll((elements) =>
        elements.every((el) => {
          const r = el.getBoundingClientRect();
          return r.width === 0 || (r.left >= -1 && r.right <= innerWidth + 1);
        })
      )
    ).toBe(true);
    await page.addStyleTag({
      content:
        "html { font-size: 100% !important; } * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }",
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true
    );
  });
}

test("skip navigation, mobile navigation and anchor targets work from a keyboard", async ({
  page,
  browserName,
}) => {
  const nextKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
  const previousKey =
    browserName === "webkit" && process.platform === "darwin" ? "Shift+Alt+Tab" : "Shift+Tab";
  await page.goto("/");
  await page.keyboard.press(nextKey);
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Guides" })
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/#how-it-works");
  await expect
    .poll(async () =>
      page.locator("#how-it-works").evaluate((el) => el.getBoundingClientRect().top)
    )
    .toBeGreaterThanOrEqual(100);
  // Traverse every control in both directions and check the focused target is not covered by the header.
  await page.goto("/");
  for (let index = 0; index < 38; index++) {
    await page.keyboard.press(nextKey);
    await expect.poll(() => focusedTargetIsVisible(page)).toBe(true);
  }
  for (let index = 0; index < 38; index++) {
    await page.keyboard.press(previousKey);
    await expect.poll(() => focusedTargetIsVisible(page)).toBe(true);
  }
});

test("essential content remains visible without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(`${baseURL}/`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("opacity", "1");
  await expect(page.getByRole("heading", { name: "How it works", exact: true })).toHaveCSS(
    "opacity",
    "1"
  );
  await expect(
    page.getByRole("link", { name: "Get iPhone UDID", exact: true }).first()
  ).toBeVisible();
  await context.close();
});

test("reduced motion and forced colors keep controls and content visible", async ({
  page,
  browserName,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/");
  await expect(page.locator("main h1")).toHaveCSS("opacity", "1");
  await expect(page.locator("main h1")).toHaveCSS("transform", "none");
  await expect(page.locator("main h1 span")).not.toHaveCSS("color", "rgba(0, 0, 0, 0)");
  await page.keyboard.press(
    browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab"
  );
  await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveCSS(
    "outline-style",
    "solid"
  );
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe(
    "auto"
  );
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("main h1")).toHaveCSS("transform", "none");
});

test("QR link keeps the visible label in its accessible name and supplies a typed alternative", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // Mobile Safari intentionally does not show the desktop handoff.
  const qr = page.getByRole("link", { name: /Scan to continue on iPhone or iPad/ });
  if (testInfo.project.name !== "mobile-webkit") {
    await expect(qr).toBeVisible();
    await expect(qr).toContainText("Or open www.udid.tools in Safari on your device.");
  } else await expect(qr).toHaveCount(0);
});

test("copy failures stay visible, are announced and preserve keyboard focus", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("Unavailable");
        },
      },
    });
    document.execCommand = () => false;
  });
  await page.goto("/success?result=sample");
  const copy = page.getByRole("button", { name: "Copy UDID", exact: true });
  await copy.focus();
  await page.keyboard.press("Enter");
  await expect(copy).toBeFocused();
  const failure = page.getByRole("status").filter({ hasText: "Copy failed for UDID" });
  await expect(failure).toBeVisible();
  await expect(failure).toHaveAttribute("aria-atomic", "true");
  await page.getByRole("button", { name: "Copy All", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Copy failed. Please copy manually." })
  ).toBeVisible();
  expect(await page.locator("textarea").count()).toBe(0);
});

test("copy success, native share outcomes and download expose useful status", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => undefined });
  });
  await page.goto("/success?result=sample");
  await page.getByRole("button", { name: "Copy All", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "All device info copied" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Copy JSON", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "All device info (JSON) copied" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Device information shared." })
  ).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new DOMException("Canceled", "AbortError");
      },
    })
  );
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Sharing canceled." })).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(navigator, "share", {
      value: async () => {
        throw new Error("Unavailable");
      },
    })
  );
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Sharing failed. Use Copy All or Download .txt instead." })
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("device-info.txt");
});

test("missing results give recovery instructions and disable empty exports", async ({ page }) => {
  await page.goto("/success");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Device information unavailable"
  );
  await expect(page.getByRole("link", { name: "Review the instructions" })).toBeVisible();
  for (const name of ["Share", "Copy All", "Copy JSON", "Download .txt", "Copy UDID"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeDisabled();
  }
});

test("guide tables have a named keyboard scroll region and touch controls are generous", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/guides/udid-vs-serial-number-vs-imei");
  const region = page.getByRole("region", { name: /scroll horizontally/ }).first();
  await expect(region).toHaveAttribute("tabindex", "0");
  await region.focus();
  if (await region.evaluate((el) => el.scrollWidth > el.clientWidth)) {
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  }
  await expect(region).toBeFocused();
  await page.goto("/success?result=sample");
  const small = await page.locator("button, nav a").evaluateAll((elements) =>
    elements
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.height < 44 || r.width < 44);
      })
      .map((el) => el.tagName)
  );
  expect(small).toEqual([]);
});

test("profile download errors have a readable, keyboard-accessible recovery page", async ({
  page,
}) => {
  const response = await page.goto("/api/register.signed.mobileconfig");
  expect(response?.status()).toBe(500);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Profile download unavailable");
  await expect(page.getByRole("link", { name: "Try downloading again" })).toBeVisible();
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.map(({ id }) => id)).toEqual([]);
});

test("repeated copy feedback updates its live region and unavailable share has a fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  });
  await page.goto("/success?result=sample");
  const copy = page.getByRole("button", { name: "Copy All", exact: true });
  await copy.click();
  const message = page.getByRole("status").filter({ hasText: "All device info copied" });
  const first = await message.locator("span").elementHandle();
  await copy.click();
  expect(await first?.evaluate((el) => el.isConnected)).toBe(false);
  await expect(copy).toHaveText("Copy All");
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Native sharing is unavailable, so device info was copied" })
  ).toBeVisible();
});
