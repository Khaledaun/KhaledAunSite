import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, requirePermission, Permission } from '@khaledaun/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side Supabase client for API routes
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Helper to check authentication and permissions
 * Returns user if authorized, or NextResponse with error if not
 */
export async function checkAuth(permission: Permission) {
  const user = await getSessionUser();
  
  if (!user) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }
  
  try {
    requirePermission(user, permission);
    return { authorized: true, user };
  } catch (error) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    };
  }
}

