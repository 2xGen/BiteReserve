import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim Successful | BiteReserve',
  description: 'Your restaurant claim has been submitted successfully. Your 14-day trial will start after verification.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ClaimSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
