import { NextRequest, NextResponse } from 'next/server'
import { sendAccountWelcomeEmail, sendAdminNotification } from '@/lib/resend'

export const runtime = 'edge'

// POST - Send account welcome email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing email or name' },
        { status: 400 }
      )
    }

    const result = await sendAccountWelcomeEmail(email, name)

    // Send admin notification
    await sendAdminNotification(
      'New Account Created',
      `A new user account has been created:\n\nName: ${name}\nEmail: ${email}`,
      { email, name, timestamp: new Date().toISOString() }
    ).catch(err => console.error('Failed to send admin notification:', err))

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending account welcome email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
