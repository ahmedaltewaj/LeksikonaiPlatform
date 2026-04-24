-- Migration: 004_add_analytics_events
-- Description: Analytics events table for tracking usage

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'inquiry_received',
    'response_generated',
    'response_approved',
    'response_edited',
    'response_sent'
  )),
  inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
