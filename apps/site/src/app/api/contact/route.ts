import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

/**
 * POST /api/contact
 * Public contact form submission endpoint
 * Creates a lead in the admin system
 * Rate limited to 3 requests per hour per IP
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (3 submissions per hour)
    const rateLimitResult = await rateLimit(request, 'contactForm');

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.reset);
    }

    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      message,
      organization,
      country,
      interest,
    } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check for recent duplicate (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentDuplicate = await prisma.lead.findFirst({
      where: {
        email,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentDuplicate) {
      return NextResponse.json(
        { error: 'You have already submitted a contact request recently. Please wait before submitting again.' },
        { status: 429 }
      );
    }

    // Build message with phone if provided
    let fullMessage = message;
    if (phone) {
      fullMessage = `Phone: ${phone}\n\n${message}`;
    }

    // Set expiration date (12 months from now)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 12);

    // Create lead
    await prisma.lead.create({
      data: {
        name,
        email,
        organization: organization || null,
        country: country || null,
        interest: interest || 'GENERAL',
        message: fullMessage,
        source: 'CONTACT_FORM',
        status: 'NEW',
        expiresAt,
      },
    });

    // Return success with rate limit headers
    const response = NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      },
      { status: 201 }
    );

    // Add rate limit headers
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}

