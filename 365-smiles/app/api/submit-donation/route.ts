export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Your typed Supabase client instance
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";
import { promises as fs } from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY!);

async function parseMultipartForm(req: NextRequest) {
  const formData = await req.formData();

  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const amountStr = formData.get("amount")?.toString() || "";
  const date = formData.get("date")?.toString() || "";
  const refId = formData.get("refId")?.toString() || "";
  const file = formData.get("file");

  if (!name || !email || !amountStr || !date) {
    throw new Error("Missing required fields");
  }

  if (!file || !(file instanceof File)) {
    throw new Error("Missing or invalid file upload");
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  return { name, email, amount, date, refId, file };
}

async function generateCertificateBuffer(name: string) {
  const filePath = path.join(process.cwd(), 'public', 'certi-1.pdf');
  const existingPdfBytes = await fs.readFile(filePath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  page.drawText(name, {
    x: 412,
    y: 306,
    size: 40,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, amount, date, refId, file } = await parseMultipartForm(req);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() ?? "png";
    const fileName = `screenshots/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("donation-screenshots")
      .upload(fileName, fileBuffer, { contentType: file.type });

    if (uploadErr) {
      throw new Error("File upload failed: " + uploadErr.message);
    }

    const { data: publicUrlData } = supabase.storage
      .from("donation-screenshots")
      .getPublicUrl(uploadData.path);
    const screenshotUrl = publicUrlData?.publicUrl ?? null;

    const { error: dbError } = await supabase.from("donations").insert({
      name,
      email,
      amount,
      date,
      ref_id: refId || null,
      screenshot: screenshotUrl,
    });
    if (dbError) {
      throw new Error("Database insert failed: " + dbError.message);
    }

    const certBuffer = await generateCertificateBuffer(name);

    await resend.emails.send({
      from: "365 Smiles <onboarding@resend.dev>",
      to: email,
      subject: "🎉 Your 365 Smiles Certificate of Appreciation",
      text: `Hi ${name},\n\nThank you for your generous donation of ₹${amount} to 365 Smiles Education Fund.\nPlease find your certificate attached.\n\nWarm regards,\n365 Smiles Team`,
      attachments: [
        {
          filename: `${name}-certificate.pdf`,
          content: certBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error("Donation submission error:", error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
