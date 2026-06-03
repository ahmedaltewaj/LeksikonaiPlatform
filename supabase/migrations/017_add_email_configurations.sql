-- Migration: 017_add_email_configurations
-- Description: Email configuration table for onboarding email setup flow

CREATE TABLE IF NOT EXISTS public.email_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  email_provider TEXT NOT NULL CHECK (email_provider IN ('gmail', 'outlook', 'imap')),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_sent_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  spf_verified BOOLEAN DEFAULT FALSE,
  dkim_verified BOOLEAN DEFAULT FALSE,
  spf_checked_at TIMESTAMPTZ,
  dkim_checked_at TIMESTAMPTZ,
  webhook_url TEXT,
  smtp_config JSONB DEFAULT '{}',
  status TEXT DEFAULT 'not_configured' CHECK (status IN ('not_configured', 'pending', 'verified')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_email_configurations_user_id ON public.email_configurations(user_id);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_email_configurations_email ON public.email_configurations(email_address);

-- Index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_email_configurations_token ON public.email_configurations(verification_token);

ALTER TABLE public.email_configurations ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own email configuration
CREATE POLICY "Users can view their own email configuration"
  ON public.email_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email configuration"
  ON public.email_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email configuration"
  ON public.email_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email configuration"
  ON public.email_configurations FOR DELETE
  USING (auth.uid() = user_id);