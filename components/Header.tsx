'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="text-lg sm:text-xl font-bold text-accent-600 hover:text-accent-700 transition-colors">
            BiteReserve
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              About
            </Link>
            <a
              href="https://2xgen.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              For Restaurants
            </a>
            {!loading && (
              user ? (
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </Link>
              )
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-lg">
            <nav className="flex flex-col py-3">
              <Link 
                href="/about" 
                className="px-4 py-3 text-base font-medium text-gray-700 hover:text-accent-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <a
                href="https://2xgen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-base font-medium text-gray-700 hover:text-accent-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                For Restaurants
              </a>
              <div className="border-t border-gray-100 mt-2 pt-2 space-y-2">
                {!loading && (
                  user ? (
                    <Link 
                      href="/dashboard" 
                      className="mx-4 my-2 flex items-center justify-center gap-2 px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      href="/login" 
                      className="mx-4 my-2 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-xl transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  )
                )}
                <Link 
                  href="/claim" 
                  className="mx-4 my-2 flex items-center justify-center gap-2 px-4 py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Claim Your Restaurant
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
