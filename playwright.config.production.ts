import { defineConfig, devices } from '@playwright/test';

/**
 * Production E2E Test Configuration
 * Tests against live deployed applications on Vercel
 */
export default defineConfig({
  testDir: './apps/tests/e2e-production',
  fullyParallel: false, // Run sequentially to avoid conflicts
  forbidOnly: true,
  retries: 2, // Retry flaky tests
  workers: 1, // Single worker for production tests
  timeout: 60 * 1000, // 60 second timeout per test
  reporter: [
    ['html', { outputFolder: 'test-results/production-report' }],
    ['json', { outputFile: 'test-results/production-results.json' }],
    ['list'],
  ],
  use: {
    baseURL: 'https://www.khaledaun.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30 * 1000,
    actionTimeout: 15 * 1000,
  },
  projects: [
    {
      name: 'public-site',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.khaledaun.com',
      },
      testMatch: /.*public-site\.spec\.ts/,
    },
    {
      name: 'admin-dashboard',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: 'https://admin.khaledaun.com',
      },
      testMatch: /.*admin-dashboard\.spec\.ts/,
    },
    {
      name: 'integration',
      use: { 
        ...devices['Desktop Chrome'],
      },
      testMatch: /.*integration\.spec\.ts/,
      dependencies: ['public-site', 'admin-dashboard'],
    },
  ],
});

