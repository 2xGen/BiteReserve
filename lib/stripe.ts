/**
 * Stripe Client Utility
 * Server-side Stripe operations
 */

import Stripe from 'stripe'

// Stripe is optional - only initialize if key is provided
// If no key, stripe will be null and Stripe features will be disabled
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    })
  : null

// Stripe Product/Price IDs (set these after creating products in Stripe Dashboard)
// For now, we'll create them programmatically if they don't exist
export const STRIPE_PRODUCT_IDS = {
  PRO: process.env.STRIPE_PRODUCT_ID_PRO || 'pro', // Will be set after product creation
  BUSINESS: process.env.STRIPE_PRODUCT_ID_BUSINESS || 'business', // For future
}

// Price IDs (monthly and annual)
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'pro_monthly',
  PRO_ANNUAL: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || 'pro_annual',
}

/**
 * Get or create Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
  userId?: string
): Promise<string> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    // Check if customer already exists by email
    const existingCustomers = await stripe.customers.list({
      email: email.toLowerCase().trim(),
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email.toLowerCase().trim(),
      name: name || undefined,
      metadata: {
        userId: userId || '',
      },
    })

    return customer.id
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Create a Stripe Checkout Session for subscription with 14-day trial
 * This redirects user to Stripe Checkout to collect payment method
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string,
  trialDays: number = 14
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: trialDays,
        metadata: {
          userId: userId,
        },
      },
      payment_method_collection: 'always', // Require payment method for trial
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return session
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    throw error
  }
}

/**
 * Create a subscription with 14-day trial (legacy - use createCheckoutSession instead)
 * @deprecated Use createCheckoutSession for better UX with payment collection
 */
export async function createProSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 14
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete', // Don't require payment method upfront for trial
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    })

    return subscription
  } catch (error) {
    console.error('Error creating Stripe subscription:', error)
    throw error
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error)
    throw error
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    if (cancelImmediately) {
      return await stripe.subscriptions.cancel(subscriptionId)
    } else {
      // Cancel at period end
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      })
    }
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error)
    throw error
  }
}

/**
 * Update subscription (upgrade/downgrade)
 */
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'always_invoice', // Prorate the change
    })
  } catch (error) {
    console.error('Error updating Stripe subscription:', error)
    throw error
  }
}

/**
 * Create a Stripe Customer Portal session for subscription management
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.')
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    
    return session
  } catch (error) {
    console.error('Error creating Stripe Customer Portal session:', error)
    throw error
  }
}
