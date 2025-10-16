import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './apps/tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
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
