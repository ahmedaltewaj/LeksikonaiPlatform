-- Migration: 006_add_feedback
-- Description: User feedback collection table matching the data model

-- Create enum types for category and status
CREATE TYPE feedback_category AS ENUM ('bug', 'feature', 'ux', 'pricing');
CREATE TYPE feedback_status AS ENUM ('new', 'reviewed', 'addressed', 'dismissed');

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  category feedback_category NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  comment_text TEXT CHECK (char_length(comment_text) <= 500),
  page_url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status feedback_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own feedback status"
  ON public.feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for efficient queries
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);