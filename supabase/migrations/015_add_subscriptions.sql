-- Migration: 015_add_subscriptions
-- Description: Subscription billing tables for Stripe integration
-- Parent issue: LEKAA-183 (Integrate payment processing for subscription billing)

-- Plan tier enum
CREATE TYPE plan_tier AS ENUM ('starter', 'professional');

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'inactive');

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT,
  plan_tier plan_tier NOT NULL DEFAULT 'starter',
  status subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Stripe events table for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  raw_event JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for stripe_events (service role only for writes, authenticated read)
CREATE POLICY "Service role can manage stripe events"
  ON public.stripe_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert stripe events"
  ON public.stripe_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Index for stripe_events
CREATE INDEX idx_stripe_events_stripe_event_id ON public.stripe_events(stripe_event_id);
CREATE INDEX idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX idx_stripe_events_processed_at ON public.stripe_events(processed_at DESC);

-- Function to check if Stripe event was already processed (idempotency)
CREATE OR REPLACE FUNCTION public.is_stripe_event_processed(p_stripe_event_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM stripe_events 
    WHERE stripe_event_id = p_stripe_event_id
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record processed Stripe event
CREATE OR REPLACE FUNCTION public.record_stripe_event(
  p_stripe_event_id TEXT,
  p_event_type TEXT,
  p_raw_event JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.stripe_events (stripe_event_id, event_type, raw_event)
  VALUES (p_stripe_event_id, p_event_type, p_raw_event)
  ON CONFLICT (stripe_event_id) DO UPDATE SET processed_at = NOW()
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();