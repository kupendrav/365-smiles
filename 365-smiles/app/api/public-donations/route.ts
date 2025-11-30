import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Text placement + template paths
const NAME_COORDS = { x: 412, y: 306, size: 40 };
const TEMPLATE_MAP: Record<string, string> = {
  "education": path.join(process.cwd(), "public", "certi-2.pdf"),
  "medical-support": path.join(process.cwd(), "public", "certi-3.pdf"),
  "daily-needs": path.join(process.cwd(), "public", "certi-4.pdf"),
};

type ParsedForm = {
  name: string;
  email: string;
  amount: number;
  message: string;
  date?: string;
  file: File;
};

async function parseForm(req: NextRequest): Promise<ParsedForm & { type?: string }> {
  const formData = await req.formData();

  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const amountStr = formData.get("amount")?.toString() || "";
  const message = formData.get("message")?.toString() || "";
  const type = formData.get("type")?.toString() || "";
  const date = formData.get("date")?.toString() || "";
  const file = formData.get("file");

  if (!name || !email || !amountStr || !file || !(file instanceof File)) {
    throw new Error("Missing required fields");
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  return { name, email, amount, message, date, file, type };
}

// Certificate generation performed inline in POST handler using selected template
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseForm(req);
    const { name, email, amount, message, file, type } = parsed;

    // Upload screenshot to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "png";
    const objectName = `screenshots/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("donation-screenshots")
      .upload(objectName, buffer, { contentType: file.type });

    if (uploadErr) {
      throw new Error("File upload failed: " + uploadErr.message);
    }

    const { data: publicUrl } = supabase.storage
      .from("donation-screenshots")
      .getPublicUrl(uploadData.path);

    const imageUrl = publicUrl?.publicUrl || null;

    // Insert into public-donations with only defined columns
    const { error: insertErr } = await supabase.from("public-donations").insert({
      name,
      amount,
      message: message || null,
      image_url: imageUrl,
    });

    if (insertErr) {
      throw new Error("Database insert failed: " + insertErr.message);
    }

    const resolvedType = (type && type in TEMPLATE_MAP) ? type : "education";
    const certPath = TEMPLATE_MAP[resolvedType] || path.join(process.cwd(), "public", "certi-1.pdf");

    const templateBytes = await fs.readFile(certPath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const [page] = pdfDoc.getPages();
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    const safeName = name.replace(/\s+/g, " ").trim();
    page.drawText(safeName, {
      x: NAME_COORDS.x,
      y: NAME_COORDS.y,
      size: NAME_COORDS.size,
      font: timesFont,
      color: rgb(0, 0, 0),
    });

    const certBytes = await pdfDoc.save();
    const certBuffer = Buffer.from(certBytes);

    // Email the certificate to donor
    // Build type-specific email message
    let emailText = `Dear ${name},\n\nThank you for your generous donation of ₹${amount} to 365 Smiles.\n`;
    let subject = "Your 365 Smiles Certificate of Appreciation";
    if (resolvedType === "education") {
      subject = "Your 365 Smiles Education Donation Certificate";
      emailText += "Your contribution empowers education — supporting scholarships, learning materials, and mentoring for children in need.\n";
    } else if (resolvedType === "medical-support") {
      subject = "Your 365 Smiles Medical Support Certificate";
      emailText += "Your gift provides essential medical care, medicines, and emergency support to families in crisis.\n";
    } else if (resolvedType === "daily-needs") {
      subject = "Your 365 Smiles Daily Needs Certificate";
      emailText += "Your donation supplies daily essentials — food, hygiene kits, and relief for vulnerable households.\n";
    } else {
      emailText += "Please find your certificate attached.\n";
    }
    emailText += "\nWarm regards,\n365 Smiles Team";

    await resend.emails.send({
      from: "365 Smiles <onboarding@resend.dev>",
      to: email,
      subject,
      text: emailText,
      attachments: [
        {
          filename: `${name}-certificate.pdf`,
          content: certBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: Error | unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error("Donation error:", err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
