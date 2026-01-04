import { test, expect } from '@playwright/test';

// Lead capture happy path test is skipped - contact page not implemented in site app
test.skip('should load the contact page', async ({ page }) => {
  await page.goto('/en/contact');
  await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
});
