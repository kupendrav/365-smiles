import './globals.css';
import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';

export const metadata = {
  title: '365 Smiles – Donate Birthdays, Feed Lives',
  description:
    'Support orphans, elders, and differently-abled people through 365 Smiles Foundation. Sponsor a day, donate for education, daily needs, and medical support across India.',
  keywords: [
    'donation',
    'charity',
    'India',
    'orphans',
    'elderly',
    'education',
    'medical support',
    '365 Smiles',
  ],
  openGraph: {
    title: '365 Smiles – Donate Birthdays, Feed Lives',
    description:
      'Support orphans, elders, and differently-abled people—365 days a year.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
      </head>
      <body className="font-sans antialiased bg-black text-white mobile-safe-pad">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
