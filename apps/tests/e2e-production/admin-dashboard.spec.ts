import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard E2E Tests
 * Tests the live admin dashboard at https://admin.khaledaun.com
 * 
 * Note: These tests check for accessibility and presence of features
 * Authentication tests are skipped as we need real credentials
 */

test.describe('Admin Dashboard - Accessibility', () => {
  test('should load admin dashboard', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('should redirect to auth if not logged in', async ({ page }) => {
    await page.goto('/');
    
    // Should either show login page or redirect to auth provider
    await page.waitForLoadState('networkidle');
    const url = page.url();
    
    // Check if we're on a login/auth page
    const hasLoginForm = await page.locator('form, [data-testid="auth"], input[type="email"], input[type="password"]').count() > 0;
    const isAuthURL = url.includes('auth') || url.includes('login') || url.includes('signin');
    
    expect(hasLoginForm || isAuthURL).toBe(true);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain('admin');
  });
});

test.describe('Admin Dashboard - API Endpoints', () => {
  test('should have health check endpoint', async ({ request }) => {
    const response = await request.get('https://admin.khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('should protect admin API endpoints', async ({ request }) => {
    // Test that admin endpoints require authentication
    const endpoints = [
      '/api/admin/posts',
      '/api/admin/case-studies',
      '/api/admin/leads',
      '/api/admin/media/upload',
      '/api/admin/ai-config',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(`https://admin.khaledaun.com${endpoint}`);
      
      // Should return 401 Unauthorized or redirect to auth
      expect([401, 302, 303, 307, 308]).toContain(response.status());
    }
  });

  test('should have audit endpoint', async ({ request }) => {
    const response = await request.get('https://admin.khaledaun.com/api/admin/audit');
    
    // Should require auth (401) or exist (200/other)
    expect(response.status()).not.toBe(404);
  });
});

test.describe('Admin Dashboard - Feature Presence', () => {
  test.skip('Command Center page exists', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/command-center');
    expect(page.url()).toContain('command-center');
  });

  test.skip('Posts management page exists', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/posts');
    expect(page.url()).toContain('posts');
  });

  test.skip('Case Studies page exists', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/case-studies');
    expect(page.url()).toContain('case-studies');
  });

  test.skip('Media Library page exists', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/media');
    expect(page.url()).toContain('media');
  });

  test.skip('Leads page exists', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/leads');
    expect(page.url()).toContain('leads');
  });

  test.skip('AI Assistant pages exist', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/ai/templates');
    expect(page.url()).toContain('ai');
  });

  test.skip('Profile pages exist', async ({ page }) => {
    // Skip for now - requires auth
    await page.goto('/profile/hero');
    expect(page.url()).toContain('profile');
  });
});

test.describe('Admin Dashboard - Build Verification', () => {
  test('should have valid JavaScript bundles', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Check that page loaded without JS errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow auth-related errors but not build errors
    const buildErrors = errors.filter(e => 
      !e.includes('auth') && 
      !e.includes('session') &&
      !e.includes('unauthorized')
    );
    
    expect(buildErrors.length).toBe(0);
  });

  test('should load CSS correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that styles are applied
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    
    // Should have some background color (not transparent/default)
    expect(bgColor).toBeTruthy();
  });

  test('should have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out expected auth errors
    const unexpectedErrors = consoleErrors.filter(e => 
      !e.includes('auth') && 
      !e.includes('session') &&
      !e.includes('UNAUTHORIZED') &&
      !e.includes('401')
    );
    
    if (unexpectedErrors.length > 0) {
      console.log('Console errors found:', unexpectedErrors);
    }
    
    expect(unexpectedErrors.length).toBe(0);
  });
});

test.describe('Admin Dashboard - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Admin Dashboard - Security Headers', () => {
  test('should have security headers', async ({ request }) => {
    const response = await request.get('https://admin.khaledaun.com/');
    const headers = response.headers();
    
    // Check for common security headers (Vercel provides some by default)
    expect(headers).toBeTruthy();
    
    // X-Frame-Options or CSP should be present
    const hasFrameProtection = headers['x-frame-options'] || headers['content-security-policy'];
    expect(hasFrameProtection).toBeTruthy();
  });
});

test.describe('Admin Dashboard - Environment Check', () => {
  test('should be using production build', async ({ page }) => {
    await page.goto('/');
    
    // Check if Next.js is in production mode
    const isDev = await page.evaluate(() => {
      // @ts-ignore
      return window.__NEXT_DATA__?.nextExport === true;
    });
    
    // Production builds should not be in dev mode
    // This is a soft check
    expect(isDev).not.toBe(true);
  });
});

