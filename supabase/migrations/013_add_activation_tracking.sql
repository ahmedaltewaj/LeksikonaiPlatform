-- Migration: 013_add_activation_tracking
-- Description: User activation tracking fields and analytics events for funnel analysis

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_inquiry_received_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_response_sent_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activation_completed_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.activation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'signup_completed', 'email_verified', 'onboarding_started', 'onboarding_completed',
    'first_inquiry_received', 'first_response_sent', 'activated'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activation_events_user_id ON public.activation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_events_event_type ON public.activation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activation_events_created_at ON public.activation_events(created_at);

ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_event_type_check
CHECK (event_type IN (
  'inquiry_received', 'response_generated', 'response_approved', 'response_edited', 'response_sent',
  'onboarding_started', 'onboarding_completed', 'first_inquiry_received', 'first_response_sent'
));

CREATE OR REPLACE FUNCTION record_activation_event(p_user_id UUID, p_event_type TEXT, p_metadata JSONB DEFAULT '{}')
RETURNS UUID AS $$
DECLARE event_id UUID;
BEGIN
  INSERT INTO public.activation_events (user_id, event_type, metadata) VALUES (p_user_id, p_event_type, p_metadata) RETURNING id INTO event_id;
  CASE p_event_type
    WHEN 'email_verified' THEN UPDATE public.users SET email_verified_at = NOW() WHERE id = p_user_id AND email_verified_at IS NULL;
    WHEN 'onboarding_started' THEN UPDATE public.users SET onboarding_started_at = NOW() WHERE id = p_user_id AND onboarding_started_at IS NULL;
    WHEN 'onboarding_completed' THEN UPDATE public.users SET onboarding_completed_at = NOW() WHERE id = p_user_id AND onboarding_completed_at IS NULL;
    WHEN 'first_inquiry_received' THEN UPDATE public.users SET first_inquiry_received_at = NOW() WHERE id = p_user_id AND first_inquiry_received_at IS NULL;
    WHEN 'first_response_sent' THEN UPDATE public.users SET first_response_sent_at = NOW() WHERE id = p_user_id AND first_response_sent_at IS NULL;
    WHEN 'activated' THEN UPDATE public.users SET activation_completed_at = NOW(), is_activated = TRUE WHERE id = p_user_id AND is_activated = FALSE;
  END CASE;
  INSERT INTO public.analytics_events (user_id, event_type, metadata) VALUES (p_user_id, p_event_type, p_metadata);
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.activation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own activation events" ON public.activation_events FOR ALL USING (auth.uid() = user_id);
