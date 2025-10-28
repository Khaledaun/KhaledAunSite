/**
 * Send Email Campaign
 * POST /api/email/campaigns/[id]/send - Send campaign to subscribers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { prisma } from '@/lib/prisma';
import { sendBulkEmails } from '@/lib/email/resend-client';

export const dynamic = 'force-dynamic';

interface SendCampaignOptions {
  testMode?: boolean;
  testEmail?: string;
  force?: boolean; // Force send even if already sent
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const body: SendCampaignOptions = await request.json();

    // Get campaign
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if already sent (unless force is true)
    if (campaign.status === 'sent' && !body.force) {
      return NextResponse.json(
        { error: 'Campaign already sent. Use force=true to resend.' },
        { status: 400 }
      );
    }

    // Test mode - send to single email
    if (body.testMode && body.testEmail) {
      const result = await sendBulkEmails([
        {
          to: body.testEmail,
          subject: `[TEST] ${campaign.subject}`,
          html: campaign.contentHtml,
          text: campaign.contentText,
          from: `${campaign.fromName} <${campaign.fromEmail}>`,
          replyTo: campaign.replyTo,
        },
      ]);

      return NextResponse.json({
        success: result[0].success,
        testMode: true,
        email: body.testEmail,
        messageId: result[0].messageId,
        error: result[0].error,
      });
    }

    // Update campaign status to sending
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: 'sending' },
    });

    // Get subscribers based on targeting
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

    // Filter out excluded tags
    let filteredSubscribers = subscribers;
    if (campaign.excludeTags && campaign.excludeTags.length > 0) {
      filteredSubscribers = subscribers.filter((sub) => {
        return !campaign.excludeTags.some((tag) => sub.tags.includes(tag));
      });
    }

    if (filteredSubscribers.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { 
          status: 'failed',
          notes: 'No subscribers matched targeting criteria',
        },
      });

      return NextResponse.json(
        { error: 'No subscribers match targeting criteria' },
        { status: 400 }
      );
    }

    // Prepare emails for batch sending
    const emails = filteredSubscribers.map((subscriber) => {
      // Replace variables in content
      let html = campaign.contentHtml;
      let text = campaign.contentText;
      let subject = campaign.subject;

      const variables: Record<string, string> = {
        firstName: subscriber.firstName || '',
        lastName: subscriber.lastName || '',
        email: subscriber.email,
        unsubscribeUrl: `${getBaseUrl(request)}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
      };

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        html = html.replaceAll(placeholder, value);
        if (text) {
          text = text.replaceAll(placeholder, value);
        }
        subject = subject.replaceAll(placeholder, value);
      });

      // Add unsubscribe link if not present
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
        headers: {
          'X-Campaign-ID': campaignId,
        },
      };
    });

    // Send in batches (Resend supports max 100 per request)
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchResults = await sendBulkEmails(batch);
      results.push(...batchResults);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Count results
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Update campaign
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: {
        status: 'sent',
        sentAt: new Date(),
        totalRecipients: filteredSubscribers.length,
        totalSent: successful,
      },
    });

    // Create email events for sent emails
    for (let i = 0; i < results.length; i++) {
      if (results[i].success && results[i].messageId) {
        await prisma.emailEvent.create({
          data: {
            campaignId,
            email: filteredSubscribers[i].email,
            subscriberId: filteredSubscribers[i].id,
            eventType: 'sent',
            provider: 'resend',
            providerMessageId: results[i].messageId,
          },
        });
      }
    }

    console.log('Campaign sent:', {
      campaignId,
      name: campaign.name,
      recipients: filteredSubscribers.length,
      successful,
      failed,
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaignId,
        name: campaign.name,
      },
      results: {
        total: filteredSubscribers.length,
        sent: successful,
        failed,
      },
    });

  } catch (error) {
    console.error('Send campaign error:', error);

    // Update campaign status to failed
    try {
      await prisma.emailCampaign.update({
        where: { id: params.id },
        data: { 
          status: 'failed',
          notes: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (updateError) {
      console.error('Failed to update campaign status:', updateError);
    }

    return NextResponse.json(
      {
        error: 'Failed to send campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get base URL from request
 */
function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  return `${proto}://${host}`;
}

