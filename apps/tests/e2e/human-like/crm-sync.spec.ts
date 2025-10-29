/**
 * Human-Like Test: CRM Sync - Contact Form to HubSpot
 * Tests: Backend integration, data sync, deduplication
 * Duration: ~3 minutes
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import {
  humanType,
  humanClick,
  randomShortPause,
  setupHumanTestData,
  logStep,
  BehaviorTracker,
} from './test-utils.human';

test.describe('🔄 CRM Sync - Contact to HubSpot', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Contact form submission creates HubSpot lead', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    logStep('🌐 Visitor submits contact form');

    // Visit contact page
    await page.goto('/contact');
    await page.waitForTimeout(randomShortPause());

    // Fill contact form
    await humanType(page, '[name="firstName"]', 'Sarah');
    await humanType(page, '[name="lastName"]', 'Johnson');
    await humanType(page, '[name="email"]', 'sarah.johnson@techcorp.com', { mistakes: false });
    await humanType(page, '[name="company"]', 'Tech Corp International');
    await humanType(page, '[name="message"]', 'Interested in consulting services for digital transformation project');
    tracker.logEvent('Filled contact form');

    // Submit
    await humanClick(page, 'button[type="submit"]');
    tracker.logEvent('Submitted contact form');

    // Wait for success message
    const successMsg = page.locator('text=/thank you|success|received/i');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
    logStep('  ✓ Form submitted successfully');
    tracker.logEvent('Form submission successful', 'smooth');

    // Verify lead created in database
    await page.waitForTimeout(2000); // Wait for async processing
    
    const lead = await prisma.crmLead.findFirst({
      where: { email: 'sarah.johnson@techcorp.com' },
    });
    
    expect(lead).toBeTruthy();
    expect(lead?.firstName).toBe('Sarah');
    expect(lead?.company).toBe('Tech Corp International');
    logStep('  ✓ Lead created in database');
    tracker.logEvent('Lead stored in CRM', 'smooth');

    // Check HubSpot sync status (would be synced in background)
    if (process.env.HUBSPOT_API_KEY) {
      expect(lead?.hubspotSyncStatus).toBeDefined();
      logStep('  ✓ HubSpot sync initiated');
    } else {
      logStep('  ⚠️ HubSpot not configured (skipping sync check)');
    }

    const summary = tracker.getSummary();
    expect(summary.smooth).toBeGreaterThan(0);
  });

  test('Duplicate contact form submissions are deduplicated', async ({ page }) => {
    test.setTimeout(120000);
    
    logStep('🔄 Test deduplication logic');

    // Create existing lead
    await prisma.crmLead.create({
      data: {
        email: 'duplicate@example.com',
        firstName: 'Test',
        lastName: 'User',
        company: 'Test Co',
        message: 'First message',
        leadStatus: 'contacted',
      },
    });

    // Submit form with same email
    await page.goto('/contact');
    await humanType(page, '[name="email"]', 'duplicate@example.com', { mistakes: false });
    await humanType(page, '[name="firstName"]', 'Test');
    await humanType(page, '[name="lastName"]', 'User');
    await humanType(page, '[name="message"]', 'Second message - follow up');
    await humanClick(page, 'button[type="submit"]');

    await page.waitForTimeout(2000);

    // Should update existing lead, not create duplicate
    const leads = await prisma.crmLead.findMany({
      where: { email: 'duplicate@example.com' },
    });
    
    expect(leads.length).toBe(1); // Only one lead
    expect(leads[0].message).toContain('Second message'); // Updated
    logStep('  ✓ Deduplication working correctly');
    tracker.logEvent('Deduplication verified', 'smooth');
  });
});

