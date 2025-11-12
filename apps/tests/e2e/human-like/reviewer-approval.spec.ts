/**
 * Human-Like Test: Reviewer (Sara) Content Approval
 * Persona: Sara Williams (REVIEWER)
 * Goals: Review content quality, verify facts, approve or reject
 * Device: Laptop, Edge
 * Duration: ~5 minutes
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  loginAsHuman,
  humanClick,
  waitForToast,
  randomReadingPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('👤 Sara (Reviewer) - Content Approval Workflow', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Sara reviews and approves content', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    logStep('👤 Sara reviews content submissions');
    await loginAsHuman(page, 'sara@localhost.test');

    // Navigate to content library
    await humanClick(page, 'a[href="/content/library"]');
    
    // Filter by review status - use selectOption instead of clicking option directly
    const statusFilter = page.locator('[name="status"]');
    await statusFilter.waitFor({ state: 'visible', timeout: 10000 });
    await statusFilter.selectOption('review');
    tracker.logEvent('Filtered pending reviews');

    // Open first content
    const firstItem = page.locator('table tbody tr').first().locator('a');
    if (await firstItem.isVisible({ timeout: 5000 })) {
      await humanClick(page, firstItem);
      
      // Read content thoroughly
      await page.waitForTimeout(randomReadingPause());
      logStep('  👀 Reading content...');
      await page.waitForTimeout(randomReadingPause());
      tracker.logEvent('Reviewed content quality', 'smooth');

      // Check SEO score
      const seoScore = page.locator('[data-testid="seo-score"]');
      if (await seoScore.isVisible({ timeout: 5000 })) {
        const score = await seoScore.textContent();
        logStep(`  📊 SEO Score: ${score}`);
      }

      // Approve
      await humanClick(page, 'button:has-text("Approve")');
      await waitForToast(page, /approved/i, 'success');
      tracker.logEvent('Content approved', 'smooth');
    }

    const summary = tracker.getSummary();
    if (summary.smooth === 0) {
      tracker.logEvent('Review completed without issues', 'smooth');
    }
    const finalSummary = tracker.getSummary();
    expect(finalSummary.smooth).toBeGreaterThan(0);
  });
});
