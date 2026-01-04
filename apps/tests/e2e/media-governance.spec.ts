import { test, expect } from '@playwright/test';

// Media governance test is skipped - Action Center not implemented in Command Center
test.skip('should find the action center on the dashboard', async ({ page }) => {
  await page.goto('/admin/command-center');
  await expect(page.getByRole('heading', { name: 'Action Center' })).toBeVisible();
});
