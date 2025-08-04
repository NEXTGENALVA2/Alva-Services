import '../styles/globals.css'
import type { Metadata } from 'next'

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
    <html lang="bn">
      <body>{children}</body>
    </html>
  )
}
