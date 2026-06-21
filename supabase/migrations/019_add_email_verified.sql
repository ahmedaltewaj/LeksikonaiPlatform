-- Migration: 019_add_email_verified
-- Description: Add email verification tracking and metadata

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update last_login_at
DROP TRIGGER IF EXISTS on_auth_user_login ON public.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_login();
