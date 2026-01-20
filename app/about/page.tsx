import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | BiteReserve',
  description: 'Learn about BiteReserve and our mission to help restaurants track demand and grow their business.',
  openGraph: {
    title: 'About Us | BiteReserve',
    description: 'Learn about BiteReserve and our mission to help restaurants track demand and grow their business.',
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
    title: 'About Us | BiteReserve',
    description: 'Learn about BiteReserve and our mission to help restaurants track demand and grow their business.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
}

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-white to-accent-50/30"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Driven by Passion
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-8 text-gray-700 leading-relaxed">
                <p className="text-xl md:text-2xl font-semibold text-gray-900">
                  Founded to help hospitality businesses grow without losing focus.
                </p>
                
                <div className="space-y-6 text-lg">
                  <p>
                    After years of working in hospitality, we noticed a recurring challenge: great businesses struggling, not because of quality—but because digital visibility was overwhelming.
                  </p>
                  
                  <p>
                    The problem wasn't the food, the service, or the experience. It was the complexity of tracking where guests come from, understanding which marketing channels work, and making data-driven decisions without getting lost in analytics.
                  </p>
                  
                  <p className="text-xl font-semibold text-gray-900 pt-4">
                    We love the data, systems, and strategy behind growth.
                  </p>
                  
                  <p className="text-xl font-semibold text-gray-900">
                    You love hospitality.
                  </p>
                  
                  <p className="text-xl font-semibold text-gray-900 pb-4">
                    Together, that's where growth happens.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  BiteReserve is a demand-tracking platform designed to capture high-intent diners at the moment of decision. We don't manage bookings—we help restaurants understand where their guests come from.
                </p>
                <p>
                  By tracking every click, call, and reservation request, restaurants can see which marketing channels drive real results. No guesswork. No complexity. Just clear insights that help you focus on what matters: great hospitality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-xl p-6 md:p-8 border border-accent-100">
                <div className="w-12 h-12 bg-accent-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Data-Driven</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every decision should be backed by real insights. We make tracking simple so you can focus on what works.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 md:p-8 border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Simple & Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  No complex dashboards or overwhelming features. Just the tools you need to track demand and grow.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 md:p-8 border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Restaurant-Focused</h3>
                <p className="text-gray-600 leading-relaxed">
                  Built by people who understand hospitality. We solve real problems, not theoretical ones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to see where your guests come from?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Claim your restaurant page and start tracking demand today.
            </p>
            <Link
              href="/claim"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent-600 font-bold rounded-xl hover:bg-accent-50 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Claim Your Restaurant
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
