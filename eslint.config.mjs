import { fixupPluginRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import nextBase from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";
import noLocationAssignRelativeDestination from "./eslint-rules/no-location-assign-relative-destination.mjs";

// Next 16's plugin currently installs unpatched braces@3.0.3 through fast-glob.
// Keep its complete rule set while the upstream dependency remains unresolved.
const compatibleNextPlugin = fixupPluginRules({
  ...nextPlugin,
  rules: {
    ...nextPlugin.rules,
    "no-location-assign-relative-destination": noLocationAssignRelativeDestination,
  },
});

const compatibleNextBase = nextBase.map((config) => {
  if (!config.plugins?.["@next/next"]) {
    return config;
  }

  return {
    ...config,
    plugins: {
      ...config.plugins,
      "@next/next": compatibleNextPlugin,
    },
  };
});

const eslintConfig = defineConfig([
  ...compatibleNextBase,
  {
    name: "next/core-web-vitals",
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-location-assign-relative-destination": "warn",
    },
  },
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
