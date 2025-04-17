import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: '365 Smiles',
  description: 'Donate your birthday. Feed lives.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}