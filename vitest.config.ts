import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": `${root}src`,
      "server-only": `${root}src/test/server-only.ts`,
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "src/lib/http.ts",
        "src/lib/profile-challenge.ts",
        "src/lib/result-token.ts",
        "src/lib/observability/sentry.ts",
      ],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 90 },
    },
  },
});
