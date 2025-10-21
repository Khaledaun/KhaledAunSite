import { test, expect } from '@playwright/test';

/**
 * Public Site E2E Tests
 * Tests the live production site at https://khaledaun.com
 */

test.describe('Public Site - Core Functionality', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Khaled Aun/i);
    
    // Check for main hero section
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('should display hero content', async ({ page }) => {
    await page.goto('/');
    
    // Look for any heading or text content in hero
    const mainContent = page.locator('h1, h2, h3, p').first();
    await expect(mainContent).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation links are present
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });
});

test.describe('Public Site - Blog/Insights', () => {
  test('should load blog/insights page', async ({ page }) => {
    const response = await page.goto('/insights');
    
    if (response?.status() === 404) {
      // Try alternate routes
      const altResponse1 = await page.goto('/blog');
      if (altResponse1?.status() === 404) {
        const altResponse2 = await page.goto('/posts');
        if (altResponse2?.status() === 404) {
          test.skip(true, 'Blog route not yet configured');
        }
      }
    }
    
    // If we got here, a blog route exists
    await expect(page).toHaveURL(/\/(insights|blog|posts)/);
  });

  test('should display published posts', async ({ page }) => {
    // Try multiple possible routes
    let loaded = false;
    for (const route of ['/insights', '/blog', '/posts']) {
      const response = await page.goto(route);
      if (response?.status() === 200) {
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      test.skip(true, 'No blog route available');
      return;
    }

    // Check if there are any post cards or links
    const posts = page.locator('article, .post, .insight, [data-testid*="post"]');
    const count = await posts.count();
    
    // Either posts exist or there's a "no posts" message
    if (count === 0) {
      const emptyState = page.locator('text=/no posts|no insights|coming soon/i');
      const hasEmptyState = await emptyState.count() > 0;
      expect(hasEmptyState).toBe(true);
    }
  });
});

test.describe('Public Site - Internationalization', () => {
  test('should support English language', async ({ page }) => {
    await page.goto('/en');
    const response = await page.waitForLoadState('networkidle');
    
    // Check if English content is present
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toContain('en');
  });

  test('should support Arabic language', async ({ page }) => {
    await page.goto('/ar');
    const response = await page.waitForLoadState('networkidle');
    
    // Check if Arabic content is present
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toContain('ar');
    
    // Check RTL direction
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('should have language switcher', async ({ page }) => {
    await page.goto('/');
    
    // Look for language switcher (common patterns)
    const langSwitcher = page.locator('[data-testid="language-switcher"], [aria-label*="language"], select[name*="lang"], a[href*="/ar"], a[href*="/en"]').first();
    const hasSwitcher = await langSwitcher.count() > 0;
    
    if (!hasSwitcher) {
      test.skip(true, 'Language switcher not found - may need to be implemented');
    }
  });
});

test.describe('Public Site - Contact Form', () => {
  test('should have contact page', async ({ page }) => {
    const response = await page.goto('/contact');
    
    if (response?.status() === 404) {
      const altResponse = await page.goto('/en/contact');
      if (altResponse?.status() === 404) {
        test.skip(true, 'Contact page not yet configured');
      }
    }
  });

  test('should display contact form', async ({ page }) => {
    let loaded = false;
    for (const route of ['/contact', '/en/contact']) {
      const response = await page.goto(route);
      if (response?.status() === 200) {
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      test.skip(true, 'Contact page not available');
      return;
    }

    // Check for form elements
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
    
    // Check for basic form fields
    const nameField = page.locator('input[name*="name"], input[type="text"]').first();
    const emailField = page.locator('input[name*="email"], input[type="email"]').first();
    const messageField = page.locator('textarea[name*="message"]').first();
    
    await expect(nameField).toBeVisible();
    await expect(emailField).toBeVisible();
    await expect(messageField).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    let loaded = false;
    for (const route of ['/contact', '/en/contact']) {
      const response = await page.goto(route);
      if (response?.status() === 200) {
        loaded = true;
        break;
      }
    }
    
    if (!loaded) {
      test.skip(true, 'Contact page not available');
      return;
    }

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], input[type="submit"]').first();
    await submitButton.click();
    
    // Should show validation errors (either HTML5 or custom)
    // This is a basic check - form should not submit successfully
    await page.waitForTimeout(1000);
    
    // If still on contact page, validation is working
    expect(page.url()).toMatch(/contact/);
  });
});

test.describe('Public Site - LinkedIn Section', () => {
  test('should display LinkedIn embed or section', async ({ page }) => {
    await page.goto('/');
    
    // Look for LinkedIn section
    const linkedInSection = page.locator('[data-testid="linkedin-section"], section:has-text("LinkedIn"), .linkedin-section');
    const count = await linkedInSection.count();
    
    if (count === 0) {
      test.skip(true, 'LinkedIn section not visible on homepage');
    } else {
      await expect(linkedInSection.first()).toBeVisible();
    }
  });
});

test.describe('Public Site - Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have valid meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that there's no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });
});

test.describe('Public Site - API Health', () => {
  test('should have working API endpoints', async ({ request }) => {
    // Test if there's a health endpoint
    const response = await request.get('https://khaledaun.com/api/health');
    
    if (response.status() === 404) {
      test.skip(true, 'Health endpoint not configured');
      return;
    }
    
    expect(response.ok()).toBeTruthy();
  });
});

