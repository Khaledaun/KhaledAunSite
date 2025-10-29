/**
 * Human-Like Test: Resend Webhook Events
 * Tests: Email analytics, webhook processing, idempotency
 * Duration: ~3 minutes
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import { setupHumanTestData, logStep, BehaviorTracker } from './test-utils.human';

test.describe('📧 Resend Webhook - Email Analytics', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Email opened event is processed and tracked', async ({ request }) => {
    test.setTimeout(180000);
    
    logStep('📬 Test email opened webhook');

    // Create campaign and subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    const campaign = await prisma.emailCampaign.create({
      data: {
        name: 'Test Campaign',
        subject: 'Test Subject',
        contentHtml: '<p>Test</p>',
        status: 'sent',
        sentAt: new Date(),
        createdBy: 'user-khaled-001',
      },
    });

    // Simulate Resend webhook (email opened)
    const webhookPayload = {
      type: 'email.opened',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_test_123',
        from: 'hello@khaledaun.com',
        to: ['test@example.com'],
        subject: 'Test Subject',
        opened_at: new Date().toISOString(),
        ip: '203.0.113.42',
        user_agent: 'Mozilla/5.0 (iPhone...)',
        location: 'Dubai, UAE',
      },
    };

    const response = await request.post('/api/webhooks/resend', {
      data: webhookPayload,
      headers: {
        'resend-signature': process.env.RESEND_WEBHOOK_SECRET || 'test-secret',
      },
    });

    expect(response.ok()).toBeTruthy();
    logStep('  ✓ Webhook processed successfully');
    tracker.logEvent('Webhook received and processed', 'smooth');

    // Wait for async processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify email event created
    const events = await prisma.emailEvent.findMany({
      where: {
        email: 'test@example.com',
        eventType: 'opened',
      },
    });

    expect(events.length).toBeGreaterThan(0);
    logStep(`  ✓ ${events.length} open event(s) recorded`);

    // Verify subscriber metrics updated
    const updatedSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id: subscriber.id },
    });

    expect(updatedSubscriber?.totalOpens).toBeGreaterThan(0);
    logStep(`  ✓ Subscriber open count: ${updatedSubscriber?.totalOpens}`);
    tracker.logEvent('Analytics updated correctly', 'smooth');
  });

  test('Email clicked event tracks link analytics', async ({ request }) => {
    test.setTimeout(120000);
    
    logStep('🖱️ Test email clicked webhook');

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: 'clicker@example.com',
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Simulate click event
    const webhookPayload = {
      type: 'email.clicked',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_test_456',
        to: ['clicker@example.com'],
        clicked_at: new Date().toISOString(),
        link: {
          url: 'https://khaledaun.com/blog/article-1',
          text: 'Read More',
        },
      },
    };

    const response = await request.post('/api/webhooks/resend', {
      data: webhookPayload,
    });

    expect(response.ok()).toBeTruthy();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify click event recorded
    const clickEvents = await prisma.emailEvent.findMany({
      where: {
        email: 'clicker@example.com',
        eventType: 'clicked',
      },
    });

    expect(clickEvents.length).toBeGreaterThan(0);
    expect(clickEvents[0].linkUrl).toContain('khaledaun.com');
    logStep('  ✓ Click event recorded with link URL');
    tracker.logEvent('Click tracking working', 'smooth');
  });

  test('Duplicate webhook events are handled idempotently', async ({ request }) => {
    test.setTimeout(120000);
    
    logStep('🔄 Test webhook idempotency');

    await prisma.newsletterSubscriber.create({
      data: {
        email: 'idempotent@example.com',
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    const webhookPayload = {
      type: 'email.opened',
      id: 'unique-event-id-123',
      created_at: new Date().toISOString(),
      data: {
        email_id: 're_test_789',
        to: ['idempotent@example.com'],
        opened_at: new Date().toISOString(),
      },
    };

    // Send same webhook twice
    await request.post('/api/webhooks/resend', { data: webhookPayload });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await request.post('/api/webhooks/resend', { data: webhookPayload });
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Should only create one event (idempotency)
    const events = await prisma.emailEvent.findMany({
      where: {
        providerEventId: 'unique-event-id-123',
      },
    });

    expect(events.length).toBe(1);
    logStep('  ✓ Duplicate webhook ignored (idempotency working)');
    tracker.logEvent('Idempotency verified', 'smooth');
  });
});

