import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'La Terrazza del Mare - Live Demo | BiteReserve',
  description: 'Experience a live demo of a BiteReserve restaurant page. See how tracking works for page views, phone clicks, directions, and reservation requests.',
}

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
