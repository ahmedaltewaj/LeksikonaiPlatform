-- Migration: 021_add_user_segmentation
-- Description: Add user segmentation fields for analytics

-- Add industry field
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS industry TEXT
  CHECK (industry IN ('accounting', 'legal', 'real_estate', 'consulting', 'other'))
  DEFAULT 'other';

-- Add company_size field
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS company_size TEXT
  CHECK (company_size IN ('solo', 'small', 'medium'))
  DEFAULT 'solo';

-- Add region field
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT
  CHECK (region IN ('capital', 'zealand', 'funen', 'jutland_north', 'jutland_south', 'jutland_east'))
  DEFAULT 'capital';

-- Add acquisition_source field
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS acquisition_source TEXT
  CHECK (acquisition_source IN ('referral', 'organic', 'paid', 'word_of_mouth', 'other'))
  DEFAULT 'other';
