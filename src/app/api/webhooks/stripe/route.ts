import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { extractPlanTierFromMetadata, SubscriptionStatus } from '@/lib/stripe/types'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

type CheckoutSessionCompleted = Stripe.Event & {
  data: { object: Stripe.Checkout.Session }
}

type SubscriptionUpdated = Stripe.Event & {
  data: { object: Stripe.Subscription }
}

type SubscriptionDeleted = Stripe.Event & {
  data: { object: Stripe.Subscription }
}

type InvoicePaymentFailed = Stripe.Event & {
  data: { object: Stripe.Invoice }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: existingEvent } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ status: 'already_processed' }, { status: 200 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event as CheckoutSessionCompleted, supabase)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event as SubscriptionUpdated, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event as SubscriptionDeleted, supabase)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event as InvoicePaymentFailed, supabase)
        break

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      raw_event: event.data.object as unknown as Record<string, unknown>,
    })

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe webhook processing failed (event ${event.id}): ${message}`)
    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      raw_event: { error: message } as unknown as Record<string, unknown>,
    })
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(
  event: CheckoutSessionCompleted,
  supabase: SupabaseClient
): Promise<void> {
  const session = event.data.object
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const userId = session.metadata?.user_id

  if (!userId) {
    console.error('checkout.session.completed missing user_id in metadata')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price'],
  })

  const sub = subscription as unknown as {
    current_period_start: number
    current_period_end: number
    cancel_at_period_end: boolean
    items: { data: Array<{ price?: { id: string; metadata: Record<string, string> } }> }
  }

  const priceId = sub.items.data[0]?.price?.id ?? null
  const priceMetadata = sub.items.data[0]?.price?.metadata
  const planTier = extractPlanTierFromMetadata(priceMetadata)

  const periodStart = new Date(sub.current_period_start * 1000).toISOString()
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      plan_tier: planTier,
      status: 'active' as SubscriptionStatus,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    {
      onConflict: 'stripe_subscription_id',
    }
  )

  if (error) {
    console.error('Failed to upsert subscription:', error)
    throw error
  }
}

async function handleSubscriptionUpdated(
  event: SubscriptionUpdated,
  supabase: SupabaseClient
): Promise<void> {
  const subscription = event.data.object
  const subscriptionId = subscription.id

  const sub = subscription as unknown as {
    current_period_start: number
    current_period_end: number
    cancel_at_period_end: boolean
    items: { data: Array<{ price?: { id: string; metadata: Record<string, string> } }> }
  }

  const priceId = sub.items.data[0]?.price?.id ?? null
  const priceMetadata = sub.items.data[0]?.price?.metadata
  const planTier = extractPlanTierFromMetadata(priceMetadata)

  const status: SubscriptionStatus = mapStripeSubscriptionStatus(subscription.status)
  const periodStart = sub.current_period_start
    ? new Date(sub.current_period_start * 1000).toISOString()
    : null
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null

  const { error } = await supabase
    .from('subscriptions')
    .update({
      stripe_price_id: priceId,
      plan_tier: planTier,
      status,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('Failed to update subscription:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(
  event: SubscriptionDeleted,
  supabase: SupabaseClient
): Promise<void> {
  const subscription = event.data.object
  const subscriptionId = subscription.id

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled' as SubscriptionStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('Failed to cancel subscription:', error)
    throw error
  }
}

async function handleInvoicePaymentFailed(
  event: InvoicePaymentFailed,
  supabase: SupabaseClient
): Promise<void> {
  const invoice = event.data.object
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription ?? null

  if (subscriptionId) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due' as SubscriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Failed to update subscription to past_due:', error)
      throw error
    }
  }

  const userId = await getUserIdFromStripeCustomer(supabase, customerId)
  if (userId) {
    const { error: analyticsError } = await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'payment_failed',
      metadata: {
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
      },
    })

    if (analyticsError) {
      console.error('Failed to log payment_failed analytics event:', analyticsError)
    }
  }
}

function mapStripeSubscriptionStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'trialing':
      return 'trialing'
    case 'active':
      return 'active'
    case 'past_due':
      return 'past_due'
    case 'canceled':
      return 'cancelled'
    case 'unpaid':
      return 'past_due'
    case 'incomplete':
    case 'incomplete_expired':
    default:
      return 'inactive'
  }
}

async function getUserIdFromStripeCustomer(
  supabase: SupabaseClient,
  customerId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  return data?.user_id ?? null
}