import { defineConfig } from "@playwright/test";

// Set BASE_URL to test an already-running server (for example a production build or a Vercel preview).
const baseURL = process.env.BASE_URL;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts", // not *.spec.ts / *.test.ts, so Vitest does not pick these up
  use: { baseURL: baseURL ?? "http://localhost:3000" },
  webServer: baseURL ? undefined : { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
});
