-- Migration: 005_add_indexes
-- Description: Add performance indexes for common queries

CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_received_at ON public.inquiries(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_status ON public.inquiries(user_id, status);

CREATE INDEX IF NOT EXISTS idx_responses_inquiry_id ON public.responses(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON public.responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_status ON public.responses(status);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
