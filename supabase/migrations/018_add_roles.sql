-- Migration: 018_add_roles
-- Description: Add roles for RBAC - admin and user roles

-- Create enum type for roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Add role column to users table (default to 'user')
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Create policy: admins can view all users, users can only view themselves
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR auth.uid() = id
  );

-- Create policy: only admins can update other users, users can update themselves
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR auth.uid() = id
  );

-- Create policy: only admins can insert users
CREATE POLICY "Only admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
    OR auth.uid() = id
  );

-- Create policy: admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
