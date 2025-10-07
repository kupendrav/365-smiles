import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const base64Template = 'JVBERi0xLjcKJcfs...'; // base64 string of your PDF

export async function generateCertificate(name: string): Promise<Uint8Array> {
  const existingPdfBytes = Uint8Array.from(Buffer.from(base64Template, 'base64'));

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const firstPage = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  firstPage.drawText(name, { x: 200, y: 300, size: 50, font, color: rgb(1, 1, 1) });

  return pdfDoc.save();
}
