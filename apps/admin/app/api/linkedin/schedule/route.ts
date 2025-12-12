/**
 * LinkedIn Schedule API
 * POST /api/linkedin/schedule - Schedule a post for future publishing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { schedulePost, cancelScheduledPost } from '@/lib/scheduler/queue';

export const dynamic = 'force-dynamic';

interface ScheduleRequest {
  contentId: string;
  scheduledFor: string; // ISO date string
  targets?: string[]; // Default ['linkedin']
}

interface CancelRequest {
  contentId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ScheduleRequest = await request.json();

    if (!body.contentId || !body.scheduledFor) {
      return NextResponse.json(
        { error: 'contentId and scheduledFor are required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(body.scheduledFor);

    // Validate date is in the future
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'scheduledFor must be in the future' },
        { status: 400 }
      );
    }

    // Schedule the post
    await schedulePost(
      body.contentId,
      scheduledDate,
      body.targets || ['linkedin']
    );

    return NextResponse.json({
      success: true,
      message: 'Post scheduled successfully',
      scheduledFor: scheduledDate.toISOString(),
    });

  } catch (error) {
    console.error('Schedule API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to schedule post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE to cancel a scheduled post
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CancelRequest = await request.json();

    if (!body.contentId) {
      return NextResponse.json(
        { error: 'contentId is required' },
        { status: 400 }
      );
    }

    // Cancel the scheduled post
    await cancelScheduledPost(body.contentId);

    return NextResponse.json({
      success: true,
      message: 'Scheduled post cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel schedule API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to cancel scheduled post',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

