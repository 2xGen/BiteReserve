'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Created!</h1>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You can now claim your restaurant and start tracking bookings.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-accent-600 hover:bg-accent-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
