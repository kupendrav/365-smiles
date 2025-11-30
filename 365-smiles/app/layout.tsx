import './globals.css';
import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: '365 Smiles',
  description: 'Donate your birthday. Feed lives.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
      </head>
      <body className="font-sans antialiased bg-black text-white mobile-safe-pad">
        {children}
        <Analytics />
      </body>
    </html>
  );
}