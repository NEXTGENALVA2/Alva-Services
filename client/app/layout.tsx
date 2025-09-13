import '../styles/globals.css';
import { getPixelSettings } from '../lib/pixel';
import type { Metadata } from 'next';
import { CartProvider } from '../components/CartContext';
import { ThemeProvider } from '../components/ThemeContext';
import { RegionProvider } from '@/components/RegionContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcommerceSaaS - ১০ সেকেন্ডে ই-কমার্স ওয়েবসাইট',
  description: 'সাবস্ক্রিপশন ভিত্তিক ই-কমার্স ওয়েবসাইট বিল্ডার। এআই চ্যাটবট, পেমেন্ট গেটওয়ে সহ।',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pixelSettings = await getPixelSettings();
  // Dynamically import Chatbot to avoid SSR issues
  const Chatbot = (await import('../components/Chatbot')).default;
  // You may want to fetch websiteId from context, props, or session
  const websiteId = '00b13a6a-9cd4-4476-85ca-ec4b666af26b'; // Use actual websiteId from logs
  return (
    <html lang="en">
      <head>
        {/* ...existing code... */}
      </head>
      <body className={inter.className}>
        <RegionProvider>
          <CartProvider>
            <ThemeProvider>
              {children}
              <Chatbot websiteId={websiteId} />
            </ThemeProvider>
          </CartProvider>
        </RegionProvider>
      </body>
    </html>
  );
}
