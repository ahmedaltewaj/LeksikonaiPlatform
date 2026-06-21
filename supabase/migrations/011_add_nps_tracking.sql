-- Migration: 011_add_nps_tracking
-- Description: Add NPS tracking and trigger system

-- Create table to track NPS survey eligibility and history
CREATE TABLE IF NOT EXISTS public.nps_survey_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  survey_type TEXT NOT NULL CHECK (survey_type IN ('first_use', 'thirty_day', 'manual', 'milestone')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'completed', 'dismissed', 'expired')),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  responded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.nps_survey_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NPS triggers"
  ON public.nps_survey_triggers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NPS triggers"
  ON public.nps_survey_triggers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NPS triggers"
  ON public.nps_survey_triggers FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for efficient queries on user triggers
CREATE INDEX idx_nps_triggers_user_id ON public.nps_survey_triggers(user_id);
CREATE INDEX idx_nps_triggers_status ON public.nps_survey_triggers(status);
CREATE INDEX idx_nps_triggers_triggered_at ON public.nps_survey_triggers(triggered_at DESC);

-- Create view for NPS statistics
CREATE OR REPLACE VIEW public.nps_statistics AS
SELECT 
  COUNT(*) as total_responses,
  COUNT(CASE WHEN nps_score >= 9 THEN 1 END) as promoters,
  COUNT(CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 END) as passives,
  COUNT(CASE WHEN nps_score <= 6 THEN 1 END) as detractors,
  ROUND(
    (COUNT(CASE WHEN nps_score >= 9 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100) -
    (COUNT(CASE WHEN nps_score <= 6 THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100)
  , 2) as nps_score,
  COUNT(DISTINCT user_id) as unique_users
FROM nps_survey_triggers 
WHERE nps_score IS NOT NULL;

-- Create function to check if user is eligible for NPS survey
CREATE OR REPLACE FUNCTION public.can_trigger_nps_survey(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_pending BOOLEAN;
  v_has_recent BOOLEAN;
BEGIN
  -- Check if user has pending survey
  SELECT EXISTS(
    SELECT 1 FROM nps_survey_triggers 
    WHERE user_id = p_user_id 
    AND status = 'pending'
    AND triggered_at > NOW() - INTERVAL '7 days'
  ) INTO v_has_pending;
  
  IF v_has_pending THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user completed survey in last 90 days
  SELECT EXISTS(
    SELECT 1 FROM nps_survey_triggers 
    WHERE user_id = p_user_id 
    AND status = 'completed'
    AND responded_at > NOW() - INTERVAL '90 days'
  ) INTO v_has_recent;
  
  IF v_has_recent THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate user's NPS score
CREATE OR REPLACE FUNCTION public.get_user_nps_score(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'promoters', COUNT(CASE WHEN nps_score >= 9 THEN 1 END),
    'passives', COUNT(CASE WHEN nps_score BETWEEN 7 AND 8 THEN 1 END),
    'detractors', COUNT(CASE WHEN nps_score <= 6 THEN 1 END),
    'total', COUNT(*),
    'nps', ROUND(
      ((COUNT(CASE WHEN nps_score >= 9 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100) -
      ((COUNT(CASE WHEN nps_score <= 6 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100)
    , 2)
  )
  INTO v_result
  FROM nps_survey_triggers
  WHERE user_id = p_user_id 
  AND nps_score IS NOT NULL;
  
  RETURN COALESCE(v_result, jsonb_build_object('promoters', 0, 'passives', 0, 'detractors', 0, 'total', 0, 'nps', NULL));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;