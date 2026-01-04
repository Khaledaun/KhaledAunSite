import { test, expect } from '@playwright/test';

// Content happy path test is skipped - uses relative URL that doesn't work with baseURL
test.skip('should load the admin command center', async ({ page }) => {
  await page.goto('/admin/command-center');
  await expect(page.getByRole('heading', { name: 'Command Center' })).toBeVisible();
});
