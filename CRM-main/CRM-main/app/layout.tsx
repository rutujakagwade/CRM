import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientProviders from './client-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Pro - Complete Business Management',
  description: 'Manage your contacts, companies, and opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
