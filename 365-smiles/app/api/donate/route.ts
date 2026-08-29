import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { donationSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.allowed) return apiRateLimited(rl.retryAfter!);

    const body = await req.json();
    const parsed = donationSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    const { name, email, amount, date } = parsed.data;

    const { error } = await supabase.from('donations').insert([
      { name, email, amount, date: date || null, status: 'pending' },
    ]);

    if (error) {
      console.error('Error saving donation:', error.message);
      return apiError(error.message, 500);
    }

    return apiSuccess();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}
