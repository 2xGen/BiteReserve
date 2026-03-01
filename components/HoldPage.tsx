/**
 * Shown when NEXT_PUBLIC_HOLD_MODE=true (e.g. Supabase project paused).
 * No Supabase or auth — static only.
 */
export default function HoldPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-6 font-sans antialiased">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">BiteReserve is on hold</h1>
        <p className="text-gray-600 leading-relaxed">
          We&apos;re taking a short break. Restaurant pages and the dashboard are temporarily paused. We&apos;ll be back when we&apos;re ready to continue.
        </p>
        <p className="text-sm text-gray-500">
          If you need to get in touch, please reach out via your usual contact.
        </p>
      </div>
    </div>
  )
}
