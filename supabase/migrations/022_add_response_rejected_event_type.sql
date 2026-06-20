-- Migration: 022_add_response_rejected_event_type
-- Description: Add response_rejected event type to analytics_events for reject workflow
-- Issue: LEKAA-287 Database schema fix - response_rejected was used in API but missing from DB

ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_event_type_check
CHECK (event_type IN (
  'inquiry_received',
  'response_generated',
  'response_approved',
  'response_edited',
  'response_sent',
  'response_rejected',
  'onboarding_started',
  'onboarding_completed',
  'first_inquiry_received',
  'first_response_sent'
));