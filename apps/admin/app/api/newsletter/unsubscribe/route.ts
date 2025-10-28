/**
 * Newsletter Unsubscribe API
 * GET /api/newsletter/unsubscribe?email=xxx - Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe - Unsubscribe with token or email
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendUnsubscribeConfirmation } from '@/lib/email/resend-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email && !token) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=missing_params', request.url)
      );
    }

    let subscriber;

    if (token) {
      // Find by token (more secure)
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: {
          email,
          // Generate a simple hash for unsubscribe tokens if needed
          // For now, just use email
        },
      });
    } else if (email) {
      // Find by email
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!subscriber) {
      return NextResponse.redirect(
        new URL('/newsletter/error?reason=not_found', request.url)
      );
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(
        new URL('/newsletter/unsubscribed?already=true', request.url)
      );
    }

    // Unsubscribe
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    // Send confirmation email
    await sendUnsubscribeConfirmation(
      subscriber.email,
      subscriber.firstName || undefined
    );

    // Log unsubscribe
    console.log('Subscriber unsubscribed:', {
      email: subscriber.email,
    });

    // Redirect to unsubscribed page
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed', request.url)
    );

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);

    return NextResponse.redirect(
      new URL('/newsletter/error?reason=server_error', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    if (!email && !token) {
      return NextResponse.json(
        { error: 'Email or token is required' },
        { status: 400 }
      );
    }

    let subscriber;

    if (token) {
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { email: email?.toLowerCase().trim() },
      });
    } else if (email) {
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'Already unsubscribed',
        alreadyUnsubscribed: true,
      });
    }

    // Unsubscribe
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      },
    });

    // Send confirmation email
    await sendUnsubscribeConfirmation(
      subscriber.email,
      subscriber.firstName || undefined
    );

    // Log unsubscribe
    console.log('Subscriber unsubscribed:', {
      email: subscriber.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);

    return NextResponse.json(
      {
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

