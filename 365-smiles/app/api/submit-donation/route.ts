
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateCertificate } from '@/lib/generateCertificate';
import { Resend } from 'resend';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
    try {
      const formData = await req.formData();
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const amount = formData.get('amount') as string;
      const refId = formData.get('refId') as string;
      const file = formData.get('file') as File | null;
  
      console.log({ name, email, amount, refId });
  
      let screenshotUrl = null;
  
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
  
        // ✅ Upload to Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('donation-screenshots')
          .upload(`screenshots/${Date.now()}-${file.name}`, buffer, {
            contentType: file.type,
          });
  
        if (uploadError) throw new Error('Supabase upload failed: ' + uploadError.message);
  
        const { data: publicUrlData } = supabase.storage
          .from('donation-screenshots')
          .getPublicUrl(uploadData.path);
  
        screenshotUrl = publicUrlData?.publicUrl || null;
      }
  
      // ✅ Save to DB
      const { error: dbError } = await supabase.from('donations').insert({
        name,
        email,
        amount,
        ref_id: refId,
        screenshot: screenshotUrl,
      });
  
      if (dbError) throw new Error('Database insert failed: ' + dbError.message);
  
      // ✅ Generate cert
      const tempDir = path.join(process.cwd(), 'tmp');
      await fs.promises.mkdir(tempDir, { recursive: true });
      const pdfBytes = await generateCertificate(name);
      const certPath = path.join(tempDir, `${name}-certi.pdf`);
      await fs.promises.writeFile(certPath, pdfBytes);
      
  
      // ✅ Send email
      const buffer = Buffer.from(pdfBytes);
      const emailResult = await resend.emails.send({
        from: '365 Smiles <onboarding@resend.dev>', // ✅ Safe dev sender
        to: email,
        subject: '🎉 Your 365 Smiles Certificate of Appreciation',
        text: `Hi ${name},\n\nThank you for choosing to celebrate your special day by spreading kindness and smiles.\n\nYour generosity has made a difference in someone’s life today.\n\nWarm wishes,\nTeam 365 Smiles`,

        attachments: [
          {
            filename: `${name}-certificate.pdf`,
            content: buffer,
          },
        ],
        
      });
      console.log('📬 Resend response:', emailResult);      
      
  
      return NextResponse.json({ success: true });
  
    } catch (error: any) {
      console.error('[SERVER ERROR] /api/submit-donation:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Internal server error' },
        { status: 500 }
      );
    }
  }
  
