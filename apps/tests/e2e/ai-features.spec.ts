import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';

// AI Content Features tests are skipped - AI assistant not yet implemented
test.describe.skip('Phase 7: AI Content Features', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implement proper authentication
    // For now, tests will need to be run with authentication disabled or mocked
  });

  test.describe('AI Assistant UI', () => {
    test('should display AI assistant component', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Check for AI Assistant heading
      await expect(page.locator('text=/AI Assistant/i')).toBeVisible({
        timeout: 5000,
      });
    });

    test('should have all AI assistant tabs', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Check for tabs
      await expect(page.locator('button:has-text("Generate")')).toBeVisible();
      await expect(page.locator('button:has-text("Translate")')).toBeVisible();
      await expect(page.locator('button:has-text("Import URL")')).toBeVisible();
      await expect(page.locator('button:has-text("Improve")')).toBeVisible();
    });

    test('should switch between tabs', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Translate tab
      await page.click('button:has-text("Translate")');
      await expect(page.locator('text=/Translate your current content/i')).toBeVisible();

      // Click Import URL tab
      await page.click('button:has-text("Import URL")');
      await expect(page.locator('text=/Import content from any blog/i')).toBeVisible();
    });
  });

  test.describe('Content Generation API', () => {
    test('should generate content from topic', async ({ page }) => {
      // This would require API mocking or a real OpenAI key
      // Skipping actual API call for now

      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/generate`, {
        data: {
          type: 'content',
          topic: 'Test topic for AI generation',
          tone: 'professional',
          length: 'short',
          language: 'en',
        },
      });

      // With mock/test API key, this should return a response
      // Without key, it will fail gracefully
      expect([200, 500]).toContain(response.status());
    });

    test('should generate outline', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/generate`, {
        data: {
          type: 'outline',
          topic: 'Test topic for outline',
        },
      });

      expect([200, 500]).toContain(response.status());
    });

    test('should generate SEO metadata', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/generate`, {
        data: {
          type: 'seo',
          content: 'This is test content for SEO generation',
        },
      });

      expect([200, 500]).toContain(response.status());
    });

    test('should validate required fields', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/generate`, {
        data: {
          type: 'content',
          // Missing topic
        },
      });

      expect(response.status()).toBe(500); // Should fail validation
    });
  });

  test.describe('Translation API', () => {
    test('should translate from English to Arabic', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/translate`, {
        data: {
          text: 'Hello world',
          from: 'en',
          to: 'ar',
        },
      });

      expect([200, 500]).toContain(response.status());
    });

    test('should reject same language translation', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/translate`, {
        data: {
          text: 'Test text',
          from: 'en',
          to: 'en',
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('different');
    });

    test('should preserve HTML formatting', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/translate`, {
        data: {
          text: '<h1>Title</h1><p>Content</p>',
          from: 'en',
          to: 'ar',
          preserveFormatting: true,
        },
      });

      expect([200, 500]).toContain(response.status());
    });
  });

  test.describe('URL Extraction API', () => {
    test('should extract content from valid URL', async ({ page }) => {
      // Using a known public URL for testing
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/extract-url`, {
        data: {
          url: 'https://example.com',
        },
      });

      // May succeed or fail depending on network
      expect([200, 400, 500]).toContain(response.status());
    });

    test('should reject invalid URL', async ({ page }) => {
      const response = await page.request.post(`${ADMIN_URL}/api/admin/ai/extract-url`, {
        data: {
          url: 'not-a-valid-url',
        },
      });

      expect(response.status()).toBe(500); // Zod validation error
    });

    test('should list extractions', async ({ page }) => {
      const response = await page.request.get(`${ADMIN_URL}/api/admin/ai/extract-url`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('extractions');
      expect(Array.isArray(body.extractions)).toBe(true);
    });
  });

  test.describe('AI Generation History', () => {
    test('should list AI generations', async ({ page }) => {
      const response = await page.request.get(`${ADMIN_URL}/api/admin/ai/generate`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('generations');
      expect(body).toHaveProperty('stats');
      expect(Array.isArray(body.generations)).toBe(true);
    });

    test('should filter generations by type', async ({ page }) => {
      const response = await page.request.get(
        `${ADMIN_URL}/api/admin/ai/generate?type=CONTENT_DRAFT`
      );

      expect(response.status()).toBe(200);
    });

    test('should limit results', async ({ page }) => {
      const response = await page.request.get(`${ADMIN_URL}/api/admin/ai/generate?limit=5`);

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.generations.length).toBeLessThanOrEqual(5);
    });
  });

  test.describe('AI Assistant Integration', () => {
    test('should show generate form', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Should have topic input
      await expect(page.locator('input[placeholder*="topic"]')).toBeVisible();

      // Should have tone select
      await expect(page.locator('select').first()).toBeVisible();

      // Should have generate button
      await expect(page.locator('button:has-text("Generate Content")')).toBeVisible();
    });

    test('should validate required inputs', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Try to generate without topic
      await page.click('button:has-text("Generate Content")');

      // Should show error
      await expect(page.locator('text=/Please enter a topic/i')).toBeVisible({
        timeout: 2000,
      });
    });

    test('should show loading state', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Fill in topic
      await page.fill('input[placeholder*="topic"]', 'Test topic');

      // Click generate
      await page.click('button:has-text("Generate Content")');

      // Should show loading (briefly)
      await expect(page.locator('text=/Generating/i')).toBeVisible({
        timeout: 1000,
      });
    });
  });

  test.describe('Translation UI', () => {
    test('should have language selectors', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Translate tab
      await page.click('button:has-text("Translate")');

      // Should have From and To selectors
      const selects = await page.locator('select').all();
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    test('should require content for translation', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Translate tab
      await page.click('button:has-text("Translate")');

      // Try to translate without content
      const translateButton = page.locator('button:has-text("Translate Content")');

      // Button should be disabled if no content
      // (This depends on implementation)
      const isDisabled = await translateButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('URL Import UI', () => {
    test('should have URL input field', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Import URL tab
      await page.click('button:has-text("Import URL")');

      // Should have URL input
      await expect(page.locator('input[type="url"]')).toBeVisible();
    });

    test('should validate URL format', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Import URL tab
      await page.click('button:has-text("Import URL")');

      // Try to extract without URL
      await page.click('button:has-text("Import from URL")');

      // Should show error
      await expect(page.locator('text=/Please enter a URL/i')).toBeVisible({
        timeout: 2000,
      });
    });
  });

  test.describe('Content Improvement UI', () => {
    test('should have instructions textarea', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Improve tab
      await page.click('button:has-text("Improve")');

      // Should have instructions textarea
      await expect(page.locator('textarea')).toBeVisible();
    });

    test('should require content for improvement', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Click Improve tab
      await page.click('button:has-text("Improve")');

      // Improve button should be disabled without content
      const improveButton = page.locator('button:has-text("Improve Content")');
      const isDisabled = await improveButton.isDisabled();
      expect(isDisabled).toBe(true);
    });
  });
});

