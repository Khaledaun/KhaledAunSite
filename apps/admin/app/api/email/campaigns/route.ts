/**
 * Email Campaigns API
 * GET /api/email/campaigns - List campaigns
 * POST /api/email/campaigns - Create campaign
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error('List campaigns error:', error);

    return NextResponse.json(
      {
        error: 'Failed to list campaigns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.subject || !body.contentHtml) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, contentHtml' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        name: body.name,
        subject: body.subject,
        previewText: body.previewText,
        contentHtml: body.contentHtml,
        contentText: body.contentText,
        fromName: body.fromName || process.env.EMAIL_FROM_NAME || 'Khaled Aun',
        fromEmail: body.fromEmail || process.env.EMAIL_FROM_ADDRESS || 'hello@khaledaun.com',
        replyTo: body.replyTo || process.env.EMAIL_REPLY_TO || 'hello@khaledaun.com',
        status: body.scheduledFor ? 'scheduled' : 'draft',
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        targetStatus: body.targetStatus || ['confirmed'],
        targetTags: body.targetTags || [],
        excludeTags: body.excludeTags || [],
        tags: body.tags || [],
        notes: body.notes,
        createdBy: user.id,
      },
    });

    console.log('Campaign created:', {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
    });

    return NextResponse.json({
      success: true,
      campaign,
    });

  } catch (error) {
    console.error('Create campaign error:', error);

    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

