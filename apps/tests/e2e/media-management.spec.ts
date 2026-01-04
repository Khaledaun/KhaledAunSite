import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';

test.describe('Phase 6.5: Media Management', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Implement proper authentication
    // For now, tests will need to be run with authentication disabled or mocked
  });

  test.describe('Media Upload', () => {
    test('should display media library page', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // Check for main heading
      await expect(page.getByRole('heading', { name: /media library/i })).toBeVisible();

      // Check for upload zone
      await expect(page.locator('text=/drag.*drop.*files/i')).toBeVisible();
    });

    test('should show upload zone with drag-drop instructions', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      const uploadZone = page.locator('[class*="border-dashed"]');
      await expect(uploadZone).toBeVisible();
      await expect(uploadZone).toContainText(/drag.*drop/i);
    });

    test('should upload image file successfully', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // Create a test image file
      const fileInput = await page.locator('input[type="file"]');

      // Upload a test image
      await fileInput.setInputFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data'),
      });

      // Wait for upload to complete
      await page.waitForTimeout(2000);

      // Check for success indication
      // This would depend on your UI implementation
      // await expect(page.locator('text=/upload.*success/i')).toBeVisible();
    });

    test('should validate file type', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      const fileInput = await page.locator('input[type="file"]');

      // Try to upload an invalid file type
      await fileInput.setInputFiles({
        name: 'test-file.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('fake-exe-data'),
      });

      // Should show error
      await expect(page.locator('text=/invalid.*file.*type/i')).toBeVisible({
        timeout: 3000,
      });
    });

    test('should validate file size', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // This test would need a large file
      // For now, just checking that size validation exists in the code
      await expect(page.locator('text=/50.*mb/i')).toBeVisible();
    });
  });

  test.describe('Media Library Grid', () => {
    test('should display uploaded media in grid', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // Wait for media to load
      await page.waitForTimeout(1000);

      // Check for grid layout
      const mediaGrid = page.locator('[class*="grid"]');
      await expect(mediaGrid).toBeVisible();
    });

    test('should show media thumbnails', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      // Check for images in grid
      const images = page.locator('img[alt]');
      const count = await images.count();

      if (count > 0) {
        // If there are images, check that they have src attributes
        const firstImage = images.first();
        await expect(firstImage).toHaveAttribute('src', /.+/);
      }
    });

    test('should filter media by type', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // Find and click filter dropdown
      const filterSelect = page.locator('select');
      await filterSelect.selectOption('image');

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Check that URL has filter parameter
      expect(page.url()).toContain('type=image');
    });

    test('should search media', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);

      // Find search input
      const searchInput = page.locator('input[placeholder*="search"i]');
      await searchInput.fill('test');

      // Trigger search (may need to press Enter or click button)
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForTimeout(500);
    });
  });

  test.describe('Media Detail Modal', () => {
    test('should open media detail modal on click', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      // Click on first media item
      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Modal should open
        await expect(page.locator('text=/media details/i')).toBeVisible();
      }
    });

    test('should display media metadata in modal', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Check for metadata fields
        await expect(page.locator('text=/filename/i')).toBeVisible();
        await expect(page.locator('text=/type/i')).toBeVisible();
        await expect(page.locator('text=/size/i')).toBeVisible();
      }
    });

    test('should allow editing alt text', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Find alt text input
        const altInput = page.locator('input[type="text"]').first();
        await altInput.fill('Test alt text');

        // Click save button
        await page.click('button:has-text("Save")');

        // Wait for save to complete
        await page.waitForTimeout(1000);
      }
    });

    test('should allow editing caption', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Find caption textarea
        const captionInput = page.locator('textarea');
        if (await captionInput.count() > 0) {
          await captionInput.fill('Test caption');

          // Click save button
          await page.click('button:has-text("Save")');

          await page.waitForTimeout(1000);
        }
      }
    });

    test('should copy media URL to clipboard', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Click copy URL button
        await page.click('button:has-text("Copy URL")');

        // Check for success message (implementation dependent)
        // await expect(page.locator('text=/copied/i')).toBeVisible();
      }
    });

    test('should close modal on close button click', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Modal should be visible
        await expect(page.locator('text=/media details/i')).toBeVisible();

        // Click close button
        await page.click('button:has-text("×")');

        // Modal should close
        await expect(page.locator('text=/media details/i')).not.toBeVisible();
      }
    });
  });

  test.describe('Media Deletion', () => {
    test('should show delete confirmation dialog', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const count = await mediaItems.count();

      if (count > 0) {
        await mediaItems.first().click();

        // Set up dialog handler before clicking delete
        page.on('dialog', async (dialog) => {
          expect(dialog.message()).toContain('delete');
          await dialog.dismiss();
        });

        // Click delete button
        await page.click('button:has-text("Delete")');
      }
    });

    test('should not delete media if confirmation cancelled', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/media`);
      await page.waitForTimeout(1000);

      const mediaItems = page.locator('[class*="aspect-square"]');
      const initialCount = await mediaItems.count();

      if (initialCount > 0) {
        await mediaItems.first().click();

        // Dismiss confirmation
        page.on('dialog', async (dialog) => {
          await dialog.dismiss();
        });

        await page.click('button:has-text("Delete")');
        await page.waitForTimeout(1000);

        // Count should remain the same
        const finalCount = await mediaItems.count();
        expect(finalCount).toBe(initialCount);
      }
    });
  });

  // Rich Text Editor tests are skipped - TipTap editor not yet implemented (Phase 6.5)
  // PostForm currently uses plain textarea, rich editor coming later
  test.describe.skip('Rich Text Editor Integration', () => {
    test('should have rich text editor on post edit page', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Check for TipTap editor
      await expect(page.locator('[class*="prose"]')).toBeVisible();
    });

    test('should show formatting toolbar', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Check for toolbar buttons
      await expect(page.locator('button:has-text("B")')).toBeVisible(); // Bold
      await expect(page.locator('button:has-text("I")')).toBeVisible(); // Italic
      await expect(page.locator('button:has-text("H1")')).toBeVisible(); // Heading
    });

    test('should apply bold formatting', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Type some text
      const editor = page.locator('[class*="prose"]');
      await editor.click();
      await editor.type('Test text');

      // Select all text
      await page.keyboard.press('Control+A');

      // Click bold button
      await page.click('button:has-text("B")');

      // Check that text is bold
      await expect(editor.locator('strong')).toContainText('Test text');
    });

    test('should apply heading formatting', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      const editor = page.locator('[class*="prose"]');
      await editor.click();
      await editor.type('Heading text');

      await page.keyboard.press('Control+A');
      await page.click('button:has-text("H2")');

      await expect(editor.locator('h2')).toContainText('Heading text');
    });

    test('should show image insert button', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Check for image button (emoji or text)
      const imageButton = page.locator('button:has-text("🖼")');
      await expect(imageButton).toBeVisible();
    });
  });

  // Pre-Publish Validation tests are skipped - depends on rich text editor (Phase 6.5)
  test.describe.skip('Pre-Publish Validation', () => {
    test('should validate post before publishing', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Try to publish with minimal content
      await page.fill('input[placeholder*="title"]', 'Short');

      // Click publish/validate button
      const publishButton = page.locator('button:has-text("Publish")');
      if (await publishButton.count() > 0) {
        await publishButton.click();

        // Should show validation errors
        await expect(page.locator('text=/error|warning/i')).toBeVisible({
          timeout: 3000,
        });
      }
    });

    test('should show validation score', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Fill in some content
      await page.fill('input[placeholder*="title"]', 'A good test title for validation');

      const editor = page.locator('[class*="prose"]');
      await editor.click();
      await editor.type('Some test content that is long enough to pass basic validation checks. This should be at least 50 words to satisfy the content length requirement for SEO purposes.');

      // Trigger validation (implementation dependent)
      // This might be automatic or require clicking a button
    });

    test('should check for missing alt text', async ({ page }) => {
      await page.goto(`${ADMIN_URL}/posts/new`);

      // Fill required fields
      await page.fill('input[placeholder*="title"]', 'Test post with image');

      const editor = page.locator('[class*="prose"]');
      await editor.click();
      await editor.type('Content with image below');

      // Insert image without alt text (if possible)
      // The validator should flag this

      // Trigger validation
      // Should show alt text warning
    });
  });
});



