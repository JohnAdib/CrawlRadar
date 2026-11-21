import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./apps/web", import.meta.url)) },
  },
  test: {
    include: ["apps/web/**/*.test.ts", "supabase/functions/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/.next/**"],
    coverage: {
      provider: "v8",
      // Unit-tested logic. UI and server routes are covered by the Playwright suite in e2e/.
      include: [
        "apps/web/lib/**/*.ts",
        "apps/web/app/api/**/*.ts",
        "supabase/functions/_shared/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "apps/web/lib/database.types.ts"],
      reporter: ["text", "json-summary", "lcov"],
      thresholds: { 100: true },
    },
  },
})
