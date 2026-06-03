export type UserRole = 'admin' | 'user'

export type User = {
  id: string
  email: string
  created_at: string
  metadata: Record<string, unknown>
  role?: UserRole
  email_verified_at?: string | null
  last_login_at?: string | null
}

export type EmailConfiguration = {
  id: string
  user_id: string
  email_address: string | null
  email_provider: 'gmail' | 'outlook' | 'imap' | null
  webhook_url: string | null
  status: 'pending' | 'verified' | 'not_configured'
  is_verified: boolean
  verification_token: string | null
  verification_sent_at: string | null
  verified_at: string | null
  spf_verified: boolean
  dkim_verified: boolean
  spf_checked_at: string | null
  dkim_checked_at: string | null
  created_at: string
  updated_at: string
}

export type Inquiry = {
  id: string
  user_id: string
  source: 'email' | 'web_form' | 'webhook'
  sender_email: string
  sender_name: string | null
  subject: string | null
  body_text: string
  raw_content: Record<string, unknown> | null
  webhook_message_id: string | null
  status: 'pending' | 'reviewed' | 'sent' | 'archived'
  created_at: string
  received_at: string
}

export type Response = {
  id: string
  inquiry_id: string
  user_id: string
  ai_generated_text: string
  status: 'draft' | 'approved' | 'edited' | 'sent'
  approved_text: string | null
  created_at: string
  sent_at: string | null
}

export type AnalyticsEvent = {
  id: string
  user_id: string
  event_type: 'inquiry_received' | 'response_generated' | 'response_approved' | 'response_edited' | 'response_sent'
  inquiry_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type InquiryStatus = 'pending' | 'reviewed' | 'sent' | 'archived'
export type ResponseStatus = 'draft' | 'approved' | 'edited' | 'sent' | 'rejected'
export type InquirySource = 'email' | 'web_form' | 'webhook'
export type EventType = 'inquiry_received' | 'response_generated' | 'response_approved' | 'response_edited' | 'response_sent' | 'feedback_submitted' | 'feedback_reviewed'

export type FeedbackCategory = 'bug' | 'feature' | 'ux' | 'pricing'
export type FeedbackStatus = 'new' | 'reviewed' | 'addressed' | 'dismissed'

export type SubscriptionStatus = 'active' | 'unsubscribed' | 'pending'

export type Subscriber = {
  id: string
  email: string
  user_id: string | null
  status: SubscriptionStatus
  subscribed_at: string
  unsubscribed_at: string | null
  email_verified_at: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type DigestLog = {
  id: string
  period_start: string
  period_end: string
  total_inquiries: number
  subscriber_id: string | null
  recipient_id: string | null
  sent_at: string
  subject: string | null
  status: 'pending' | 'sent' | 'failed'
}

export type DigestRecipient = {
  id: string
  email: string
  name: string
  role: string
  active: boolean
  created_at: string
}

export type Feedback = {
  id: string
  user_id: string | null
  category: FeedbackCategory
  rating: number
  nps_score: number | null
  comment_text: string | null
  page_url: string
  metadata: Record<string, unknown>
  status: FeedbackStatus
  created_at: string
  reviewed_at: string | null
}

// ─── Pricing & Billing Types ─────────────────────────────────────────────────

export type PricingPlanTier = 'free' | 'starter' | 'professional' | 'enterprise'

export type PricingPlan = {
  id: string
  tier: PricingPlanTier
  name: string
  name_da: string
  description: string | null
  description_da: string | null
  monthly_price_dkk: number
  monthly_price_eur: number | null
  annual_price_dkk: number
  annual_price_eur: number | null
  currency: 'DKK' | 'EUR'
  features: string[]
  limits: {
    monthly_inquiries: number | null
    team_members: number | null
    email_accounts: number | null
    ai_generated_responses: number | null
  }
  is_active: boolean
  is_featured: boolean
  stripe_price_id_monthly: string | null
  stripe_price_id_annual: string | null
  created_at: string
  updated_at: string
}

export type SubscriptionBillingCycle = 'monthly' | 'annual'

export type BillingSubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'paused'

export type Subscription = {
  id: string
  user_id: string
  plan_id: string
  status: BillingSubscriptionStatus
  billing_cycle: SubscriptionBillingCycle
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'

export type Invoice = {
  id: string
  user_id: string
  subscription_id: string | null
  stripe_invoice_id: string | null
  number: string | null
  status: InvoiceStatus
  amount_dkk: number
  amount_eur: number | null
  currency: 'DKK' | 'EUR'
  period_start: string
  period_end: string
  paid_at: string | null
  due_date: string | null
  invoice_url: string | null
  created_at: string
  updated_at: string
}
