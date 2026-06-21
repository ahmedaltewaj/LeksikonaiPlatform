'use server'

import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(priceId: string, userId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    metadata: { user_id: userId },
  })

  if (session.url) {
    redirect(session.url)
  }

  throw new Error('Failed to create checkout session')
}

export async function createCustomerPortalSession(customerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard`,
  })

  if (session.url) {
    redirect(session.url)
  }

  throw new Error('Failed to create customer portal session')
}

export async function getOrCreateStripeCustomer(email: string, name?: string) {
  const customers = await stripe.customers.list({ email, limit: 1 })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  return stripe.customers.create({ email, name })
}