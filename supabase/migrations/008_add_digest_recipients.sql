-- Migration: 008_add_digest_recipients
-- Description: Digest recipients config table per WEEKLY-DIGEST-EMAIL-SPEC
-- Recipients: Product Lead, CMO, CEO — defined in LEKAA-137

CREATE TABLE IF NOT EXISTS public.digest_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'product_lead' | 'cmo' | 'ceo'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.digest_recipients ENABLE ROW LEVEL SECURITY;

-- Service role can manage recipients; recipients can view themselves
CREATE POLICY "Service role can manage digest recipients"
  ON public.digest_recipients FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view active digest recipients"
  ON public.digest_recipients FOR SELECT
  USING (active = true);

-- Index for fast lookup
CREATE INDEX idx_digest_recipients_active ON public.digest_recipients(active);

-- Seed initial recipients (per LEKAA-137 spec)
INSERT INTO public.digest_recipients (email, name, role, active) VALUES
  ('product@leksikon.ai', 'Product Lead', 'product_lead', true),
  ('cmo@leksikon.ai', 'CMO', 'cmo', true),
  ('ceo@leksikon.ai', 'CEO', 'ceo', true)
ON CONFLICT (email) DO NOTHING;

-- pg_cron setup: ensure extension exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on pg_cron to service_role
GRANT USAGE ON SCHEMA pg_cron TO service_role;