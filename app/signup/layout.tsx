import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | BiteReserve',
  description: 'Create your free BiteReserve account to claim your restaurant and start tracking where your bookings come from.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign Up | BiteReserve',
    description: 'Create your free BiteReserve account to claim your restaurant and start tracking where your bookings come from.',
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
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
