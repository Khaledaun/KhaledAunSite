/**
 * Resend Webhooks Handler
 * POST /api/webhooks/resend - Handle email events from Resend
 * 
 * Events: email.sent, email.delivered, email.opened, email.clicked, 
 *         email.bounced, email.complained, email.unsubscribed
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Event-specific data
    link?: {
      url: string;
      text?: string;
    };
    bounce?: {
      type: 'hard' | 'soft';
      reason?: string;
    };
    complaint?: {
      feedback_type?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if Resend provides one)
    const signature = request.headers.get('resend-signature');
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      // For now, we'll trust the webhook
    }

    const event: ResendWebhookEvent = await request.json();

    console.log('Resend webhook received:', {
      type: event.type,
      emailId: event.data.email_id,
      to: event.data.to[0],
    });

    // Map Resend event type to our event type
    const eventTypeMap: Record<string, string> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'complained',
      'email.delivery_delayed': 'delivered', // Treat as delivered for now
    };

    const eventType = eventTypeMap[event.type];

    if (!eventType) {
      console.warn('Unknown Resend event type:', event.type);
      return NextResponse.json({ received: true });
    }

    const emailAddress = event.data.to[0];

    // Find subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: emailAddress },
    });

    // Find campaign by provider message ID or subject
    // Note: We'll need to store the provider_message_id when sending
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        providerCampaignId: event.data.email_id,
      },
    });

    // Create email event
    await prisma.emailEvent.create({
      data: {
        campaignId: campaign?.id,
        subscriberId: subscriber?.id,
        email: emailAddress,
        eventType,
        linkUrl: event.data.link?.url,
        linkText: event.data.link?.text,
        bounceType: event.data.bounce?.type,
        bounceReason: event.data.bounce?.reason,
        complaintFeedbackType: event.data.complaint?.feedback_type,
        provider: 'resend',
        providerMessageId: event.data.email_id,
        eventTimestamp: new Date(event.created_at),
      },
    });

    // Update subscriber engagement metrics
    if (subscriber) {
      const updates: any = {};

      if (eventType === 'opened') {
        updates.totalOpens = { increment: 1 };
        updates.lastOpenedAt = new Date();
      }

      if (eventType === 'clicked') {
        updates.totalClicks = { increment: 1 };
        updates.lastClickedAt = new Date();
      }

      if (eventType === 'bounced') {
        updates.status = 'bounced';
      }

      if (eventType === 'complained') {
        updates.status = 'complained';
      }

      if (Object.keys(updates).length > 0) {
        await prisma.newsletterSubscriber.update({
          where: { id: subscriber.id },
          data: updates,
        });
      }
    }

    // Update campaign analytics
    if (campaign) {
      const updates: any = {};

      switch (eventType) {
        case 'sent':
          updates.totalSent = { increment: 1 };
          break;
        case 'delivered':
          updates.totalDelivered = { increment: 1 };
          break;
        case 'opened':
          updates.totalOpens = { increment: 1 };
          break;
        case 'clicked':
          updates.totalClicks = { increment: 1 };
          break;
        case 'bounced':
          updates.totalBounces = { increment: 1 };
          break;
        case 'complained':
          updates.totalComplaints = { increment: 1 };
          break;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: updates,
        });
      }
    }

    return NextResponse.json({
      received: true,
      eventType,
      processed: true,
    });

  } catch (error) {
    console.error('Resend webhook error:', error);

    // Always return 200 to prevent Resend from retrying
    // Log the error for investigation
    return NextResponse.json({
      received: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ready',
    webhook: 'resend',
    timestamp: new Date().toISOString(),
  });
}

