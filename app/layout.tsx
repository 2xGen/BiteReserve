import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'BiteReserve - Reserve Your Table In Seconds',
  description: 'Connect directly with restaurants. Send reservation requests instantly and receive confirmations from the venue. No browsing. No waitlists. Just direct communication.',
  openGraph: {
    title: 'BiteReserve - Reserve Your Table In Seconds',
    description: 'Connect directly with restaurants. Send reservation requests instantly and receive confirmations from the venue. No browsing. No waitlists. Just direct communication.',
    type: 'website',
    images: [
      {
        url: 'https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png',
        width: 1200,
        height: 630,
        alt: 'BiteReserve',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BiteReserve - Reserve Your Table In Seconds',
    description: 'Connect directly with restaurants. Send reservation requests instantly and receive confirmations from the venue.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
