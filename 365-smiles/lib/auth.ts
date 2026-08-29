import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

/**
 * Server-side auth check for admin API routes.
 * Returns the authenticated user or null.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Read-only in API routes
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Middleware-style auth guard for admin API routes.
 * Returns null if authorized, or a Response if unauthorized.
 */
export async function requireAdminAuth(): Promise<Response | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return Response.json(
      { success: false, error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }
  return null; // authorized
}
