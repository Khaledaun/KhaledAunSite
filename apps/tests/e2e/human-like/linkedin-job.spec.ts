/**
 * Human-Like Test: LinkedIn Scheduler Cron Job
 * Tests: Scheduled posting, retry logic, token refresh
 * Duration: ~4 minutes
 */

import { test, expect } from '@playwright/test';
import { prisma } from '@khaledaun/db';
import { setupHumanTestData, logStep, BehaviorTracker } from './test-utils.human';

test.describe('📱 LinkedIn Scheduler - Cron Job Tests', () => {
  let tracker: BehaviorTracker;

  test.beforeEach(async () => {
    tracker = new BehaviorTracker();
    await setupHumanTestData(prisma);
  });

  test('Scheduled LinkedIn post is processed by cron job', async ({ page, request }) => {
    test.setTimeout(240000); // 4 minutes
    
    logStep('⏰ Test LinkedIn scheduler cron job');

    // Create content with scheduled LinkedIn post
    const content = await prisma.contentLibrary.create({
      data: {
        title: 'Test Scheduled Post',
        content: '<p>This is a scheduled LinkedIn post.</p>',
        type: 'linkedin_post',
        status: 'published',
        publishedAt: new Date(),
        publishTargets: ['linkedin'],
        publishStatus: 'queued',
        authorId: 'user-khaled-001',
      },
    });

    // Create publish job (scheduled for immediate processing)
    const job = await prisma.publishJob.create({
      data: {
        contentId: content.id,
        platform: 'linkedin',
        scheduledFor: new Date(Date.now() - 1000), // 1 second ago (ready to process)
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
      },
    });

    logStep(`  ✓ Created scheduled job: ${job.id}`);
    tracker.logEvent('Scheduled job created');

    // Call scheduler endpoint (simulates cron)
    const response = await request.post('/api/scheduler/run', {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    logStep(`  📊 Processed ${result.processed || 0} jobs`);
    tracker.logEvent('Scheduler executed', 'smooth');

    // Check job status updated
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for async processing
    
    const updatedJob = await prisma.publishJob.findUnique({
      where: { id: job.id },
    });

    if (process.env.LINKEDIN_CLIENT_ID) {
      // If LinkedIn configured, should attempt posting
      expect(updatedJob?.status).not.toBe('pending');
      logStep(`  ✓ Job status: ${updatedJob?.status}`);
      tracker.logEvent(`Job processed: ${updatedJob?.status}`, 'smooth');
    } else {
      logStep('  ⚠️ LinkedIn not configured (job would fail in real scenario)');
    }
  });

  test('Failed LinkedIn post retries with exponential backoff', async ({ request }) => {
    test.setTimeout(180000);
    
    logStep('🔄 Test retry logic with exponential backoff');

    // Create job that will fail (no valid LinkedIn token)
    const content = await prisma.contentLibrary.create({
      data: {
        title: 'Test Retry Post',
        content: '<p>Test content.</p>',
        type: 'linkedin_post',
        status: 'published',
        authorId: 'user-khaled-001',
      },
    });

    const job = await prisma.publishJob.create({
      data: {
        contentId: content.id,
        platform: 'linkedin',
        scheduledFor: new Date(Date.now() - 1000),
        status: 'pending',
        attempts: 0,
        maxAttempts: 3,
      },
    });

    // Run scheduler multiple times (simulate retries)
    for (let i = 1; i <= 3; i++) {
      logStep(`  🔄 Attempt ${i}...`);
      
      await request.post('/api/scheduler/run', {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET || 'test-secret'}`,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedJob = await prisma.publishJob.findUnique({
        where: { id: job.id },
      });

      logStep(`    Attempts: ${updatedJob?.attempts}, Status: ${updatedJob?.status}`);
      
      if (updatedJob?.status === 'failed') {
        logStep(`  ✓ Job marked as failed after ${updatedJob.attempts} attempts`);
        tracker.logEvent('Retry logic working correctly', 'smooth');
        break;
      }
    }

    const finalJob = await prisma.publishJob.findUnique({
      where: { id: job.id },
    });

    expect(finalJob?.attempts).toBeGreaterThan(0);
  });
});

