/**
 * Newsletter Subscription API
 * POST /api/newsletter/subscribe - Subscribe to newsletter with double opt-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConfirmationEmail } from '@/lib/email/resend-client';
import { syncSubscriberToHubSpot } from '@/lib/crm/hubspot-client';
import { generateSecureRandom } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

interface SubscribeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  preferences?: {
    blog?: boolean;
    newsletter?: boolean;
    productUpdates?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const email = body.email.toLowerCase().trim();

    // Check if subscriber already exists
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      // If already confirmed, return success
      if (existing.status === 'confirmed') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed!',
          alreadySubscribed: true,
        });
      }

      // If pending, resend confirmation
      if (existing.status === 'pending') {
        // Generate new token
        const confirmationToken = generateSecureRandom(32);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            confirmationToken,
            confirmationTokenExpiresAt: expiresAt,
            firstName: body.firstName || existing.firstName,
            lastName: body.lastName || existing.lastName,
          },
        });

        // Send confirmation email
        const confirmUrl = `${getBaseUrl(request)}/api/newsletter/confirm?token=${confirmationToken}`;
        await sendConfirmationEmail(email, confirmUrl, body.firstName);

        return NextResponse.json({
          success: true,
          message: 'Confirmation email resent! Please check your inbox.',
        });
      }

      // If unsubscribed, resubscribe
      if (existing.status === 'unsubscribed') {
        const confirmationToken = generateSecureRandom(32);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await prisma.newsletterSubscriber.update({
          where: { id: existing.id },
          data: {
            status: 'pending',
            confirmationToken,
            confirmationTokenExpiresAt: expiresAt,
            firstName: body.firstName || existing.firstName,
            lastName: body.lastName || existing.lastName,
            subscribedAt: new Date(),
          },
        });

        const confirmUrl = `${getBaseUrl(request)}/api/newsletter/confirm?token=${confirmationToken}`;
        await sendConfirmationEmail(email, confirmUrl, body.firstName);

        return NextResponse.json({
          success: true,
          message: 'Welcome back! Please confirm your email.',
        });
      }
    }

    // Create new subscriber
    const confirmationToken = generateSecureRandom(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName: body.firstName,
        lastName: body.lastName,
        status: 'pending',
        confirmationToken,
        confirmationTokenExpiresAt: expiresAt,
        source: body.source || 'website',
        sourceUrl: body.sourceUrl,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        preferences: body.preferences || {
          blog: true,
          newsletter: true,
          productUpdates: false,
        },
        ipAddress,
        userAgent,
      },
    });

    // Send confirmation email
    const confirmUrl = `${getBaseUrl(request)}/api/newsletter/confirm?token=${confirmationToken}`;
    const emailResult = await sendConfirmationEmail(email, confirmUrl, body.firstName);

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the subscription, but log it
    }

    // Log the subscription
    console.log('New subscriber:', {
      email,
      source: body.source,
      utmSource: body.utmSource,
    });

    return NextResponse.json({
      success: true,
      message: 'Almost there! Please check your email to confirm your subscription.',
      subscriberId: subscriber.id,
    });

  } catch (error) {
    console.error('Newsletter subscribe error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process subscription',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper: Get base URL from request
 */
function getBaseUrl(request: NextRequest): string {
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  return `${proto}://${host}`;
}

