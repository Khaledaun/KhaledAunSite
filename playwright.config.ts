import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: 'html',
  timeout: 60 * 1000, // 60 seconds per test
  globalTimeout: 18 * 60 * 1000, // 18 minutes for all tests
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    actionTimeout: 15 * 1000, // 15 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // In CI, apps are started manually by the workflow for better logging
  // In local dev, uncomment webServer to auto-start the admin app
  webServer: process.env.CI ? undefined : {
    command: 'cd apps/admin && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
