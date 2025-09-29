import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Insights - Fundraising Analytics Dashboard',
  description: 'A comprehensive fundraising analytics dashboard that transforms raw phpMySQL database data into actionable insights for nonprofit decision-making.',
  keywords: ['fundraising', 'analytics', 'nonprofit', 'dashboard', 'insights'],
  authors: [{ name: 'Insights Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Insights - Fundraising Analytics Dashboard',
    description: 'Transform your fundraising data into actionable insights',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={inter.variable}>
      <body className={`${inter.className} font-inter antialiased`}>
        <ErrorBoundary>
          <div id='root'>
            {children}
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}