import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';

/**
 * POST /api/contact
 * Public contact form submission endpoint
 * Creates a lead in the admin system
 */
export async function POST(request: NextRequest) {
  try {
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
    const lead = await prisma.lead.create({
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

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message! We will get back to you soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}

