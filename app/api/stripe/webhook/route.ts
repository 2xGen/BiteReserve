import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { sendTransactionEmail, sendWelcomeEmail, sendAdminNotification } from '@/lib/resend'

// Note: Webhooks need Node.js runtime for proper body parsing
export const runtime = 'nodejs'

// POST - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // Handle successful checkout - subscription is created automatically by Stripe
        // Update subscription status from "pending" to "trialing" or "active"
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id
          if (subscriptionId && stripe) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            
            // Update subscription - this will change status from "pending" to "trialing"/"active"
            await handleSubscriptionUpdate(supabase, subscription)
            
            // Send welcome email if this is a new subscription from checkout
            if (session.customer_email && session.metadata?.userId) {
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('name')
                  .eq('id', session.metadata.userId)
                  .single()
                
                if (userData) {
                  // Get restaurant name from user's claimed restaurants
                  const { data: restaurantData } = await supabase
                    .from('restaurants')
                    .select('name')
                    .eq('user_id', session.metadata.userId)
                    .eq('is_claimed', true)
                    .limit(1)
                    .single()
                  
                  const restaurantName = restaurantData?.name || 'your restaurant'
                  
                  // Determine plan from price ID
                  const priceId = subscription.items.data[0]?.price?.id
                  const businessPriceIds = [
                    process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY,
                    process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL
                  ]
                  const plan = priceId && businessPriceIds.includes(priceId) ? 'business' : 'pro'
                  
                  await sendWelcomeEmail(
                    session.customer_email,
                    userData.name || 'there',
                    restaurantName,
                    plan as 'pro' | 'business'
                  )
                }
              } catch (emailError) {
                // Don't fail webhook if email fails
                console.error('Error sending welcome email after checkout:', emailError)
              }
            }

            // Send admin notification for new subscription
            if (session.metadata?.userId) {
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('name, email')
                  .eq('id', session.metadata.userId)
                  .single()
                
                const { data: restaurantData } = await supabase
                  .from('restaurants')
                  .select('name')
                  .eq('user_id', session.metadata.userId)
                  .eq('is_claimed', true)
                  .limit(1)
                  .single()
                
                const priceId = subscription.items.data[0]?.price?.id
                const businessPriceIds = [
                  process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY,
                  process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL
                ]
                const plan = priceId && businessPriceIds.includes(priceId) ? 'business' : 'pro'
                
                await sendAdminNotification(
                  'New Subscription Created',
                  `A new subscription has been created:\n\nUser: ${userData?.name || 'N/A'} (${userData?.email || session.customer_email})\nRestaurant: ${restaurantData?.name || 'N/A'}\nPlan: ${plan}\nStatus: ${subscription.status}\nStripe Customer: ${subscription.customer}`,
                  {
                    userId: session.metadata.userId,
                    userEmail: userData?.email || session.customer_email,
                    userName: userData?.name,
                    restaurantName: restaurantData?.name,
                    plan,
                    subscriptionId: subscription.id,
                    customerId: subscription.customer,
                    status: subscription.status,
                    timestamp: new Date().toISOString(),
                  }
                )
              } catch (adminEmailError) {
                console.error('Error sending admin notification:', adminEmailError)
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        
        // Send admin notification for subscription update
        try {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          
          if (subData) {
            const { data: userData } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', subData.user_id)
              .single()
            
            await sendAdminNotification(
              'Subscription Updated',
              `A subscription has been updated:\n\nUser: ${userData?.name || 'N/A'} (${userData?.email || 'N/A'})\nPlan: ${subData.plan}\nNew Status: ${subscription.status}\nStripe Subscription: ${subscription.id}`,
              {
                userId: subData.user_id,
                userEmail: userData?.email,
                userName: userData?.name,
                plan: subData.plan,
                subscriptionId: subscription.id,
                status: subscription.status,
                timestamp: new Date().toISOString(),
              }
            )
          }
        } catch (adminEmailError) {
          console.error('Error sending admin notification:', adminEmailError)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        
        // Send admin notification for subscription cancellation
        try {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan')
            .eq('stripe_subscription_id', subscription.id)
            .single()
          
          if (subData) {
            const { data: userData } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', subData.user_id)
              .single()
            
            await sendAdminNotification(
              'Subscription Cancelled',
              `A subscription has been cancelled:\n\nUser: ${userData?.name || 'N/A'} (${userData?.email || 'N/A'})\nPlan: ${subData.plan}\nStripe Subscription: ${subscription.id}`,
              {
                userId: subData.user_id,
                userEmail: userData?.email,
                userName: userData?.name,
                plan: subData.plan,
                subscriptionId: subscription.id,
                timestamp: new Date().toISOString(),
              }
            )
          }
        } catch (adminEmailError) {
          console.error('Error sending admin notification:', adminEmailError)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // invoice.subscription can be string (ID) or Subscription object (if expanded) or null
        // Use bracket notation to access subscription property safely
        const subscriptionField = (invoice as any).subscription
        let subscriptionId: string | null = null
        if (subscriptionField) {
          if (typeof subscriptionField === 'string') {
            subscriptionId = subscriptionField
          } else if (typeof subscriptionField === 'object' && subscriptionField.id) {
            subscriptionId = subscriptionField.id
          }
        }
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await handleSubscriptionUpdate(supabase, subscription)
          
          // Send transaction confirmation email
          await handlePaymentSuccessEmail(supabase, invoice, subscription)
          
          // Send admin notification for successful payment
          try {
            const { data: subData } = await supabase
              .from('subscriptions')
              .select('user_id, plan')
              .eq('stripe_subscription_id', subscriptionId)
              .single()
            
            if (subData) {
              const { data: userData } = await supabase
                .from('users')
                .select('name, email')
                .eq('id', subData.user_id)
                .single()
              
              await sendAdminNotification(
                'Payment Received',
                `A payment has been successfully processed:\n\nUser: ${userData?.name || 'N/A'} (${userData?.email || 'N/A'})\nPlan: ${subData.plan}\nAmount: ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}\nInvoice: ${invoice.id}`,
                {
                  userId: subData.user_id,
                  userEmail: userData?.email,
                  userName: userData?.name,
                  plan: subData.plan,
                  amount: `${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()}`,
                  invoiceId: invoice.id,
                  subscriptionId: subscriptionId,
                  timestamp: new Date().toISOString(),
                }
              )
            }
          } catch (adminEmailError) {
            console.error('Error sending admin notification:', adminEmailError)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // invoice.subscription can be string (ID) or Subscription object (if expanded) or null
        // Use bracket notation to access subscription property safely
        const subscriptionField = (invoice as any).subscription
        let subscriptionId: string | null = null
        if (subscriptionField) {
          if (typeof subscriptionField === 'string') {
            subscriptionId = subscriptionField
          } else if (typeof subscriptionField === 'object' && subscriptionField.id) {
            subscriptionId = subscriptionField.id
          }
        }
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await handlePaymentFailed(supabase, subscription)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Handle subscription created/updated events
 */
async function handleSubscriptionUpdate(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    // Find subscription by stripe_subscription_id
    const { data: existingSub, error: findError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding subscription:', findError)
      return
    }

    // Map Stripe status to our status
    // IMPORTANT: If subscription is "pending" in our DB, keep it pending until restaurant is verified
    // Trial starts after verification, not after payment
    let status = 'active'
    if (existingSub && existingSub.status === 'pending') {
      // Keep as pending - trial will start when restaurant is approved
      status = 'pending'
    } else if (subscription.status === 'trialing') {
      status = 'trialing'
    } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
      status = 'past_due'
    } else if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      status = 'canceled'
    } else if (subscription.status === 'active') {
      status = 'active'
    }

    const updateData: any = {
      status,
    }

    // Safely access Stripe subscription properties
    if ('current_period_start' in subscription && typeof subscription.current_period_start === 'number') {
      updateData.current_period_start = new Date(subscription.current_period_start * 1000).toISOString()
    }
    if ('current_period_end' in subscription && typeof subscription.current_period_end === 'number') {
      updateData.current_period_end = new Date(subscription.current_period_end * 1000).toISOString()
    }
    // Only set trial_ends_at if subscription is not pending
    // If pending, trial will start after restaurant verification
    if (status !== 'pending' && 'trial_end' in subscription && typeof subscription.trial_end === 'number') {
      updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString()
    }
    if ('canceled_at' in subscription && typeof subscription.canceled_at === 'number') {
      updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString()
    }

    // Determine plan type from Stripe price ID and set appropriate limits
    const priceId = subscription.items.data[0]?.price?.id
    const proMonthlyPriceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY
    const proAnnualPriceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL
    const businessMonthlyPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY
    const businessAnnualPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL

    // Set plan and limits based on price ID (during trial AND after trial)
    // This ensures the subscription has the correct plan and limits from the start
    if (priceId === businessMonthlyPriceId || priceId === businessAnnualPriceId) {
      // Business plan limits: up to 15 restaurants
      updateData.plan = 'business'
      updateData.max_restaurants = 15
      updateData.max_campaign_links = null // Unlimited
      updateData.max_actions_per_month = null // Unlimited
      updateData.analytics_retention_days = 365
      updateData.remove_branding = true
      updateData.weekly_email_reports = true
    } else if (priceId === proMonthlyPriceId || priceId === proAnnualPriceId) {
      // Pro plan limits: up to 3 restaurants
      updateData.plan = 'pro'
      updateData.max_restaurants = 3
      updateData.max_campaign_links = null // Unlimited
      updateData.max_actions_per_month = null // Unlimited
      updateData.analytics_retention_days = 90
      updateData.remove_branding = true
      updateData.weekly_email_reports = true
    }

    if (existingSub) {
      // Update existing subscription by stripe_subscription_id
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', subscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }
    } else {
      // Try to find by customer ID (this happens when subscription was created with status "pending")
      // and we need to link it to the Stripe subscription
      // Look for pending subscriptions first (newly created from checkout)
      let { data: customerSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', subscription.customer as string)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // If no pending subscription found, get the most recent subscription for this customer
      if (!customerSub || (customerSub as any).error) {
        const { data: fallbackSub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('stripe_customer_id', subscription.customer as string)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        customerSub = fallbackSub
      }

      if (customerSub) {
        // Update subscription: link stripe_subscription_id and update status from "pending" to "trialing"/"active"
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            ...updateData,
            stripe_subscription_id: subscription.id,
          })
          .eq('id', customerSub.id)

        if (updateError) {
          console.error('Error updating subscription by customer:', updateError)
        }
      } else {
        // If no subscription found, this might be a new subscription from Stripe
        // We could create one here, but for now, just log a warning
        console.warn('No subscription found for Stripe subscription:', subscription.id, 'customer:', subscription.customer)
      }
    }
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    // Downgrade to Free plan
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (existingSub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          // Free plan limits
          max_restaurants: 1,
          max_campaign_links: 3,
          max_actions_per_month: 25,
          analytics_retention_days: 14,
          remove_branding: false,
          weekly_email_reports: false,
        })
        .eq('stripe_subscription_id', subscription.id)

      if (updateError) {
        console.error('Error downgrading subscription:', updateError)
      }
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(
  supabase: any, // Supabase client type
  subscription: Stripe.Subscription
) {
  try {
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', subscription.id)

    if (updateError) {
      console.error('Error updating subscription status to past_due:', updateError)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

/**
 * Handle payment success email
 */
async function handlePaymentSuccessEmail(
  supabase: any,
  invoice: Stripe.Invoice,
  subscription: Stripe.Subscription
) {
  try {
    // Get user info from subscription
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id, plan')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (!subData) {
      console.warn('Subscription not found for payment success email')
      return
    }

    // Get user email
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', subData.user_id)
      .single()

    if (!userData || !userData.email) {
      console.warn('User not found for payment success email')
      return
    }

    // Determine plan type and billing cycle from price ID
    const priceId = subscription.items.data[0]?.price?.id
    const proMonthlyPriceId = process.env.STRIPE_PRICE_ID_PRO_MONTHLY
    const proAnnualPriceId = process.env.STRIPE_PRICE_ID_PRO_ANNUAL
    const businessMonthlyPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_MONTHLY
    const businessAnnualPriceId = process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL

    let plan: 'pro' | 'business' | null = null
    let billingCycle: 'monthly' | 'annual' | null = null

    if (priceId === proMonthlyPriceId) {
      plan = 'pro'
      billingCycle = 'monthly'
    } else if (priceId === proAnnualPriceId) {
      plan = 'pro'
      billingCycle = 'annual'
    } else if (priceId === businessMonthlyPriceId) {
      plan = 'business'
      billingCycle = 'monthly'
    } else if (priceId === businessAnnualPriceId) {
      plan = 'business'
      billingCycle = 'annual'
    }

    if (!plan || !billingCycle) {
      console.warn('Could not determine plan type from price ID:', priceId)
      return
    }

    // Get invoice amount and currency
    const amount = invoice.amount_paid || invoice.total || 0
    const currency = invoice.currency || 'usd'
    const invoiceUrl = invoice.hosted_invoice_url || undefined

    // Send transaction email
    await sendTransactionEmail(
      userData.email,
      userData.name || 'there',
      plan,
      billingCycle,
      amount,
      currency,
      invoiceUrl
    )
  } catch (error) {
    // Don't fail webhook if email fails
    console.error('Error sending payment success email:', error)
  }
}
