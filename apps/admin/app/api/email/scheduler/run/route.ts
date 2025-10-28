/**
 * Email Scheduler Cron Job
 * GET /api/email/scheduler/run - Process scheduled campaigns
 * 
 * Called by Vercel Cron every minute
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails } from '@/lib/email/resend-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized email scheduler request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('📧 Email scheduler started');

    // Find campaigns that are scheduled and due
    const dueCampaigns = await prisma.emailCampaign.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: new Date(),
        },
      },
      take: 5, // Process max 5 campaigns per run
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    if (dueCampaigns.length === 0) {
      const duration = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        message: 'No campaigns due',
        processed: 0,
        duration,
      });
    }

    console.log(`Found ${dueCampaigns.length} campaigns to send`);

    const results = [];

    for (const campaign of dueCampaigns) {
      try {
        // Mark as sending
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: 'sending' },
        });

        // Get subscribers
        const where: any = {
          status: { in: campaign.targetStatus },
        };

        if (campaign.targetTags && campaign.targetTags.length > 0) {
          where.tags = {
            hasSome: campaign.targetTags,
          };
        }

        const subscribers = await prisma.newsletterSubscriber.findMany({
          where,
        });

        // Filter excluded tags
        let filteredSubscribers = subscribers;
        if (campaign.excludeTags && campaign.excludeTags.length > 0) {
          filteredSubscribers = subscribers.filter((sub) => {
            return !campaign.excludeTags.some((tag) => sub.tags.includes(tag));
          });
        }

        if (filteredSubscribers.length === 0) {
          await prisma.emailCampaign.update({
            where: { id: campaign.id },
            data: {
              status: 'failed',
              notes: 'No subscribers matched targeting',
            },
          });

          results.push({
            campaignId: campaign.id,
            name: campaign.name,
            success: false,
            error: 'No subscribers',
          });

          continue;
        }

        // Prepare emails
        const emails = filteredSubscribers.map((subscriber) => {
          let html = campaign.contentHtml;
          let text = campaign.contentText;
          let subject = campaign.subject;

          const variables: Record<string, string> = {
            firstName: subscriber.firstName || '',
            lastName: subscriber.lastName || '',
            email: subscriber.email,
            unsubscribeUrl: `https://${request.headers.get('host')}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
          };

          Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            html = html.replaceAll(placeholder, value);
            if (text) {
              text = text.replaceAll(placeholder, value);
            }
            subject = subject.replaceAll(placeholder, value);
          });

          // Add unsubscribe footer
          if (!html.includes('unsubscribe')) {
            html += `<p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
              <a href="${variables.unsubscribeUrl}" style="color: #999;">Unsubscribe</a>
            </p>`;
          }

          return {
            to: subscriber.email,
            subject,
            html,
            text,
            from: `${campaign.fromName} <${campaign.fromEmail}>`,
            replyTo: campaign.replyTo,
          };
        });

        // Send in batches
        const batchSize = 100;
        const sendResults = [];

        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);
          const batchResults = await sendBulkEmails(batch);
          sendResults.push(...batchResults);

          if (i + batchSize < emails.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        const successful = sendResults.filter((r) => r.success).length;

        // Update campaign
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            totalRecipients: filteredSubscribers.length,
            totalSent: successful,
          },
        });

        // Create events
        for (let i = 0; i < sendResults.length; i++) {
          if (sendResults[i].success && sendResults[i].messageId) {
            await prisma.emailEvent.create({
              data: {
                campaignId: campaign.id,
                email: filteredSubscribers[i].email,
                subscriberId: filteredSubscribers[i].id,
                eventType: 'sent',
                provider: 'resend',
                providerMessageId: sendResults[i].messageId,
              },
            });
          }
        }

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          success: true,
          recipients: filteredSubscribers.length,
          sent: successful,
        });

        console.log(`✅ Sent campaign: ${campaign.name} (${successful}/${filteredSubscribers.length})`);

      } catch (error) {
        console.error(`❌ Failed to send campaign ${campaign.id}:`, error);

        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'failed',
            notes: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        results.push({
          campaignId: campaign.id,
          name: campaign.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;
    const successful = results.filter((r) => r.success).length;

    console.log(`✅ Email scheduler completed: ${successful}/${results.length} campaigns sent (${duration}ms)`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      processed: results.length,
      successful,
      results,
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('❌ Email scheduler error:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

