/**
 * Human-Like Test: Editor (Layla) Email Campaign Lifecycle
 * 
 * Persona: Layla Hassan (EDITOR)
 * Goals: Review content, create email campaigns, analyze performance
 * Device: Desktop, Safari
 * Duration: ~8 minutes
 * Complexity: Medium
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  loginAsHuman,
  humanType,
  humanClick,
  humanScrollTo,
  waitForToast,
  randomReadingPause,
  randomShortPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('👤 Layla (Editor) - Email Campaign Workflow', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Layla reviews content and creates email campaign', async ({ page }) => {
    test.setTimeout(480000); // 8 minutes
    
    logStep('👤 Layla starts her day');

    // ========== LOGIN ==========
    await loginAsHuman(page, 'layla@localhost.test');
    tracker.logEvent('Login successful', 'smooth');

    // ========== REVIEW CONTENT ==========
    logStep('📝 Step 1: Review pending content');
    await humanClick(page, 'a[href="/content/library"]');
    
    // Filter by review status
    await humanClick(page, '[name="status"]');
    await humanClick(page, 'option[value="review"]');
    await page.waitForTimeout(randomShortPause());
    
    tracker.logEvent('Filtered content in review');

    // Click first content item
    const firstContent = page.locator('table tbody tr').first().locator('a');
    if (await firstContent.isVisible({ timeout: 5000 })) {
      await humanClick(page, firstContent);
      await page.waitForTimeout(randomReadingPause());
      
      logStep('  👀 Reading content...');
      tracker.logEvent('Reviewing content', 'smooth');

      // Approve content
      await humanScrollTo(page, 'button:has-text("Approve")');
      await humanClick(page, 'button:has-text("Approve")');
      
      await waitForToast(page, /approved/i, 'success');
      tracker.logEvent('Content approved', 'smooth');
    }

    // ========== CREATE EMAIL CAMPAIGN ==========
    logStep('📧 Step 2: Create email campaign');
    await humanClick(page, 'a[href="/marketing/campaigns"]');
    await page.waitForTimeout(randomShortPause());
    
    await humanClick(page, 'button:has-text("New Campaign")');
    await expect(page).toHaveURL(/.*\/marketing\/campaigns\/new/);

    // Fill campaign details
    await humanType(page, '[name="name"]', 'Weekly Newsletter #47');
    await humanType(page, '[name="subject"]', 'This Week\'s Top Insights on AI & Digital Transformation');
    await humanType(page, '[name="previewText"]', 'Don\'t miss these game-changing insights...');
    tracker.logEvent('Entered campaign details');

    // Compose email (simulate realistic editing)
    logStep('  ✍️ Composing email content...');
    const emailHtml = `
      <p>Hi {{firstName}},</p>
      <p>This week, we're diving into AI-driven digital transformation and what it means for your business.</p>
      <h2>Featured Article</h2>
      <p><a href="{{articleLink}}">AI-Driven Digital Transformation: A Strategic Guide</a></p>
      <p>Discover how leading organizations are leveraging AI to drive competitive advantage.</p>
      <p>See you next week!</p>
      <p>Khaled</p>
    `.trim();

    await page.fill('[name="contentHtml"]', emailHtml);
    await page.waitForTimeout(60000); // 1 minute "composing"
    tracker.logEvent('Composed email content', 'smooth');

    // Select audience
    await humanScrollTo(page, '[name="targetStatus"]');
    await humanClick(page, '[name="targetStatus"]');
    await humanClick(page, 'option[value="confirmed"]');
    tracker.logEvent('Selected target audience');

    // Preview recipients
    await humanClick(page, 'button:has-text("Preview Recipients")');
    await page.waitForTimeout(randomReadingPause());
    
    const recipientCount = page.locator('[data-testid="recipient-count"]');
    if (await recipientCount.isVisible({ timeout: 5000 })) {
      const count = await recipientCount.textContent();
      logStep(`  👥 Recipients: ${count}`);
      tracker.logEvent(`Campaign will reach ${count} subscribers`, 'smooth');
    }

    // Schedule campaign
    await humanScrollTo(page, '[name="scheduledFor"]');
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const dateString = futureDate.toISOString().slice(0, 16);
    await humanType(page, '[name="scheduledFor"]', dateString, { mistakes: false });
    tracker.logEvent('Scheduled campaign for future date');

    // Save and schedule
    await humanScrollTo(page, 'button:has-text("Schedule Campaign")');
    await humanClick(page, 'button:has-text("Schedule Campaign")');
    
    await waitForToast(page, /scheduled/i, 'success');
    tracker.logEvent('Campaign scheduled successfully', 'smooth');

    // ========== CHECK ANALYTICS ==========
    logStep('📊 Step 3: Review marketing analytics');
    await humanClick(page, 'a[href="/marketing"]');
    await page.waitForTimeout(randomReadingPause());
    
    // Check KPIs
    const subscriberCountCard = page.locator('[data-testid="subscriber-count-card"]');
    const openRateCard = page.locator('[data-testid="open-rate-card"]');
    
    if (await subscriberCountCard.isVisible({ timeout: 5000 })) {
      logStep('  ✓ Reviewed subscriber metrics');
      tracker.logEvent('Reviewed marketing KPIs', 'smooth');
    }

    // ========== TEST SUMMARY ==========
    logStep('\n📊 Test Summary:');
    const summary = tracker.getSummary();
    logStep(`  ✅ Smooth: ${summary.smooth}`);
    logStep(`  ⚠️ Minor confusion: ${summary.confusion}`);
    
    expect(summary.smooth).toBeGreaterThan(5); // At least 5 smooth interactions
  });
});

