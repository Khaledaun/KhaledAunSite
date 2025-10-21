import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@khaledaun/db';
import { requireAdmin } from '@khaledaun/auth';

/**
 * GET /api/admin/leads
 * List all leads with filtering, sorting, and pagination
 * 
 * Query params:
 * - status: NEW | REPLIED | SCHEDULED | ARCHIVED
 * - source: CONTACT_FORM | LINKEDIN_EMBED | NEWSLETTER | MANUAL
 * - interest: COLLABORATION | SPEAKING | REFERRAL | PRESS | GENERAL
 * - search: search in name, email, organization, message
 * - sort: createdAt | updatedAt | name
 * - order: asc | desc
 * - page: page number (default: 1)
 * - limit: items per page (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    
    // Filters
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const interest = searchParams.get('interest');
    const search = searchParams.get('search');
    
    // Sorting
    const sort = searchParams.get('sort') || 'createdAt';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (source) {
      where.source = source;
    }
    
    if (interest) {
      where.interest = interest;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.lead.count({ where });

    // Get leads
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
    });

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/leads
 * Create a new lead (from contact form or manual entry)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      email,
      organization,
      country,
      interest,
      message,
      source,
      tags,
    } = body;

    // Validate required fields
    if (!name || !email || !interest || !message || !source) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, interest, message, source' },
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

    // Check for duplicate email
    const existing = await prisma.lead.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Lead with this email already exists', leadId: existing.id },
        { status: 409 }
      );
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
        interest,
        message,
        source,
        tags: tags || [],
        expiresAt,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
