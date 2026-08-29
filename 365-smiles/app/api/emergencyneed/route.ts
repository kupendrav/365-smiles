import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';
import { z } from 'zod';

const insertSchema = z.object({
  title: z.string().trim().min(1).max(500),
  source_url: z.string().trim().url(),
  platform: z.string().trim().max(100).optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  read: z.boolean(),
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('emergency_needs')
      .select('id, title, source_url, platform, created_at, read')
      .order('created_at', { ascending: false });

    if (error) {
      return apiSuccess({ data: [] });
    }
    return apiSuccess({ data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    const body = await request.json();
    const parsed = insertSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    const { title, source_url, platform } = parsed.data;

    const { data, error } = await supabase
      .from('emergency_needs')
      .insert({ title, source_url, platform: platform || 'web', read: false })
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }
    return apiSuccess({ data }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    const { data, error } = await supabase
      .from('emergency_needs')
      .update({ read: parsed.data.read })
      .eq('id', parsed.data.id)
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }
    return apiSuccess({ data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

export async function PUT() {
  try {
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    const { error } = await supabase
      .from('emergency_needs')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      return apiError(error.message, 500);
    }
    return apiSuccess();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return apiError(msg, 500);
  }
}
