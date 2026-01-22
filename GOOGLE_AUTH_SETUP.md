# Google Authentication Setup Guide

## Step-by-Step Instructions

### Step 1: Configure Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project (or create a new one)

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (or Internal if using Google Workspace)
     - App name: BiteReserve
     - User support email: your email
     - Developer contact: your email
     - Add scopes: `email`, `profile`, `openid`
   - Application type: **Web application**
   - Name: BiteReserve Web Client
   - **Authorized JavaScript origins:**
     - `https://bitereserve.com` (your production domain)
     - `http://localhost:3002` (for local development - use your actual port)
   - **Authorized redirect URIs:**
     - **IMPORTANT:** Add your Supabase callback URL here:
       - `https://kehkusooulqikkswqqnx.supabase.co/auth/v1/callback`
       - (Replace `kehkusooulqikkswqqnx` with your actual Supabase project reference ID)
     - Also add your local Supabase callback if testing locally:
       - `http://localhost:54321/auth/v1/callback` (if using Supabase local dev)
   - Click "Create"
   - **Copy the Client ID and Client Secret** (you'll need these for Step 2)
   
   **Note:** Google redirects to Supabase, not directly to your app. Supabase then redirects to your app.

### Step 2: Configure Google Provider in Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication > Providers**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab
   - Find "Google" in the list

3. **Enable Google Provider**
   - Toggle "Enable Google provider" to ON
   - Enter your **Google Client ID** (from Step 1)
   - Enter your **Google Client Secret** (from Step 1)
   - Click "Save"

### Step 3: Update Supabase Redirect URLs

1. **In Supabase Dashboard**
   - Go to "Authentication" > "URL Configuration"
   - Add to **Redirect URLs** (these are where Supabase redirects AFTER successful Google auth):
     - `http://localhost:3002/auth/callback` (for local development - use your actual port)
     - `https://bitereserve.com/auth/callback` (your production domain)
   
   **Important:** These are YOUR app URLs, not Google URLs. Supabase will redirect here after handling the Google OAuth flow.

### Step 4: Test Google Authentication

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test the flow**
   - Go to `/login` or `/signup`
   - Click "Continue with Google"
   - You should be redirected to Google's sign-in page
   - After signing in, you'll be redirected back to your dashboard

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - **CRITICAL:** The redirect URI in Google Cloud Console must be your **Supabase callback URL**, not your app URL
   - It should be: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Find your Supabase project reference ID in your Supabase dashboard URL or settings
   - Check for trailing slashes, http vs https, etc.
   - Make sure you're using the exact URL Supabase provided

2. **"Invalid client" error**
   - Verify your Client ID and Client Secret in Supabase match Google Cloud Console
   - Make sure you copied them correctly (no extra spaces)

3. **User not created in database**
   - Check Supabase logs for errors
   - Verify the `users` table exists and has the correct schema
   - Check that `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables

4. **Callback not working**
   - Verify the `/auth/callback` route exists
   - Check that your redirect URL in Supabase matches your callback route
   - Check browser console and network tab for errors

## Files Modified

- `lib/auth-context.tsx` - Added `signInWithGoogle()` method
- `app/login/page.tsx` - Added Google sign-in button
- `app/signup/page.tsx` - Added Google sign-in button
- `app/auth/callback/route.ts` - Handles OAuth callback and creates user record

## Environment Variables

No new environment variables needed - uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for creating user records)

## Next Steps

After setup is complete:
1. Test Google sign-in on both login and signup pages
2. Verify users are created in the `users` table
3. Test the full flow: sign in → dashboard → sign out → sign in again
