import { NextResponse } from 'next/server';
import { checkAuth } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await checkAuth('manageCMS');
    
    return NextResponse.json({
      success: true,
      authorized: auth.authorized,
      hasUser: !!auth.user,
      authResult: auth.authorized ? { user: auth.user } : { response: 'Would return error response' }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name,
    }, { status: 500 });
  }
}

