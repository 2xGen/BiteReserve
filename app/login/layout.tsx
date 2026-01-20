import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | BiteReserve',
  description: 'Sign in to your BiteReserve account to access your restaurant dashboard and analytics.',
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: 'Sign In | BiteReserve',
    description: 'Sign in to your BiteReserve account to access your restaurant dashboard and analytics.',
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

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
