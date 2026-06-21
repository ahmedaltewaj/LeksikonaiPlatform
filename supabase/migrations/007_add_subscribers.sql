-- Migration: 007_add_subscribers
-- Description: Subscriber management for weekly digest emails

CREATE TYPE subscription_status AS ENUM ('active', 'unsubscribed', 'pending');

CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status subscription_status DEFAULT 'pending',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
  ON public.subscribers FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own subscription"
  ON public.subscribers FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_subscribers_email ON public.subscribers(email);
CREATE INDEX idx_subscribers_status ON public.subscribers(status);
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);

CREATE TYPE digest_status AS ENUM ('pending', 'sent', 'failed');

CREATE TABLE IF NOT EXISTS public.digest_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_inquiries INTEGER DEFAULT 0,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  subject TEXT,
  status digest_status DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE public.digest_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage digest logs"
  ON public.digest_logs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own digest logs"
  ON public.digest_logs FOR SELECT
  USING (auth.uid() = subscriber_id);

CREATE INDEX idx_digest_logs_period ON public.digest_logs(period_start, period_end);
CREATE INDEX idx_digest_logs_subscriber ON public.digest_logs(subscriber_id);