import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/accessibility",
  fullyParallel: true,
  workers: process.env["CI"] ? 2 : 3,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "https://127.0.0.1:3100",
    ignoreHTTPSErrors: true,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env["PLAYWRIGHT_CHANNEL"]
          ? { channel: process.env["PLAYWRIGHT_CHANNEL"] }
          : {}),
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 13"], defaultBrowserType: "webkit" } },
  ],
  webServer: {
    command: "node tests/accessibility/server.mjs",
    url: "https://127.0.0.1:3100",
    reuseExistingServer: false,
    ignoreHTTPSErrors: true,
    timeout: 60_000,
  },
});
