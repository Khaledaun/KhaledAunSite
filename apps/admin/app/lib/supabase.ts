import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSessionUser, requirePermission, Permission } from '@khaledaun/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side Supabase client for API routes (uses service role key for admin operations)
export function getSupabaseClient() {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  // Use service role key for server-side operations to bypass RLS
  const key = supabaseServiceKey || supabaseAnonKey;
  
  if (!key) {
    throw new Error('Missing Supabase key (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
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

