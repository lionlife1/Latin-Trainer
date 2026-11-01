import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // PW_CHANNEL=chrome runs against the installed Chrome when Playwright's own browser isn't downloaded.
  use: { baseURL: 'http://localhost:5174', trace: 'retain-on-failure', channel: process.env.PW_CHANNEL || undefined },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
  },
});
