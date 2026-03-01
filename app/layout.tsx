import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/next'
import { ToastContainer } from '@/components/Toast'
import HoldPage from '@/components/HoldPage'

// Default to hold page (Supabase disabled). Set NEXT_PUBLIC_HOLD_MODE=false in Vercel when resuming.
const HOLD_MODE = process.env.NEXT_PUBLIC_HOLD_MODE !== 'false'

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
  if (HOLD_MODE) {
    return (
      <html lang="en">
        <body>
          <HoldPage />
        </body>
      </html>
    )
  }
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <ToastContainer />
        <Analytics />
      </body>
    </html>
  )
}
