export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { donationSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response';
import { generateCertificate, buildCertificateEmail } from '@/lib/certificate';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

async function parseMultipartForm(req: NextRequest) {
  const formData = await req.formData();

  const name = formData.get('name')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const amountStr = formData.get('amount')?.toString() || '';
  const date = formData.get('date')?.toString() || '';
  const refId = formData.get('refId')?.toString() || '';
  const file = formData.get('file');

  // Validate with zod
  const parsed = donationSchema.safeParse({ name, email, amount: amountStr, date, refId });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join('; '));
  }

  if (!file || !(file instanceof File)) {
    throw new Error('Missing or invalid file upload');
  }

  return {
    name: parsed.data.name,
    email: parsed.data.email,
    amount: parsed.data.amount,
    date: parsed.data.date || '',
    refId: parsed.data.refId || '',
    file,
  };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.allowed) return apiRateLimited(rl.retryAfter!);

    const { name, email, amount, date, refId, file } = await parseMultipartForm(req);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() ?? 'png';
    const fileName = `screenshots/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('donation-screenshots')
      .upload(fileName, fileBuffer, { contentType: file.type });

    if (uploadErr) {
      throw new Error('File upload failed: ' + uploadErr.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from('donation-screenshots')
      .getPublicUrl(uploadData.path);
    const screenshotUrl = publicUrlData?.publicUrl ?? null;

    const { error: dbError } = await supabase.from('donations').insert({
      name,
      email,
      amount,
      date: date || null,
      ref_id: refId || null,
      screenshot: screenshotUrl,
    });
    if (dbError) {
      throw new Error('Database insert failed: ' + dbError.message);
    }

    // Generate and email certificate
    try {
      const certBuffer = await generateCertificate(name, 'default');
      const { subject, text } = buildCertificateEmail(name, amount, 'default');

      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || '365 Smiles <onboarding@resend.dev>',
        to: email,
        subject,
        text,
        attachments: [
          {
            filename: `${name}-certificate.pdf`,
            content: certBuffer,
          },
        ],
      });
    } catch (emailErr) {
      console.error('Certificate email failed (donation still saved):', emailErr);
    }

    return apiSuccess();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Donation submission error:', error);
    return apiError(errorMessage, 500);
  }
}
