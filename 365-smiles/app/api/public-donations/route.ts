import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

// Paths and text placement — adjust NAME_COORDS to your template
const CERT_PATH = path.join(process.cwd(), "public", "certi.pdf");
const FONT_PATH = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const NAME_COORDS = { x: 100, y: 265, size: 40 };

type ParsedForm = {
  name: string;
  email: string;
  amount: number;
  message: string;
  date?: string;
  file: File;
};

async function parseForm(req: NextRequest): Promise<ParsedForm> {
  const formData = await req.formData();

  const name = formData.get("name")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const amountStr = formData.get("amount")?.toString() || "";
  const message = formData.get("message")?.toString() || "";
  const date = formData.get("date")?.toString() || "";
  const file = formData.get("file");

  if (!name || !email || !amountStr || !file || !(file instanceof File)) {
    throw new Error("Missing required fields");
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  return { name, email, amount, message, date, file };
}

async function generateCertificateFromTemplate(donorName: string): Promise<Uint8Array> {
  // Load your certificate template
  const templateBytes = await fs.readFile(CERT_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);

  // Register fontkit and embed a Unicode-capable font (supports ₹ and multilingual names)
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = await fs.readFile(FONT_PATH);
  const customFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const page = pdfDoc.getPages()[0];
  page.drawText(donorName, {
    x: NAME_COORDS.x,
    y: NAME_COORDS.y,
    size: NAME_COORDS.size,
    font: customFont,
    color: rgb(212 / 255, 175 / 255, 55 / 255)
  });

  return pdfDoc.save();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, amount, message, file } = await parseForm(req);

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

    // Generate personalized certificate
    const certBytes = await generateCertificateFromTemplate(name);
    const certBuffer = Buffer.from(certBytes);

    // Email the certificate to donor
    await resend.emails.send({
      from: "365 Smiles <onboarding@resend.dev>",
      to: email,
      subject: "Your 365 Smiles Certificate of Appreciation",
      text: `Dear ${name},\n\nThank you for your generous donation of ₹${amount} to 365 Smiles.\nPlease find your certificate attached.\n\nWarm regards,\n365 Smiles Team`,
      attachments: [
        {
          filename: `${name}-certificate.pdf`,
          content: certBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Donation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
