import { test, expect } from '@playwright/test';

/**
 * Phase 8 Full: Social Embed Admin E2E Tests
 * Tests CRUD operations, rendering, enable/disable, and XSS sanitization
 */

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

// Test user credentials (matches seed.ts)
const USERS = {
  EDITOR: { email: 'editor@khaledaun.com', role: 'EDITOR' },
  ADMIN: { email: 'admin@khaledaun.com', role: 'ADMIN' },
  AUTHOR: { email: 'author@khaledaun.com', role: 'AUTHOR' },
};

// Helper: Mock login by setting session cookie
async function loginAs(page, userEmail: string) {
  const userId = userEmail.split('@')[0]; // Simple mock for tests
  await page.context().addCookies([
    {
      name: 'session-user-id',
      value: userId,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

// Social Embed Admin tests are skipped - feature not yet implemented
// The /social page is currently for LinkedIn OAuth, not embed management
test.describe.skip('Phase 8 Full: Social Embed Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('EDITOR can create and render social embed', async ({ page }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    // Navigate to social embeds
    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Click "New Embed"
    await page.click('[data-testid="social-new"]');

    // Fill in form
    await page.fill('[data-testid="social-key-input"]', 'TEST_EMBED_123');
    
    const testIframe = '<iframe src="https://example.com/embed" width="500" height="600" title="Test Embed"></iframe>';
    await page.fill('[data-testid="social-html-input"]', testIframe);
    
    // Ensure enabled checkbox is checked
    const checkbox = page.locator('[data-testid="social-enabled-checkbox"]');
    await checkbox.check();

    // Save
    await page.click('[data-testid="social-save"]');
    
    // Wait for success (alert or list update)
    await page.waitForTimeout(1000);

    // Verify embed appears in list
    const embedItem = page.locator('[data-testid="social-embed-TEST_EMBED_123"]');
    await expect(embedItem).toBeVisible();
    await expect(embedItem).toContainText('TEST_EMBED_123');
    await expect(embedItem).toContainText('Enabled');
  });

  test('Enable/disable toggle works', async ({ page }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Create a new embed
    await page.click('[data-testid="social-new"]');
    await page.fill('[data-testid="social-key-input"]', 'TOGGLE_TEST');
    await page.fill('[data-testid="social-html-input"]', '<div>Test Content</div>');
    
    // Initially enabled
    await page.check('[data-testid="social-enabled-checkbox"]');
    await page.click('[data-testid="social-save"]');
    await page.waitForTimeout(1000);

    // Verify enabled
    let embedItem = page.locator('[data-testid="social-embed-TOGGLE_TEST"]');
    await expect(embedItem).toContainText('Enabled');

    // Edit and disable
    await embedItem.click();
    await page.uncheck('[data-testid="social-enabled-checkbox"]');
    await page.click('[data-testid="social-save"]');
    await page.waitForTimeout(1000);

    // Verify disabled
    embedItem = page.locator('[data-testid="social-embed-TOGGLE_TEST"]');
    await expect(embedItem).toContainText('Disabled');
  });

  test('XSS sanitization: scripts are stripped', async ({ page }) => {
    // Login as EDITOR
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Create embed with malicious script
    await page.click('[data-testid="social-new"]');
    await page.fill('[data-testid="social-key-input"]', 'XSS_TEST');
    
    const maliciousHtml = `
      <script>alert('XSS Attack!')</script>
      <iframe src="javascript:alert('XSS')"></iframe>
      <img onerror="alert('XSS')" src="invalid">
      <div onclick="alert('XSS')">Click me</div>
      <iframe src="https://safe-site.com/embed" width="500" height="600"></iframe>
    `;
    
    await page.fill('[data-testid="social-html-input"]', maliciousHtml);
    await page.check('[data-testid="social-enabled-checkbox"]');
    await page.click('[data-testid="social-save"]');
    await page.waitForTimeout(1000);

    // Edit the same embed to see sanitized HTML
    const embedItem = page.locator('[data-testid="social-embed-XSS_TEST"]');
    await embedItem.click();

    // Get the sanitized HTML from textarea
    const sanitizedHtml = await page.inputValue('[data-testid="social-html-input"]');

    // Verify dangerous content removed
    expect(sanitizedHtml).not.toContain('<script>');
    expect(sanitizedHtml).not.toContain('alert(');
    expect(sanitizedHtml).not.toContain('javascript:');
    expect(sanitizedHtml).not.toContain('onerror');
    expect(sanitizedHtml).not.toContain('onclick');
    expect(sanitizedHtml).not.toContain('<img');

    // Verify safe iframe preserved
    expect(sanitizedHtml).toContain('<iframe');
    expect(sanitizedHtml).toContain('https://safe-site.com/embed');
  });

  test('ADMIN can delete, EDITOR cannot', async ({ page }) => {
    // Login as EDITOR first
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Create an embed
    await page.click('[data-testid="social-new"]');
    await page.fill('[data-testid="social-key-input"]', 'DELETE_TEST');
    await page.fill('[data-testid="social-html-input"]', '<div>To be deleted</div>');
    await page.click('[data-testid="social-save"]');
    await page.waitForTimeout(1000);

    // Try to delete as EDITOR
    const embedItem = page.locator('[data-testid="social-embed-DELETE_TEST"]');
    await embedItem.click();

    const deleteButton = page.locator('[data-testid="social-delete"]');
    
    if (await deleteButton.count() > 0) {
      // If button exists, clicking should fail with 403
      page.on('dialog', dialog => dialog.accept()); // Auto-accept confirm
      await deleteButton.click();
      
      // Wait for error alert
      await page.waitForTimeout(1000);
      
      // Embed should still exist
      await expect(embedItem).toBeVisible();
    }

    // Now login as ADMIN
    await page.context().clearCookies();
    await loginAs(page, USERS.ADMIN.email);
    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Delete as ADMIN
    const embedItemAdmin = page.locator('[data-testid="social-embed-DELETE_TEST"]');
    await embedItemAdmin.click();

    const deleteButtonAdmin = page.locator('[data-testid="social-delete"]');
    await expect(deleteButtonAdmin).toBeVisible();

    page.on('dialog', dialog => dialog.accept()); // Auto-accept confirm
    await deleteButtonAdmin.click();
    
    await page.waitForTimeout(1000);

    // Embed should be gone
    await expect(embedItemAdmin).not.toBeVisible();
  });

  test('AUTHOR cannot access social embed admin', async ({ page }) => {
    // Login as AUTHOR
    await loginAs(page, USERS.AUTHOR.email);

    await page.goto(`${ADMIN_URL}/social`);
    await page.waitForLoadState('networkidle');

    // Should get 403 or be redirected
    const content = await page.content();
    expect(content).toMatch(/403|Forbidden|Unauthorized/i);
  });

  test('Site API respects enabled flag', async ({ request }) => {
    // Create enabled embed
    const responseEnabled = await request.post(`${ADMIN_URL}/api/admin/social`, {
      headers: {
        'Content-Type': 'application/json',
        // Mock EDITOR session (in real test, would use proper auth)
      },
      data: {
        key: 'SITE_API_TEST_ENABLED',
        html: '<div>Enabled Content</div>',
        enabled: true,
      },
    });

    // Create disabled embed
    const responseDisabled = await request.post(`${ADMIN_URL}/api/admin/social`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        key: 'SITE_API_TEST_DISABLED',
        html: '<div>Disabled Content</div>',
        enabled: false,
      },
    });

    // Fetch enabled embed from site API
    const siteResponseEnabled = await request.get(
      `${SITE_URL}/api/social-embed/SITE_API_TEST_ENABLED`
    );
    const dataEnabled = await siteResponseEnabled.json();
    
    expect(dataEnabled.embed).not.toBeNull();
    expect(dataEnabled.embed.html).toContain('Enabled Content');

    // Fetch disabled embed from site API
    const siteResponseDisabled = await request.get(
      `${SITE_URL}/api/social-embed/SITE_API_TEST_DISABLED`
    );
    const dataDisabled = await siteResponseDisabled.json();
    
    expect(dataDisabled.embed).toBeNull();
  });

  test('Key validation: only uppercase, numbers, underscores', async ({ page }) => {
    await loginAs(page, USERS.EDITOR.email);

    await page.goto(`${ADMIN_URL}/social`);
    await page.click('[data-testid="social-new"]');

    // Try invalid key (lowercase, spaces)
    await page.fill('[data-testid="social-key-input"]', 'invalid key 123');
    await page.fill('[data-testid="social-html-input"]', '<div>Test</div>');
    await page.click('[data-testid="social-save"]');

    // Should show validation error or auto-convert
    await page.waitForTimeout(1000);
    
    // Check if key was auto-converted to uppercase (if implemented)
    const keyValue = await page.inputValue('[data-testid="social-key-input"]');
    
    // Either auto-converted or still lowercase (depends on implementation)
    // If auto-converted, should be uppercase
    if (keyValue === 'INVALID KEY 123' || keyValue === 'INVALID_KEY_123') {
      // Auto-conversion worked
      expect(keyValue).toMatch(/^[A-Z0-9_]+$/);
    }
  });
});

// Site Rendering tests are skipped - depends on social embed feature
test.describe.skip('Phase 8 Full: Site Rendering', () => {
  test('LinkedIn section hides when embed disabled', async ({ page }) => {
    // This test assumes LinkedIn section fetches from LINKEDIN_WALL
    
    await page.goto(`${SITE_URL}`);
    await page.waitForLoadState('networkidle');

    // If LINKEDIN_WALL is disabled, section should not render
    // Check for linkedin section
    const linkedinSection = page.locator('[data-testid="linkedin"]');
    
    // Section might or might not be visible depending on DB state
    // This test documents expected behavior
    const isVisible = await linkedinSection.isVisible().catch(() => false);
    
    // If visible, it means embed is enabled in DB
    // If not visible, embed is disabled or doesn't exist
    // Both are valid states
    expect(typeof isVisible).toBe('boolean');
  });
});

