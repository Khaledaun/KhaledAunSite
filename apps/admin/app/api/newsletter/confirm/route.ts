/**
 * Newsletter Confirmation API
 * GET /api/newsletter/confirm?token=xxx - Confirm subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncSubscriberToHubSpot } from '@/lib/crm/hubspot-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=missing_token', request.url)
      );
    }

    // Find subscriber by token
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { confirmationToken: token },
    });

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=invalid_token', request.url)
      );
    }

    // Check if already confirmed
    if (subscriber.status === 'confirmed') {
      return NextResponse.redirect(
        new URL('/newsletter/confirmed?already=true', request.url)
      );
    }

    // Check if token expired
    if (
      subscriber.confirmationTokenExpiresAt &&
      new Date() > subscriber.confirmationTokenExpiresAt
    ) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=expired_token', request.url)
      );
    }

    // Confirm subscription
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmationToken: null, // Clear token after use
        confirmationTokenExpiresAt: null,
      },
    });

    // Sync to HubSpot (async, don't block)
    syncSubscriberToHubSpot({
      email: subscriber.email,
      firstName: subscriber.firstName || undefined,
      lastName: subscriber.lastName || undefined,
      source: subscriber.source || 'newsletter',
      sourceUrl: subscriber.sourceUrl || undefined,
      utmSource: subscriber.utmSource || undefined,
      utmMedium: subscriber.utmMedium || undefined,
      utmCampaign: subscriber.utmCampaign || undefined,
    })
      .then((result) => {
        if (result.success && result.contactId) {
          // Update subscriber with HubSpot ID
          prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
              hubspotContactId: result.contactId,
              hubspotSyncedAt: new Date(),
            },
          });
        }
      })
      .catch((error) => {
        console.error('HubSpot sync failed:', error);
        // Don't fail the confirmation
      });

    // Log confirmation
    console.log('Subscriber confirmed:', {
      email: subscriber.email,
      source: subscriber.source,
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/newsletter/confirmed', request.url)
    );

  } catch (error) {
    console.error('Newsletter confirm error:', error);

    return NextResponse.redirect(
      new URL('/newsletter/error?reason=server_error', request.url)
    );
  }
}

