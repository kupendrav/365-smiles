import { supabase } from '@/lib/supabase';
import { fetchEmergencyNews } from '@/lib/news';
import { requireAdminAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST() {
  try {
    // Admin-only endpoint
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    let news: Array<{ title: string; url: string; source?: string; publishedAt?: string }> = [];
    try {
      news = await fetchEmergencyNews({ limit: 10, recentDays: 7 });
    } catch (e) {
      console.warn('[poll] emergency fetch failed:', (e as Error)?.message || e);
      news = [];
    }

    const inserted: Array<{ title: string; link: string; id: string; platform: string | null }> = [];
    const duplicates: Array<{ link: string }> = [];
    const errors: Array<{ link: string; error?: string }> = [];

    for (const n of news) {
      const title = n.title;
      const link = n.url;
      const platform = classifyPlatform(n.source || '');
      if (!link) continue;

      const { data: exists, error: selErr } = await supabase
        .from('emergency_needs')
        .select('id')
        .eq('source_url', link)
        .limit(1)
        .maybeSingle();

      if (selErr) {
        errors.push({ link, error: selErr.message });
        continue;
      }
      if (exists) {
        duplicates.push({ link });
        continue;
      }

      const { data: insData, error: insErr } = await supabase
        .from('emergency_needs')
        .insert({ title, source_url: link, platform, read: false })
        .select()
        .single();

      if (insErr) {
        errors.push({ link, error: insErr.message });
        continue;
      }
      inserted.push({ title, link, id: insData.id, platform });
    }

    console.log(
      '[poll] inserted:',
      inserted.length,
      'duplicates:',
      duplicates.length,
      'errors:',
      errors.length
    );
    return apiSuccess({ inserted, duplicates, errors });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

function classifyPlatform(displayLink: string): string | null {
  const host = displayLink.toLowerCase();
  if (host.includes('twitter.com') || host.includes('x.com')) return 'twitter';
  if (host.includes('facebook.com')) return 'facebook';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('reddit.com')) return 'reddit';
  if (host.includes('youtube.com')) return 'youtube';
  return displayLink || null;
}
