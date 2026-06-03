-- Migration: 010_fix_digest_logs_recipient
-- digest_logs now tracks both subscribers and digest_recipients
-- Add recipient_id column for digest_recipients

ALTER TABLE public.digest_logs
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.digest_recipients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_digest_logs_recipient ON public.digest_logs(recipient_id);