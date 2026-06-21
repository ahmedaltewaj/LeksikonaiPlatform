-- Migration: 023_fix_nps_eligibility_n_plus_1
-- Description: Add batch eligibility check function and fix N+1 query in NPS eligibility check

-- Create batch function to check NPS eligibility for multiple users at once
-- This replaces the N+1 query pattern where can_trigger_nps_survey was called per user
CREATE OR REPLACE FUNCTION public.can_trigger_nps_survey_batch(p_user_ids UUID[])
RETURNS TABLE(user_id UUID, can_trigger BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  WITH user_trigger_counts AS (
    -- Get pending and recent completed counts for all users in one query
    SELECT 
      u.id as user_id,
      COUNT(CASE WHEN nst.status = 'pending' AND nst.triggered_at > NOW() - INTERVAL '7 days' THEN 1 END) as pending_count,
      COUNT(CASE WHEN nst.status = 'completed' AND nst.responded_at > NOW() - INTERVAL '90 days' THEN 1 END) as recent_completed_count
    FROM unnest(p_user_ids) AS u(id)
    LEFT JOIN nps_survey_triggers nst ON nst.user_id = u.id
    GROUP BY u.id
  )
  SELECT 
    utc.user_id,
    (utc.pending_count = 0 AND utc.recent_completed_count = 0) as can_trigger
  FROM user_trigger_counts utc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster batch lookups
CREATE INDEX IF NOT EXISTS idx_nps_triggers_user_status_triggered 
ON public.nps_survey_triggers(user_id, status, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_nps_triggers_user_status_responded 
ON public.nps_survey_triggers(user_id, status, responded_at DESC);
