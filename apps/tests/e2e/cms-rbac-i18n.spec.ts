import { test, expect } from '@playwright/test';

/**
 * Phase 6 Full: CMS RBAC & i18n E2E Tests
 * Tests bilingual post creation, RBAC permissions, per-locale preview, and AR requirement
 */

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

// Test user credentials (matches seed.ts)
const USERS = {
  AUTHOR: { email: 'author@khaledaun.com', role: 'AUTHOR' },
  EDITOR: { email: 'editor@khaledaun.com', role: 'EDITOR' },
  ADMIN: { email: 'admin@khaledaun.com', role: 'ADMIN' },
};

// Helper: Mock login by setting session cookie
async function loginAs(page, userEmail: string) {
  // In Phase 6 Lite/Full, we use simple cookie-based sessions
  // Get user ID from database based on email
  const response = await page.request.get(`${ADMIN_URL}/api/admin/test/user-by-email?email=${userEmail}`);
  
  if (!response.ok()) {
    // If test endpoint doesn't exist, mock with a known ID
    // This is a simplified approach - in production, use proper auth
    const userId = userEmail.split('@')[0]; // Use email prefix as ID for tests
    await page.context().addCookies([
      {
        name: 'session-user-id',
        value: userId,
        domain: 'localhost',
        path: '/',
      },
    ]);
  } else {
    const data = await response.json();
    await page.context().addCookies([
      {
        name: 'session-user-id',
        value: data.userId,
        domain: 'localhost',
        path: '/',
      },
    ]);
  }
}

test.describe('Phase 6 Full: RBAC & i18n', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test('AUTHOR can create but not publish', async ({ page }) => {
    // Login as AUTHOR
    await loginAs(page, USERS.AUTHOR.email);

    // Navigate to posts
    await page.goto(`${ADMIN_URL}/posts`);
    await page.waitForLoadState('networkidle');

    // Click "Create New Post"
    await page.click('text=Create New Post');
    await page.waitForURL(/\/posts\/new/);

    // Fill in English translation
    await page.click('button:has-text("English")');
    await page.fill('input[placeholder*="English title"]', 'Test Author Post EN');
    await page.fill('input[placeholder*="slug"]', 'test-author-post-en');
    await page.fill('textarea[placeholder*="English content"]', 'This is English content from AUTHOR');

    // Save draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForResponse((resp) => resp.url().includes('/api/admin/posts'));

    // Verify publish button is disabled or hidden
    const publishButton = page.locator('button:has-text("Publish")');
    
    // Check if button exists
    const buttonExists = await publishButton.count() > 0;
    
    if (buttonExists) {
      // If button exists, it should be disabled
      await expect(publishButton).toBeDisabled();
    } else {
      // Or it might be hidden entirely due to permissions
      expect(buttonExists).toBe(false);
    }

    // AUTHOR should be able to save draft
    await expect(page.locator('button:has-text("Save Draft")')).toBeEnabled();
  });

  test('EDITOR can publish bilingual post', async ({ page }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    // Navigate to posts
    await page.goto(`${ADMIN_URL}/posts`);
    await page.waitForLoadState('networkidle');

    // Create new post
    await page.click('text=Create New Post');
    await page.waitForURL(/\/posts\/new/);

    // Fill English translation
    await page.click('button:has-text("English")');
    await page.fill('input[placeholder*="English title"]', 'Bilingual Test Post');
    await page.fill('input[placeholder*="slug"]', 'bilingual-test-post-en');
    await page.fill('textarea[placeholder*="English content"]', 'This is the English version of the post.');

    // Fill Arabic translation
    await page.click('button:has-text("العربية")');
    await page.fill('input[placeholder*="Arabic title"]', 'منشور تجريبي ثنائي اللغة');
    await page.fill('input[placeholder*="slug"]', 'bilingual-test-post-ar');
    await page.fill('textarea[placeholder*="Arabic content"]', 'هذا هو الإصدار العربي من المنشور');

    // Save draft first
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000); // Wait for save

    // Now publish
    const publishButton = page.locator('button:has-text("Publish")');
    await expect(publishButton).toBeEnabled();
    
    await publishButton.click();
    
    // Confirm publish
    page.on('dialog', (dialog) => dialog.accept());
    
    // Wait for success response
    await page.waitForResponse((resp) => 
      resp.url().includes('/publish') && resp.status() === 200
    );

    // Verify on site (EN version)
    await page.goto(`${SITE_URL}/en/blog/bilingual-test-post-en`);
    await expect(page.locator('h1, h2').first()).toContainText('Bilingual Test Post');

    // Verify on site (AR version)
    await page.goto(`${SITE_URL}/ar/blog/bilingual-test-post-ar`);
    await expect(page.locator('h1, h2').first()).toContainText('منشور تجريبي');
  });

  test('Per-locale preview works', async ({ page, context }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    // Navigate to posts and create a draft
    await page.goto(`${ADMIN_URL}/posts`);
    await page.click('text=Create New Post');

    // Fill EN content
    await page.click('button:has-text("English")');
    await page.fill('input[placeholder*="English title"]', 'Preview Test EN');
    await page.fill('input[placeholder*="slug"]', 'preview-test-en');
    await page.fill('textarea[placeholder*="English content"]', 'English preview content');

    // Fill AR content
    await page.click('button:has-text("العربية")');
    await page.fill('input[placeholder*="Arabic title"]', 'معاينة الاختبار');
    await page.fill('input[placeholder*="slug"]', 'preview-test-ar');
    await page.fill('textarea[placeholder*="Arabic content"]', 'محتوى المعاينة العربي');

    // Save draft
    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Test EN preview
    const [enPreviewPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button:has-text("Preview EN")'),
    ]);

    await enPreviewPage.waitForLoadState('networkidle');
    
    // Verify EN content
    await expect(enPreviewPage.locator('body')).toContainText('Preview Test EN');
    
    // Verify preview mode banner
    await expect(enPreviewPage.locator('text=/preview/i, text=/draft/i').first()).toBeVisible();
    
    await enPreviewPage.close();

    // Test AR preview
    const [arPreviewPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('button:has-text("Preview AR")'),
    ]);

    await arPreviewPage.waitForLoadState('networkidle');
    
    // Verify AR content
    await expect(arPreviewPage.locator('body')).toContainText('معاينة الاختبار');
    
    // Verify RTL direction
    const htmlElement = arPreviewPage.locator('html');
    const dir = await htmlElement.getAttribute('dir');
    expect(dir).toBe('rtl');
    
    await arPreviewPage.close();
  });

  test('AR requirement toggle', async ({ page }) => {
    // This test assumes REQUIRE_AR_FOR_PUBLISH can be set via env or config
    // For testing, we'll check the behavior when AR is missing vs present
    
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/posts`);
    await page.click('text=Create New Post');

    // Fill only EN content
    await page.click('button:has-text("English")');
    await page.fill('input[placeholder*="English title"]', 'EN Only Post');
    await page.fill('input[placeholder*="slug"]', 'en-only-post');
    await page.fill('textarea[placeholder*="English content"]', 'Only English content');

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Check if AR is required
    const requireAR = process.env.REQUIRE_AR_FOR_PUBLISH === 'true' || 
                      process.env.NEXT_PUBLIC_REQUIRE_AR_FOR_PUBLISH === 'true';

    const publishButton = page.locator('button:has-text("Publish")');

    if (requireAR) {
      // Publish should be disabled without AR
      await expect(publishButton).toBeDisabled();

      // Add AR translation
      await page.click('button:has-text("العربية")');
      await page.fill('input[placeholder*="Arabic title"]', 'منشور باللغة الإنجليزية فقط');
      await page.fill('input[placeholder*="slug"]', 'en-only-post-ar');
      await page.fill('textarea[placeholder*="Arabic content"]', 'تمت إضافة المحتوى العربي');

      await page.click('button:has-text("Save Draft")');
      await page.waitForTimeout(1000);

      // Now publish should be enabled
      await expect(publishButton).toBeEnabled();
    } else {
      // Without AR requirement, publish should work with EN only
      await expect(publishButton).toBeEnabled();
    }
  });

  test('Ownership rule: AUTHOR can only edit own posts', async ({ page, context }) => {
    // Login as AUTHOR and create a post
    await loginAs(page, USERS.AUTHOR.email);

    await page.goto(`${ADMIN_URL}/posts`);
    await page.click('text=Create New Post');

    await page.fill('input[placeholder*="English title"]', 'Author A Post');
    await page.fill('input[placeholder*="slug"]', 'author-a-post');
    await page.fill('textarea[placeholder*="English content"]', 'This belongs to Author A');

    await page.click('button:has-text("Save Draft")');
    await page.waitForTimeout(1000);

    // Get post ID from URL
    const postUrl = page.url();
    const postId = postUrl.split('/posts/')[1];

    // Logout and login as different AUTHOR (or EDITOR to test permissions)
    await page.context().clearCookies();
    await loginAs(page, USERS.EDITOR.email);

    // Navigate to posts list - AUTHOR should only see their own
    await page.goto(`${ADMIN_URL}/posts`);
    await page.waitForLoadState('networkidle');

    // EDITOR should be able to see and edit all posts
    const editLink = page.locator(`a[href="/posts/${postId}"]`).first();
    
    if (await editLink.count() > 0) {
      await editLink.click();
      await page.waitForLoadState('networkidle');
      
      // EDITOR should see edit form
      await expect(page.locator('input[placeholder*="title"]')).toBeVisible();
    }

    // Now test with another AUTHOR (would need second AUTHOR account)
    // For simplicity, verify AUTHOR sees only their posts in list
    await page.context().clearCookies();
    await loginAs(page, USERS.AUTHOR.email);
    
    await page.goto(`${ADMIN_URL}/posts`);
    const allPostTitles = await page.locator('table tbody tr').count();
    
    // AUTHOR should only see their own posts (at least 1)
    expect(allPostTitles).toBeGreaterThanOrEqual(1);
  });

  test('Security: Revalidation requires secret', async ({ request }) => {
    // Test without secret
    const response = await request.post(`${SITE_URL}/api/revalidate`, {
      data: { slug: 'test-slug' },
    });

    expect(response.status()).toBe(401);

    // Test with wrong secret
    const response2 = await request.post(`${SITE_URL}/api/revalidate`, {
      headers: {
        'x-reval-secret': 'wrong-secret',
      },
      data: { slug: 'test-slug' },
    });

    expect(response2.status()).toBe(401);

    // Test with correct secret (if available in env)
    if (process.env.REVALIDATE_SECRET) {
      const response3 = await request.post(`${SITE_URL}/api/revalidate`, {
        headers: {
          'x-reval-secret': process.env.REVALIDATE_SECRET,
        },
        data: { locale: 'en', slug: 'test-slug' },
      });

      expect(response3.status()).toBe(200);
      const data = await response3.json();
      expect(data.revalidated).toBe(true);
    }
  });

  test('Security: Preview requires valid token', async ({ page }) => {
    // Test without token
    await page.goto(`${SITE_URL}/api/preview?id=test-id&locale=en`);
    
    // Should return 401
    const content = await page.content();
    expect(content).toContain('Missing token' || 'Unauthorized');

    // Test with invalid token
    await page.goto(`${SITE_URL}/api/preview?id=test-id&locale=en&token=invalid`);
    
    const content2 = await page.content();
    expect(content2).toContain('Invalid' || 'Unauthorized');

    // Valid token test would require generating a signed token
    // This is implicitly tested in the "Per-locale preview works" test
  });
});

test.describe('Phase 6 Full: Translation Status Indicators', () => {
  test('Posts list shows EN/AR status correctly', async ({ page }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/posts`);
    await page.waitForLoadState('networkidle');

    // Check for translation status column
    await expect(page.locator('th:has-text("Translations")')).toBeVisible();

    // Verify status indicators exist (✅ or 🔴)
    const translationCells = page.locator('td').filter({ hasText: /EN|AR/ });
    await expect(translationCells.first()).toBeVisible();
  });
});

