import '../styles/globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '../components/CartContext';
import { ThemeProvider } from '../components/ThemeContext';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EcommerceSaaS - ১০ সেকেন্ডে ই-কমার্স ওয়েবসাইট',
  description: 'সাবস্ক্রিপশন ভিত্তিক ই-কমার্স ওয়েবসাইট বিল্ডার। এআই চ্যাটবট, পেমেন্ট গেটওয়ে সহ।',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
