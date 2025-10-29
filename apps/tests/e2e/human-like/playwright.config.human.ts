import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Human-Like Tests
 * 
 * Optimized for behavioral simulation with:
 * - Extended timeouts for realistic human pauses
 * - Video and trace capture for UX analysis
 * - Detailed error reporting
 */

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  
  // Test execution
  fullyParallel: false, // Run sequentially to avoid database conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to simulate real human (one at a time)
  
  // Timeouts (extended for human-like behavior)
  timeout: 600000, // 10 minutes per test (human workflows are slow)
  expect: {
    timeout: 10000, // 10s for assertions
  },
  
  // Reporter
  reporter: [
    ['html', { outputFolder: '../../../playwright-report-human', open: 'never' }],
    ['json', { outputFile: '../../../test-results/human-like-results.json' }],
    ['list'], // Console output
  ],
  
  // Global setup/teardown
  // globalSetup: require.resolve('./global-setup.ts'),
  // globalTeardown: require.resolve('./global-teardown.ts'),
  
  use: {
    // Base URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Browser options
    headless: process.env.CI ? true : false, // Show browser locally
    viewport: { width: 1280, height: 720 },
    
    // Tracing (for UX analysis)
    trace: 'on', // Always capture trace for behavioral analysis
    video: 'on', // Always capture video to review human-like flow
    screenshot: 'on', // Capture screenshots at each step
    
    // Network
    ignoreHTTPSErrors: true,
    
    // Context options
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Action timeouts (realistic for human interactions)
    actionTimeout: 15000, // 15s (humans are slow)
    navigationTimeout: 30000, // 30s for page loads
  },
  
  // Projects (browsers to test)
  projects: [
    {
      name: 'owner-chrome',
      testMatch: '**/owner-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Owner uses large desktop
      },
    },
    {
      name: 'editor-safari',
      testMatch: '**/editor-*.spec.ts',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'author-firefox',
      testMatch: '**/author-*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1366, height: 768 }, // Author uses laptop
      },
    },
    {
      name: 'reviewer-edge',
      testMatch: '**/reviewer-*.spec.ts',
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'subscriber-mobile',
      testMatch: '**/subscriber-*.spec.ts',
      use: {
        ...devices['iPhone 13 Pro'],
      },
    },
    {
      name: 'integration-chrome',
      testMatch: '**/crm-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'cron-jobs',
      testMatch: '**/{linkedin-job,webhook-events}.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: true, // Background jobs don't need UI
      },
    },
  ],
  
  // Web server (start dev server)
  webServer: {
    command: 'npm run dev:admin',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});

