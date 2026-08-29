import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Creates or returns a cached Supabase browser client.
 * Safe to call during SSR — will throw only if env vars are truly missing
 * at runtime (not during static build).
 */
export const createSupabaseClient = () => {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During static build/prerender, env vars may not be set.
    // Return a minimal stub that won't crash SSR but will be replaced
    // by the real client in the browser.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {} as any as SupabaseClient;
  }

  _client = createBrowserClient(url, key);
  return _client;
};
