import Stripe from 'stripe'

export type PlanTier = 'starter' | 'professional'

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'inactive'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  stripe_price_id: string | null
  plan_tier: PlanTier
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface StripeEvent {
  id: string
  stripe_event_id: string
  event_type: string
  processed_at: string
  raw_event: Record<string, unknown> | null
  created_at: string
}

export const PLAN_TIER_FROM_PRICE_METADATA: Record<string, PlanTier> = {
  starter: 'starter',
  professional: 'professional',
}

export function extractPlanTierFromMetadata(
  priceMetadata: Record<string, string> | undefined
): PlanTier {
  if (!priceMetadata) return 'starter'
  const tier = priceMetadata.plan_tier || priceMetadata.plan || 'starter'
  return (PLAN_TIER_FROM_PRICE_METADATA[tier] as PlanTier) ?? 'starter'
}