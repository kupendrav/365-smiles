import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logDonationSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth } from '@/lib/auth';
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    // Auth check (Issue #1)
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.allowed) return apiRateLimited(rl.retryAfter!);

    const body = await req.json();
    const parsed = logDonationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    const { homeName, amount, date, notes } = parsed.data;

    const { error } = await supabase.from('donation-logs').insert({
      home_name: homeName,
      amount,
      date,
      notes: notes || null,
    });

    if (error) throw new Error(error.message);

    return apiSuccess();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ERROR] Log Donation:', errorMessage);
    return apiError(errorMessage, 500);
  }
}
