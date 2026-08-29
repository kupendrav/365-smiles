import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;
let _adminChecked = false;

/**
 * Returns the public (anon-key) Supabase client.
 * Lazily initialized to avoid build-time env var errors.
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    if (!supabaseAnonKey) throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

/**
 * Returns the admin (service-role) Supabase client, or null if not configured.
 */
function getAdminOrNull(): SupabaseClient | null {
  if (!_adminChecked) {
    _adminChecked = true;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceRoleKey) {
      _supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }
  return _supabaseAdmin;
}

/**
 * Returns the admin client or throws if not configured.
 * Use in any server route that requires elevated privileges.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const admin = getAdminOrNull();
  if (!admin) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations are not available.'
    );
  }
  return admin;
}

// Backward-compatible named exports.
// These delegate to the lazy getters so they never fail at build time.
// The `as unknown as SupabaseClient` cast is safe because the proxy
// delegates every property/method to the real client at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = new Proxy({} as SupabaseClient, {
  get(_, prop, receiver) {
    const client = getSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: any = new Proxy({} as SupabaseClient, {
  get(_, prop, receiver) {
    const admin = getAdminOrNull();
    if (!admin) return undefined;
    const value = Reflect.get(admin, prop, receiver);
    return typeof value === 'function' ? value.bind(admin) : value;
  },
});
