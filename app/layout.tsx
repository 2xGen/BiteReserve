import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'BiteReserve - Reserve Your Table In Seconds',
  description: 'Connect directly with restaurants. Send reservation requests instantly and receive confirmations from the venue. No browsing. No waitlists. Just direct communication.',
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
