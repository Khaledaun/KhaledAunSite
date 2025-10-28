/**
 * LinkedIn OAuth - Get connection status
 * GET /api/auth/linkedin/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { getLinkedInAccount, testConnection } from '@/lib/linkedin/client';

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

    // Get LinkedIn account
    const account = await getLinkedInAccount(user.id);

    if (!account) {
      return NextResponse.json({
        connected: false,
        account: null,
      });
    }

    // Test connection (optional, can be slow)
    const testConnectionEnabled = request.nextUrl.searchParams.get('test') === 'true';
    let connectionValid = !account.isExpired;

    if (testConnectionEnabled && !account.isExpired) {
      connectionValid = await testConnection(account.accessToken);
    }

    // Return account info (without sensitive tokens)
    return NextResponse.json({
      connected: true,
      account: {
        id: account.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        expiresAt: account.expiresAt,
        isExpired: account.isExpired,
        connectionValid,
        scope: account.scope,
        metadata: account.metadata,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });

  } catch (error) {
    console.error('LinkedIn status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get LinkedIn status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

