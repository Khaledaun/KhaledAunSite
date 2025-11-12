/**
 * LinkedIn OAuth - Step 2: Handle callback
 * GET /api/auth/linkedin/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/supabase-server';
import { 
  exchangeCodeForToken, 
  getProfile, 
  storeSocialAccount 
} from '@/lib/linkedin/client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      );
    }

    // Get OAuth parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/social?error=linkedin_oauth_failed&details=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/social?error=missing_code_or_state', request.url)
      );
    }

    // Verify state parameter (CSRF protection)
    const cookieStore = await cookies();
    const savedState = cookieStore.get('linkedin_oauth_state')?.value;
    
    if (!savedState || savedState !== state) {
      console.error('State mismatch:', { savedState, receivedState: state });
      return NextResponse.redirect(
        new URL('/social?error=invalid_state', request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete('linkedin_oauth_state');

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code);

    // Get LinkedIn profile
    const profile = await getProfile(tokens.accessToken);

    // Store encrypted tokens in database
    await storeSocialAccount(user.id, tokens, profile);

    // Redirect back to social page with success
    return NextResponse.redirect(
      new URL('/social?success=linkedin_connected', request.url)
    );

  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    
    return NextResponse.redirect(
      new URL(
        `/social?error=connection_failed&details=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    );
  }
}

