import { Linter } from "eslint";
import { describe, expect, it } from "vitest";
import rule from "./no-location-assign-relative-destination.mjs";

const config = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        globalThis: "readonly",
        location: "readonly",
        self: "readonly",
        window: "readonly",
      },
      sourceType: "module",
    },
    plugins: {
      local: {
        rules: {
          "no-location-assign-relative-destination": rule,
        },
      },
    },
    rules: {
      "local/no-location-assign-relative-destination": "error",
    },
  },
];

function verify(source) {
  return new Linter().verify(source, config);
}

describe("no-location-assign-relative-destination", () => {
  it.each([
    "location.assign('/result')",
    "window.location.assign(`/result/${token}`)",
    "globalThis.location.href = '/result'",
    "const target = '/result'; self.location.href = target",
  ])("reports internal navigation in %s", (source) => {
    expect(verify(source)).toEqual([
      expect.objectContaining({
        messageId: "noLocationAssign",
        ruleId: "local/no-location-assign-relative-destination",
        severity: 2,
      }),
    ]);
  });

  it.each([
    "location.assign('https://www.udid.tools/result')",
    "window.location.href = '//www.udid.tools/result'",
    "function navigate(location) { location.assign('/result') }",
  ])("allows external or shadowed navigation in %s", (source) => {
    expect(verify(source)).toEqual([]);
  });
});
