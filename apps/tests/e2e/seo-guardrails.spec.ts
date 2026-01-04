import { test, expect } from '@playwright/test';

const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3000';

test('should load the SEO checks page', async ({ page }) => {
  await page.goto(`${ADMIN_URL}/seo-checks`);
  await expect(page.getByRole('heading', { name: 'SEO Checks' })).toBeVisible();
});
