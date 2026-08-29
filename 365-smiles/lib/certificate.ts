/**
 * Centralized certificate generation service.
 * Single source of truth for all certificate-related operations.
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { promises as fs } from 'fs';
import path from 'path';

export type CertificateType = 'education' | 'medical-support' | 'daily-needs' | 'default';

const TEMPLATE_MAP: Record<CertificateType, string> = {
  education: 'certi-2.pdf',
  'medical-support': 'certi-3.pdf',
  'daily-needs': 'certi-4.pdf',
  default: 'certi-1.pdf',
};

const NAME_COORDS = { x: 412, y: 306, size: 40 };

/**
 * Generate a PDF certificate buffer for the given donor name and type.
 */
export async function generateCertificate(
  name: string,
  type: CertificateType = 'default'
): Promise<Buffer> {
  const templateFile = TEMPLATE_MAP[type] || TEMPLATE_MAP.default;
  const filePath = path.join(process.cwd(), 'public', templateFile);

  let existingPdfBytes: Uint8Array;
  try {
    existingPdfBytes = await fs.readFile(filePath);
  } catch {
    // Fallback to default template
    existingPdfBytes = await fs.readFile(
      path.join(process.cwd(), 'public', TEMPLATE_MAP.default)
    );
  }

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const [page] = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const safeName = name.replace(/\s+/g, ' ').trim();

  page.drawText(safeName, {
    x: NAME_COORDS.x,
    y: NAME_COORDS.y,
    size: NAME_COORDS.size,
    font,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Build a type-specific email message for the certificate.
 */
export function buildCertificateEmail(
  name: string,
  amount: number,
  type: CertificateType
): { subject: string; text: string } {
  let emailText = `Dear ${name},\n\nThank you for your generous donation of ₹${amount} to 365 Smiles.\n`;
  let subject = 'Your 365 Smiles Certificate of Appreciation';

  switch (type) {
    case 'education':
      subject = 'Your 365 Smiles Education Donation Certificate';
      emailText +=
        'Your contribution empowers education — supporting scholarships, learning materials, and mentoring for children in need.\n';
      break;
    case 'medical-support':
      subject = 'Your 365 Smiles Medical Support Certificate';
      emailText +=
        'Your gift provides essential medical care, medicines, and emergency support to families in crisis.\n';
      break;
    case 'daily-needs':
      subject = 'Your 365 Smiles Daily Needs Certificate';
      emailText +=
        'Your donation supplies daily essentials — food, hygiene kits, and relief for vulnerable households.\n';
      break;
    default:
      emailText += 'Please find your certificate attached.\n';
  }

  emailText += '\nWarm regards,\n365 Smiles Team';
  return { subject, text: emailText };
}
