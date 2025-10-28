/**
 * Scheduler Cron Endpoint
 * GET /api/scheduler/run
 * 
 * Called by Vercel Cron every minute to process scheduled posts
 * Configure in vercel.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/scheduler/queue';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Scheduler cron job started');

    // Process scheduled posts
    const results = await processScheduledPosts();

    const duration = Date.now() - startTime;

    console.log('✅ Scheduler cron job completed', {
      duration: `${duration}ms`,
      ...results,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      results,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('❌ Scheduler cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

