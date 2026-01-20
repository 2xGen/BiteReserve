import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Restaurant Details | BiteReserve',
  description: 'Complete your restaurant information to finish setting up your BiteReserve page.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClaimCompleteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
