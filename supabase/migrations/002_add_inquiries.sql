-- Migration: 002_add_inquiries
-- Description: Customer inquiries table

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  source TEXT CHECK (source IN ('email', 'web_form', 'webhook')) NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  subject TEXT,
  body_text TEXT NOT NULL,
  raw_content JSONB,
  webhook_message_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'sent', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inquiries"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = user_id);
