import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim Your Restaurant - Free | BiteReserve',
  description: 'Claim your restaurant listing on BiteReserve for free. Get your own tracking page and start seeing where your bookings come from. Free plan available, or start a 14-day Pro trial.',
  keywords: 'claim restaurant, restaurant listing, free restaurant page, restaurant analytics, booking tracking',
  openGraph: {
    title: 'Claim Your Restaurant - Free | BiteReserve',
    description: 'Claim your restaurant listing on BiteReserve for free. Get your own tracking page and start seeing where your bookings come from.',
    type: 'website',
    url: 'https://bitereserve.com/claim',
    images: [
      {
        url: 'https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png',
        width: 1200,
        height: 630,
        alt: 'BiteReserve - Claim Your Restaurant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claim Your Restaurant - Free | BiteReserve',
    description: 'Claim your restaurant listing on BiteReserve for free. Get your own tracking page and start seeing where your bookings come from.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
