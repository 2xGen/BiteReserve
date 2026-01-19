import type { Metadata } from 'next'
import React from 'react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  // In a real app, you'd fetch restaurant data here
  const restaurantName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    title: `Reservation Request - ${restaurantName} | BiteReserve`,
    description: 'Request a table reservation at this restaurant through BiteReserve.',
  }
}

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
