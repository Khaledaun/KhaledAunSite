/**
 * LinkedIn OAuth - Step 1: Initiate authorization
 * GET /api/auth/linkedin/connect
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { getAuthorizationUrl } from '@/lib/linkedin/client';
import { generateSecureRandom } from '@/lib/crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // Generate state parameter for CSRF protection
    const state = generateSecureRandom(32);
    
    // Store state in cookie (will be verified in callback)
    const cookieStore = cookies();
    cookieStore.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(state);

    // Redirect to LinkedIn
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn OAuth connect error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate LinkedIn connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

