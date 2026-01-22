import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const origin = requestUrl.origin

  // Handle OAuth errors from Google/Supabase
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, origin)
    )
  }

  // If there's a code, Supabase has already handled the OAuth exchange
  // The session should be available via the client-side SDK
  // We just need to redirect to the dashboard
  // The client-side auth context will pick up the session automatically
  if (code) {
    // Redirect to dashboard - the client-side Supabase SDK will handle the session
    return NextResponse.redirect(new URL(next, origin))
  }

  // If no code and no error, just redirect to login
  return NextResponse.redirect(new URL('/login', origin))
}
