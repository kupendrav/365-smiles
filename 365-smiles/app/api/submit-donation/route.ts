export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Your typed Supabase client instance
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";

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

async function generateCertificateBuffer(name: string, amount: number) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: rgb(0.97, 0.95, 0.91),
  });

  page.drawText("Certificate of Appreciation", {
    x: 50,
    y: 350,
    size: 30,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`This certifies that`, {
    x: 50,
    y: 310,
    size: 20,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(name, {
    x: 50,
    y: 280,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`has generously donated ${amount} Rupees to 365 Smiles.`, {
    x: 50,
    y: 250,
    size: 20,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText("Thank you for making an impact.", {
    x: 50,
    y: 210,
    size: 16,
    font: helveticaFont,
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

    const certBuffer = await generateCertificateBuffer(name, amount);

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
