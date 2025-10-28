/**
 * LinkedIn OAuth - Disconnect account
 * POST /api/auth/linkedin/disconnect
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { revokeLinkedInAccount } from '@/lib/linkedin/client';

export const dynamic = 'force-dynamic';

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

    // Revoke LinkedIn connection
    const result = await revokeLinkedInAccount(user.id);

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'No LinkedIn account connected' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn account disconnected successfully',
    });

  } catch (error) {
    console.error('LinkedIn disconnect error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to disconnect LinkedIn account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

