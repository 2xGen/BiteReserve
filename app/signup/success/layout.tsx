import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Created | BiteReserve',
  description: 'Your BiteReserve account has been created successfully.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignUpSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
