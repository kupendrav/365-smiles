import { NextRequest } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { emergencyRequestSchema, emergencyApproveSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth } from '@/lib/auth';
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response';

export const runtime = 'nodejs';

async function parseForm(req: NextRequest) {
  const formData = await req.formData();
  const raw = {
    name: formData.get('name')?.toString().trim() || '',
    address: formData.get('address')?.toString().trim() || '',
    fundsFor: formData.get('fundsFor')?.toString().trim() || '',
    amount: formData.get('amount')?.toString().trim() || '',
    mobile: formData.get('mobile')?.toString().trim() || '',
    accountNumber: formData.get('accountNumber')?.toString().trim() || '',
    ifsc: formData.get('ifsc')?.toString().trim() || '',
  };

  const parsed = emergencyRequestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join('; '));
  }

  const photo = formData.get('photo');
  return { ...parsed.data, photo };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.allowed) return apiRateLimited(rl.retryAfter!);

    const { name, address, fundsFor, amount, mobile, accountNumber, ifsc, photo } =
      await parseForm(req);

    const admin = getSupabaseAdmin();

    let photoUrl: string | null = null;
    if (photo && photo instanceof File) {
      const buf = Buffer.from(await photo.arrayBuffer());
      const ext = photo.name.split('.').pop() || 'png';
      const objectName = `emergency/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await admin.storage
        .from('donation-screenshots')
        .upload(objectName, buf, { contentType: photo.type });
      if (!error) {
        const { data: pub } = admin.storage
          .from('donation-screenshots')
          .getPublicUrl(data.path);
        photoUrl = pub?.publicUrl || null;
      }
    }

    const { error: insertErr } = await admin.from('emergency_requests').insert({
      name,
      address,
      funds_for: fundsFor,
      amount,
      mobile,
      account_number: accountNumber,
      ifsc,
      photo_url: photoUrl,
      approved: false,
    });

    if (insertErr) throw new Error(insertErr.message);

    return apiSuccess();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return apiError(msg, 400);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');

    if (all) {
      // Admin-only: return all requests including unapproved
      const authResponse = await requireAdminAuth();
      if (authResponse) return authResponse;

      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from('emergency_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return apiSuccess({ data });
    }

    // Public: only approved requests
    const { data, error } = await supabase
      .from('emergency_requests')
      .select('id,name,funds_for,amount,photo_url,address,mobile')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw new Error(error.message);
    return apiSuccess({ data });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return apiError(msg, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Admin-only
    const authResponse = await requireAdminAuth();
    if (authResponse) return authResponse;

    const body = await req.json();
    const parsed = emergencyApproveSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('emergency_requests')
      .update({ approved: parsed.data.approved })
      .eq('id', parsed.data.id);

    if (error) throw new Error(error.message);
    return apiSuccess();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return apiError(msg, 400);
  }
}
