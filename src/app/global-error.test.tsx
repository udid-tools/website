import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import GlobalError from "@/app/global-error";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

it("supplies an independently readable, named recovery document when the root layout fails", () => {
  const html = renderToStaticMarkup(
    <GlobalError error={new Error("Unavailable")} reset={() => undefined} />
  );
  expect(html).toContain('<html lang="en">');
  expect(html).toContain("<title>Page unavailable · UDID Tools</title>");
  expect(html).toContain('name="viewport" content="width=device-width, initial-scale=1"');
  expect(html).toContain('<main class="max-w-md text-center">');
  expect(html).toContain("Something went wrong</h1>");
  expect(html).toContain('type="button"');
  expect(html).toContain("Try again</button>");
});
