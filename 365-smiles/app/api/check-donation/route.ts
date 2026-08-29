import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiSuccess({ exists: false });
    }

    const { data, error } = await supabase
      .from('donations')
      .select('name')
      .eq('date', date)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('check-donation error:', error);
      return apiSuccess({ exists: false });
    }

    if (data) {
      return apiSuccess({ exists: true, donorName: data.name, date });
    }

    return apiSuccess({ exists: false });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}
