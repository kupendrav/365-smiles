import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

export async function generateCertificate(name: string): Promise<Uint8Array> {
    
    const certPath = path.join(process.cwd(), 'public', 'certi.pdf');
    const existingPdfBytes = await fs.readFile(certPath);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  firstPage.drawText(name, {
    x: 200,
    y: 300,
    size: 50,
    font,
    color: rgb(1, 1, 1),
  });

  return await pdfDoc.save();
}
