-- Migration: 011_make_inquiries_user_id_nullable
-- Description: Allow user_id to be NULL for anonymous inbound inquiries

ALTER TABLE public.inquiries ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous inquiries (NULL user_id) to be viewed
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
CREATE POLICY "Users can view their own inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous inquiries to be inserted
DROP POLICY IF EXISTS "Users can insert their own inquiries" ON public.inquiries;
CREATE POLICY "Users can insert their own inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow anonymous inquiries to be updated
DROP POLICY IF EXISTS "Users can update their own inquiries" ON public.inquiries;
CREATE POLICY "Users can update their own inquiries"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);
