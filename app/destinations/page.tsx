import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// This is a light directory that only links to TopTours.ai
// It acts as a navigation bridge, not a browsing destination
// This page should NOT be indexed by search engines

export const metadata: Metadata = {
  title: 'Browse Destinations - BiteReserve',
  robots: {
    index: false,
    follow: false,
  },
}
const destinations = [
  { name: 'Aruba', slug: 'aruba' },
  { name: 'Paris', slug: 'paris' },
  { name: 'New York', slug: 'new-york' },
  { name: 'Tokyo', slug: 'tokyo' },
  { name: 'London', slug: 'london' },
  { name: 'Barcelona', slug: 'barcelona' },
  { name: 'Rome', slug: 'rome' },
  { name: 'Dubai', slug: 'dubai' },
  { name: 'Bali', slug: 'bali' },
  { name: 'Sydney', slug: 'sydney' },
]

export default function Destinations() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Destinations
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore restaurants in your destination on TopTours.ai
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-8 border border-gray-100 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {destinations.map((destination) => (
                <a
                  key={destination.slug}
                  href={`https://toptours.ai/${destination.slug}/restaurants`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-5 border-2 border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all text-center shadow-sm hover:shadow-md"
                >
                  <span className="text-gray-900 font-semibold group-hover:text-primary-700 transition-colors">
                    {destination.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <a
              href="https://toptours.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl"
            >
              Explore All Destinations on TopTours.ai
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
