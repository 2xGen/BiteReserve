/**
 * Resend Email Client Utility
 * Handles all transactional emails for BiteReserve
 */

import { Resend } from 'resend'

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY
export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Email configuration
// For testing: Use Resend's default domain (onboarding@resend.dev)
// For production: Update to your verified domain (e.g., hello@bitereserve.com)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'BiteReserve <onboarding@resend.dev>'
const REPLY_TO = process.env.RESEND_REPLY_TO || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matthijs@2xgen.com'

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  restaurantName: string,
  plan: 'free' | 'pro' | 'business'
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping welcome email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const planInfo = {
      free: {
        name: 'Free Plan',
        features: ['25 guest actions/month', '3 tracking links', '14 days analytics']
      },
      pro: {
        name: 'Pro Plan (14-day trial)',
        features: ['Unlimited guest actions', 'Unlimited tracking links', '90 days analytics', '14-day free trial']
      },
      business: {
        name: 'Business Plan',
        features: ['Unlimited restaurants', 'Unlimited everything', '365 days analytics', '14-day free trial']
      }
    }

    const info = planInfo[plan]

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: `Welcome to BiteReserve, ${name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to BiteReserve</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to BiteReserve!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
            
            <p style="font-size: 16px;">Great news! Your restaurant <strong>${restaurantName}</strong> has been claimed and your BiteReserve page is being set up.</p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <h2 style="margin-top: 0; color: #065f46; font-size: 18px;">Your Plan: ${info.name}</h2>
              <ul style="margin: 10px 0; padding-left: 20px; color: #047857;">
                ${info.features.map(feature => `<li style="margin: 8px 0;">${feature}</li>`).join('')}
              </ul>
            </div>
            
            <p style="font-size: 16px;">We'll manually verify your restaurant information within 24 hours by checking it against public data sources (primarily Google Business Profile).</p>
            
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">📋 Verification Information Needed</p>
              <p style="margin: 8px 0 0 0; color: #78350f; font-size: 14px;">If your restaurant isn't already in our database, we may need your <strong>Google Business Profile link</strong> to verify your information. If needed, we'll email you to request it.</p>
            </div>
            
            <p style="font-size: 16px;">Once verified, you'll receive another email with your dashboard login details and your BiteReserve page will be activated.</p>
            
            ${plan !== 'free' ? `
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">🎉 Thank you for starting your ${plan === 'pro' ? 'Pro' : 'Business'} trial!</p>
              <p style="margin: 8px 0 0 0; color: #1e3a8a; font-size: 14px;">Your 14-day trial has started. After the trial, your subscription will continue at ${plan === 'pro' ? '$29/mo' : '$99/mo'} unless you cancel. You can manage your subscription anytime from your dashboard.</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bitereserve.com/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Dashboard</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you have any questions or need to provide additional information, just reply to this email. We're here to help!</p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              Best regards,<br>
              The BiteReserve Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>BiteReserve - Track where your restaurant bookings come from</p>
            <p><a href="https://bitereserve.com" style="color: #10b981;">bitereserve.com</a></p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Send transaction confirmation email for successful Stripe payments
 */
export async function sendTransactionEmail(
  email: string,
  name: string,
  plan: 'pro' | 'business',
  billingCycle: 'monthly' | 'annual',
  amount: number,
  currency: string = 'USD',
  invoiceUrl?: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend not configured - skipping transaction email')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const planNames = {
      pro: 'Pro Plan',
      business: 'Business Plan'
    }

    const billingLabels = {
      monthly: 'Monthly',
      annual: 'Annual'
    }

    const planName = planNames[plan]
    const billingLabel = billingLabels[billingCycle]
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100) // Stripe amounts are in cents

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: `Payment Confirmation - ${planName} ${billingLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Payment Confirmed</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
            
            <p style="font-size: 16px;">Thank you for your payment! Your <strong>${planName} ${billingLabel}</strong> subscription has been confirmed.</p>
            
            <div style="background: #f0fdf4; border: 1px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #065f46;">Plan:</span>
                <span style="color: #047857;">${planName} ${billingLabel}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #065f46;">Amount:</span>
                <span style="color: #047857; font-size: 18px; font-weight: bold;">${formattedAmount}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #065f46;">Status:</span>
                <span style="color: #047857; font-weight: bold;">✓ Active</span>
              </div>
            </div>
            
            ${invoiceUrl ? `
              <div style="text-align: center; margin: 20px 0;">
                <a href="${invoiceUrl}" style="display: inline-block; color: #10b981; text-decoration: underline; font-size: 14px;">View Invoice</a>
              </div>
            ` : ''}
            
            <p style="font-size: 16px;">Your subscription is now active and you have full access to all ${planName} features.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bitereserve.com/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you have any questions about your subscription, just reply to this email.</p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              Best regards,<br>
              The BiteReserve Team
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>BiteReserve - Track where your restaurant bookings come from</p>
            <p><a href="https://bitereserve.com" style="color: #10b981;">bitereserve.com</a></p>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending transaction email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
