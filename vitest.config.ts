import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.{idea,git,cache,output,temp}/**"],
    coverage: {
      reporter: ["text", "lcov", "json"],
      include: ["src/lib/**/*.ts", "src/app/api/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts", "src/app/api/**/*.test.ts", "**/*.d.ts"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
