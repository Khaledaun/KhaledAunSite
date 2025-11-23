import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isAdmin, type Role } from './roles';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Phase 6 Lite: User interface matching Prisma
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

/**
 * Create Supabase client for server-side auth
 */
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Ignore - can't set cookies in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Ignore - can't set cookies in Server Components
          }
        },
      },
    }
  );
}

/**
 * Get the current session user from Supabase Auth
 */
export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user role from user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const role = (roleData?.role?.toUpperCase() || 'USER') as Role;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || null,
      role,
    };
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
 * Require admin role for API routes and server actions
 * Returns user or throws error
 */
export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  if (!isAdmin(user.role)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Check if user is admin (returns boolean, doesn't throw)
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = await getSessionUser();
    return user ? isAdmin(user.role) : false;
  } catch {
    return false;
  }
}

// Re-export role utilities
export * from './roles';

// Re-export permission utilities
export * from './permissions';