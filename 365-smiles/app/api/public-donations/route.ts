import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { publicDonationSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError, apiRateLimited } from '@/lib/api-response';
import {
  generateCertificate,
  buildCertificateEmail,
  type CertificateType,
} from '@/lib/certificate';

export const runtime = 'nodejs';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = checkRateLimit(ip);
    if (!rl.allowed) return apiRateLimited(rl.retryAfter!);

    const formData = await req.formData();

    const name = formData.get('name')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const amountStr = formData.get('amount')?.toString() || '';
    const message = formData.get('message')?.toString() || '';
    const type = formData.get('type')?.toString() || '';
    const date = formData.get('date')?.toString() || '';
    const file = formData.get('file');

    // Validate
    const parsed = publicDonationSchema.safeParse({
      name,
      email,
      amount: amountStr,
      message,
      date,
      type,
    });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues.map((i) => i.message).join('; '),
        400
      );
    }

    if (!file || !(file instanceof File)) {
      return apiError('Missing or invalid file upload', 400);
    }

    const { name: validName, email: validEmail, amount, message: validMessage } = parsed.data;
    const validType = (parsed.data.type || '') as string;

    // Duplicate guard: check (name, email, amount) within 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('public-donations')
      .select('id')
      .gte('created_at', fiveMinutesAgo)
      .eq('name', validName)
      .eq('amount', amount)
      .limit(1);

    if (existing && existing.length > 0) {
      return apiSuccess({ skipped: true, reason: 'Duplicate recent donation suppressed' });
    }

    // Upload screenshot
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'png';
    const objectName = `screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('donation-screenshots')
      .upload(objectName, buffer, { contentType: file.type });

    if (uploadErr) {
      throw new Error('File upload failed: ' + uploadErr.message);
    }

    const { data: publicUrl } = supabase.storage
      .from('donation-screenshots')
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrl?.publicUrl || null;

    // Insert into public-donations
    const { error: insertErr } = await supabase.from('public-donations').insert({
      name: validName,
      amount,
      message: validMessage || null,
      image_url: imageUrl,
    });

    if (insertErr) {
      throw new Error('Database insert failed: ' + insertErr.message);
    }

    // Generate and email certificate
    try {
      const certType: CertificateType =
        validType && ['education', 'medical-support', 'daily-needs'].includes(validType)
          ? (validType as CertificateType)
          : 'default';

      const certBuffer = await generateCertificate(validName, certType);
      const { subject, text } = buildCertificateEmail(validName, amount, certType);

      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL || '365 Smiles <onboarding@resend.dev>',
        to: validEmail,
        subject,
        text,
        attachments: [
          {
            filename: `${validName}-certificate.pdf`,
            content: certBuffer,
          },
        ],
      });
    } catch (emailErr) {
      console.error('Certificate email failed (donation still saved):', emailErr);
    }

    return apiSuccess();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Donation error:', err);
    return apiError(errorMessage, 500);
  }
}
