import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-medium transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="bg-white rounded-xl shadow-soft p-8 md:p-10 border border-gray-100">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About BiteReserve
            </h1>
            
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              BiteReserve is a reservation request and demand-tracking platform for restaurants, designed to capture high-intent diners at the moment of decision.
            </p>
            
            <div className="space-y-8 text-gray-700">
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  What We Do
                </h2>
                <p className="leading-relaxed">
                  BiteReserve captures high-intent reservation requests from travelers who have already decided where they want to dine. We don't manage bookings—instead, we facilitate the connection between diners and restaurants, allowing restaurants to respond directly to reservation requests.
                </p>
              </div>
              
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  How We Work
                </h2>
                <p className="leading-relaxed">
                  BiteReserve works with partner platforms like TopTours.ai, where travelers discover restaurants. When a traveler is ready to make a reservation, they use BiteReserve to send their request. This approach ensures we're capturing demand at the moment of decision, not during the browsing phase.
                </p>
              </div>
              
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Part of the 2xGen Ecosystem
                </h2>
                <p className="leading-relaxed">
                  BiteReserve is part of the 2xGen ecosystem, working alongside platforms like TopTours.ai to provide a complete solution for restaurant discovery and reservation management. Our focus is on conversion, not discovery—we're the action layer that captures high-intent diners.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  Our Positioning
                </h2>
                <p className="leading-relaxed">
                  BiteReserve is a conversion tool. We don't offer browsing, filtering, or comparisons. We provide a simple, focused experience for travelers who know where they want to dine and are ready to request a table.
                </p>
              </div>
            </div>
            
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <a
                href="https://2xgen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg hover:shadow-xl"
              >
                Partner with 2xGen
              </a>
              
              <a
                href="https://toptours.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-base font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
              >
                Explore TopTours.ai
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
