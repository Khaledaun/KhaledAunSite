/**
 * Human-Like Test: Subscriber (Fatima) Newsletter Journey
 * Persona: Fatima Al-Said (SUBSCRIBER)
 * Goals: Subscribe to newsletter, confirm email, eventually unsubscribe
 * Device: Mobile, Safari
 * Duration: ~2 minutes per journey
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  humanType,
  humanClick,
  randomShortPause,
  randomReadingPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('👤 Fatima (Subscriber) - Newsletter Journey', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Fatima subscribes and confirms newsletter', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    logStep('👤 Fatima visits the website');
    tracker.logEvent('Visitor lands on site');

    // Visit public site
    await page.goto('/');
    await page.waitForTimeout(randomReadingPause());
    logStep('  👀 Reading homepage content...');

    // Scroll to footer (where newsletter form is)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(randomShortPause());
    tracker.logEvent('Scrolled to newsletter form');

    // Fill newsletter form
    logStep('📧 Step 1: Subscribe to newsletter');
    await humanType(page, '[name="email"]', 'fatima@example.com', { mistakes: false });
    await humanType(page, '[name="firstName"]', 'Fatima');
    await humanType(page, '[name="lastName"]', 'Al-Said');
    
    await humanClick(page, 'button:has-text("Subscribe")');
    tracker.logEvent('Submitted subscription form');

    // Wait for confirmation message
    const successMessage = page.locator('text=/check your email|confirm/i');
    await expect(successMessage).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(randomReadingPause());
    logStep('  ✓ Subscription successful - confirmation email sent');
    tracker.logEvent('Confirmation email sent', 'smooth');

    // ========== SIMULATE EMAIL CONFIRMATION ==========
    logStep('📬 Step 2: Confirm via email');
    
    // Get confirmation token from database
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: 'fatima@example.com' },
    });
    
    if (subscriber && subscriber.confirmationToken) {
      // Visit confirmation link
      await page.goto(`/newsletter/confirm?token=${subscriber.confirmationToken}`);
      await page.waitForTimeout(randomShortPause());
      
      // Check for success message
      const confirmSuccess = page.locator('text=/confirmed|success/i');
      await expect(confirmSuccess).toBeVisible({ timeout: 5000 });
      logStep('  ✓ Email confirmed successfully');
      tracker.logEvent('Subscription confirmed', 'smooth');
      
      // Verify in database
      const confirmed = await prisma.newsletterSubscriber.findUnique({
        where: { email: 'fatima@example.com' },
      });
      expect(confirmed?.status).toBe('confirmed');
    }

    const summary = tracker.getSummary();
    expect(summary.smooth).toBe(2); // Two smooth interactions
  });

  test('Fatima unsubscribes from newsletter', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    logStep('👤 Fatima decides to unsubscribe');
    tracker = new BehaviorTracker();

    // Create confirmed subscriber
    await prisma.newsletterSubscriber.upsert({
      where: { email: 'fatima@example.com' },
      create: {
        email: 'fatima@example.com',
        firstName: 'Fatima',
        lastName: 'Al-Said',
        status: 'confirmed',
        confirmedAt: new Date(),
      },
      update: {},
    });

    // Visit unsubscribe page
    await page.goto('/newsletter/unsubscribe?email=fatima@example.com');
    await page.waitForTimeout(randomReadingPause());
    logStep('  👀 Reading unsubscribe page...');

    // Confirm unsubscribe
    await humanClick(page, 'button:has-text("Unsubscribe")');
    tracker.logEvent('Clicked unsubscribe');

    // Check success message
    const unsubSuccess = page.locator('text=/unsubscribed|success/i');
    await expect(unsubSuccess).toBeVisible({ timeout: 5000 });
    logStep('  ✓ Unsubscribed successfully');
    tracker.logEvent('Unsubscribed successfully', 'smooth');

    // Verify in database
    const unsubscribed = await prisma.newsletterSubscriber.findUnique({
      where: { email: 'fatima@example.com' },
    });
    expect(unsubscribed?.status).toBe('unsubscribed');
  });
});

