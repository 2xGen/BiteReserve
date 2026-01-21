import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BiteReserve - Track Where Your Restaurant Guests Come From',
  description: 'Clicks don\'t pay bills — guest actions do. Get your free BiteReserve page and start tracking where your guests come from. See which campaigns drive high-intent visits.',
  keywords: 'restaurant analytics, booking tracking, reservation analytics, restaurant marketing, campaign tracking, restaurant demand tracking',
  openGraph: {
    title: 'BiteReserve - Track Where Your Restaurant Guests Come From',
    description: 'Clicks don\'t pay bills — guest actions do. Get your free BiteReserve page and start tracking where your guests come from.',
    type: 'website',
    url: 'https://bitereserve.com',
    images: [
      {
        url: 'https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png',
        width: 1200,
        height: 630,
        alt: 'BiteReserve - Restaurant Booking Analytics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BiteReserve - Track Where Your Restaurant Guests Come From',
    description: 'Clicks don\'t pay bills — guest actions do. Get your free BiteReserve page and start tracking where your guests come from.',
    images: ['https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/og%20image.png'],
  },
  alternates: {
    canonical: 'https://bitereserve.com',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Sticky CTA Button - Mobile optimized */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50">
        <Link
          href="/claim"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 sm:py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl sm:rounded-full shadow-2xl hover:shadow-accent-500/25 transition-all duration-300 hover:scale-105 border-2 border-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="sm:hidden">Claim Your Restaurant — Free</span>
          <span className="hidden sm:inline">Claim Your Restaurant</span>
        </Link>
      </div>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden -mt-4">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600"></div>
          
          {/* Tech Grid Pattern - More Visible */}
          <div className="absolute inset-0 opacity-[0.15]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Diagonal Lines Pattern */}
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 36px)',
            }}></div>
          </div>
          
          {/* Animated Orbs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
          
          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.08]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Light Gradient Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_50%)]"></div>
          
          <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-8 md:py-10 text-center">
            {/* Floating accent orbs - hidden on mobile for cleaner look */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-float-gentle hidden sm:block"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-primary-900/20 rounded-full blur-3xl animate-float-gentle hidden sm:block" style={{animationDelay: '2s'}}></div>
            
            <div className="relative z-10">
              <h1 className="text-[2.5rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 sm:mb-4 leading-[1.08] sm:leading-[1.1] tracking-tight" style={{textShadow: '0 2px 20px rgba(0,0,0,0.3), 0 4px 40px rgba(0,0,0,0.2)'}}>
                <span className="block animate-fade-in-scale mb-0.5 sm:mb-1" style={{animationDelay: '0.1s'}}>
                  <span className="text-white/95">See </span>
                  <span className="text-primary-900 font-black" style={{textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>where</span>
                  <span className="text-white/95"> your</span>
                </span>
                <span className="block mb-0.5 sm:mb-1" style={{animationDelay: '0.3s', animationFillMode: 'backwards'}}>
                  <span className="text-white font-black animate-fade-in-scale">restaurant </span>
                  <span className="text-primary-900 font-black animate-fade-in-scale animate-underline-reveal inline-block relative" style={{animationDelay: '0.4s', textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>guests</span>
                </span>
                <span className="block animate-fade-in-scale" style={{animationDelay: '0.5s', animationFillMode: 'backwards'}}>
                  <span className="text-primary-900 font-black" style={{textShadow: '0 1px 3px rgba(0,0,0,0.2)'}}>come</span>
                  <span className="text-white/95"> from</span>
                </span>
              </h1>
              
              {/* Punchline - Clean & Bold */}
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6 animate-fade-in-scale" style={{animationDelay: '0.6s', animationFillMode: 'backwards', textShadow: '0 2px 15px rgba(0,0,0,0.4)'}}>
                Clicks don't pay bills — <span className="underline decoration-2 sm:decoration-4 decoration-white/50 underline-offset-4">guest actions do</span>.
              </p>
              
              <p className="text-base sm:text-xl md:text-2xl text-white/85 mb-5 sm:mb-6 max-w-6xl mx-auto leading-relaxed font-medium animate-fade-in-scale px-1" style={{animationDelay: '0.8s', animationFillMode: 'backwards', textShadow: '0 2px 12px rgba(0,0,0,0.3)'}}>
                Track calls, directions, clicks, and booking attempts — see who actually sends diners, all on one focused customizable page.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-5 animate-fade-in-scale" style={{animationDelay: '0.9s', animationFillMode: 'backwards'}}>
                <Link
                  href="/claim"
                  className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-3 bg-white text-accent-600 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10 flex items-center">
                    Claim Your Restaurant — Free
                    <svg className="w-5 h-5 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
                
                <Link
                  href="/restaurant/example"
                  className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-3 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white/20 hover:border-white/60 hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)]"
                >
                  <span className="relative z-10 flex items-center">
                    See It In Action
                    <svg className="w-5 h-5 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </Link>
              </div>
              
              {/* Trust signals - optimized for mobile */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-white/80 text-sm sm:text-lg animate-fade-in-scale" style={{animationDelay: '1.1s', animationFillMode: 'backwards'}}>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">No commissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Works with your system</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">5 min setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Banner - Mobile optimized */}
        <section className="py-8 sm:py-14 bg-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl hidden sm:block"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl hidden sm:block"></div>
          
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
              <div className="bg-white/5 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-0.5 sm:mb-1">47</div>
                <p className="text-primary-300 text-xs sm:text-sm">guests from hotel link</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-accent-400 mb-0.5 sm:mb-1">$2.8k</div>
                <p className="text-primary-300 text-xs sm:text-sm">from influencer post</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-0.5 sm:mb-1">14.7%</div>
                <p className="text-primary-300 text-xs sm:text-sm">visitor → booking</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 sm:p-0 sm:bg-transparent">
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-accent-400 mb-0.5 sm:mb-1">5 min</div>
                <p className="text-primary-300 text-xs sm:text-sm">to start tracking</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem - Mobile optimized */}
        <section className="py-12 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-orange-50/30 to-amber-50/40"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
                Right now, you're <span className="text-red-600">guessing</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-red-500 shadow-sm hover:shadow-lg transition-shadow">
                <p className="text-base sm:text-lg font-semibold text-gray-900">"Does the hotel actually send guests?"</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">You can't prove it.</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-red-500 shadow-sm hover:shadow-lg transition-shadow">
                <p className="text-base sm:text-lg font-semibold text-gray-900">"Was that influencer worth a free meal?"</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">No way to know.</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-red-500 shadow-sm hover:shadow-lg transition-shadow">
                <p className="text-base sm:text-lg font-semibold text-gray-900">"Is Instagram bringing real guests?"</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">Likes ≠ reservations.</p>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 border-l-4 border-red-500 shadow-sm hover:shadow-lg transition-shadow">
                <p className="text-base sm:text-lg font-semibold text-gray-900">"Why is Tuesday always slow?"</p>
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">No data to fix it.</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution - Mobile optimized */}
        <section className="py-12 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-accent-50/50 to-teal-50/40"></div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
                With BiteReserve, you <span className="text-accent-600">know</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl sm:text-5xl font-black text-accent-600 mb-1 sm:mb-3">47</div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">guests from Grand Hotel</p>
                <p className="text-gray-500 text-xs sm:text-sm">This month. Now you have proof.</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl sm:text-5xl font-black text-accent-600 mb-1 sm:mb-3">28</div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">from @foodie_adventures</p>
                <p className="text-gray-500 text-xs sm:text-sm">That free dinner? Worth $2,800+.</p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
                <div className="text-3xl sm:text-5xl font-black text-accent-600 mb-1 sm:mb-3">+23%</div>
                <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">vs. last December</p>
                <p className="text-gray-500 text-xs sm:text-sm">Instagram is driving the growth.</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/restaurant/example/dashboard"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                See a Live Dashboard
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works - Mobile optimized */}
        <section className="py-10 sm:py-20 bg-gradient-to-br from-gray-100 via-slate-100 to-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Set up in 5 minutes
              </h2>
            </div>

            {/* Mobile: vertical stack with connecting lines */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8">
              <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md border border-gray-200 w-full md:w-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">1</div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Claim your page</span>
              </div>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md border border-gray-200 w-full md:w-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">2</div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">Create tracking links</span>
              </div>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 rotate-90 md:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <div className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl px-4 sm:px-6 py-3 sm:py-4 shadow-md border border-gray-200 w-full md:w-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">3</div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">See who sends guests to your restaurant</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trackable Links Section */}
        <section className="py-10 sm:py-16 bg-white relative overflow-hidden">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                Choose which links to track
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Track clicks on any of these platforms. All guest actions are measured and shown in your dashboard.
              </p>
            </div>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-4 max-w-5xl mx-auto">
              {/* OpenTable */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/opentable%20logo.png" 
                    alt="OpenTable" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">OpenTable</span>
              </div>

              {/* Resy */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/resy%20logo.png" 
                    alt="Resy" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Resy</span>
              </div>

              {/* WhatsApp */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">WhatsApp</span>
              </div>

              {/* Instagram */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Instagram</span>
              </div>

              {/* Facebook */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Facebook</span>
              </div>

              {/* TripAdvisor */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/trip%20advisor.png" 
                    alt="TripAdvisor" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">TripAdvisor</span>
              </div>

              {/* Yelp */}
              <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 bg-gray-50 rounded-xl hover:bg-accent-50 transition-colors group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src="https://kehkusooulqikkswqqnx.supabase.co/storage/v1/object/public/Images/yelp%20logo.png" 
                    alt="Yelp" 
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">Yelp</span>
              </div>
            </div>
            
            <p className="text-center text-xs sm:text-sm text-gray-500 mt-6 sm:mt-8">
              Plus phone, email, website, maps, and more
            </p>
          </div>
        </section>

        {/* Who It's For - Mobile optimized */}
        <section className="py-12 sm:py-20 bg-gray-50 relative overflow-hidden">
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                If your guests come from <span className="text-accent-600">multiple places</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 font-semibold">You need to know what actually works.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-100 hover:border-accent-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Tourist Spots</h3>
                <p className="text-gray-600 text-sm sm:text-base">Track which sources convert.</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-100 hover:border-accent-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Hotel Partners</h3>
                <p className="text-gray-600 text-sm sm:text-base">Prove concierge ROI.</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-100 hover:border-accent-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Fine Dining</h3>
                <p className="text-gray-600 text-sm sm:text-base">Track influencer value.</p>
              </div>
              
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-100 hover:border-accent-200">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Multi-Location</h3>
                <p className="text-gray-600 text-sm sm:text-base">One dashboard for all.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing - Mobile optimized */}
        <section className="py-10 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-50/40 via-emerald-50/30 to-teal-50/40"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-12">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Start free. Pay when it pays off.
              </h2>
              <p className="text-sm sm:text-lg text-gray-600">Costs less than a single lost guest.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {/* Free */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-gray-200">
                <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-gray-500">FREE</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">$0</div>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm">forever</span>
                </div>
                <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    25 guest actions/month
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    3 tracking links
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Choose your links to track
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    14 days analytics
                  </li>
                </ul>
                <Link href="/claim" className="block w-full py-2.5 sm:py-3 text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-sm sm:text-base rounded-xl transition-colors">
                  Start Free
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-accent-500 relative shadow-lg">
                <div className="absolute -top-2.5 sm:-top-3 right-3 sm:right-4 bg-accent-500 text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                  14-DAY FREE TRIAL
                </div>
                <div className="flex items-baseline justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-accent-600">PRO</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">$29<span className="text-sm sm:text-base font-normal text-gray-500">/mo</span></div>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm">or $290/yr <span className="text-accent-600 font-semibold">(save 2 months)</span></span>
                </div>
                <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-xs sm:text-sm">
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Up to <strong>3 restaurants</strong>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <strong>Unlimited</strong> actions
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    <strong>Unlimited</strong> links & choose which to track
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Customize page: logo, banner color, link order
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    90 days analytics
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Weekly reports
                  </li>
                </ul>
                <Link href="/claim" className="block w-full py-2.5 sm:py-3 text-center bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm sm:text-base rounded-xl transition-colors">
                  Start Free Trial
                </Link>
                <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2">2 months free on annual</p>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-5 sm:mt-8">
              Need more than 3 restaurants? <Link href="/claim" className="text-accent-600 font-semibold hover:underline">Business plan ($99/mo) - up to 15 locations</Link>
            </p>
          </div>
        </section>

        {/* 2xGen Section - Mobile optimized */}
        <section className="py-10 sm:py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl hidden sm:block"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl hidden sm:block"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 hover:bg-white/10 transition-all">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold text-white mb-2 sm:mb-4 leading-tight">
                Want more guests, not just data?
              </h2>
              
              <p className="text-sm sm:text-base text-white/80 mb-4 sm:mb-6 max-w-2xl mx-auto">
                Some restaurants work with our partner 2xGen to actively grow hotel referrals using BiteReserve data.
              </p>
              
              <a
                href="https://2xgen.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 text-primary-900 font-semibold text-sm sm:text-base bg-white hover:bg-accent-50 rounded-lg hover:shadow-xl transition-all duration-200 group transform hover:-translate-y-0.5"
              >
                Learn about 2xGen
                <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <p className="text-[10px] sm:text-xs text-white/60 mt-2 sm:mt-3">(Optional. Separate service.)</p>
            </div>
          </div>
        </section>

        {/* Final CTA - Mobile optimized */}
        <section className="relative overflow-hidden py-16 sm:py-32" id="claim">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600"></div>
          
          {/* Tech Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Animated Orbs - hidden on mobile */}
          <div className="absolute inset-0 opacity-20 hidden sm:block">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 leading-tight text-white" style={{textShadow: '0 2px 20px rgba(0,0,0,0.3)'}}>
              Stop guessing.<br />Start knowing.
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Claim your restaurant and see where your guests actually come from.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-6 sm:mb-8">
              <Link
                href="/claim"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-4 bg-white text-accent-600 font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 flex items-center">
                  Claim Your Restaurant — Free
                  <svg className="w-5 h-5 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link
                href="/restaurant/example"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white/20 hover:border-white/60"
              >
                <span className="relative z-10 flex items-center">
                  See Live Example
                  <svg className="w-5 h-5 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
            </div>

            <p className="text-white/70 font-medium text-sm sm:text-base">
              Free forever for basic tracking. Upgrade when you need more.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
