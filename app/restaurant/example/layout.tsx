import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'La Terrazza del Mare - Live Demo | BiteReserve',
  description: 'Experience a live demo of a BiteReserve restaurant page. See how tracking works for page views, phone clicks, directions, and reservation requests.',
  openGraph: {
    title: 'La Terrazza del Mare - Live Demo | BiteReserve',
    description: 'Experience a live demo of a BiteReserve restaurant page. See how tracking works for page views, phone clicks, directions, and reservation requests.',
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
    title: 'La Terrazza del Mare - Live Demo | BiteReserve',
    description: 'Experience a live demo of a BiteReserve restaurant page.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
}

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
