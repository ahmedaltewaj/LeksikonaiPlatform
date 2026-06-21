import { createBrowserClient } from '@supabase/ssr'
import type { UserRole } from './database.types'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export interface SessionUser {
  id: string
  email: string
  role?: UserRole
  email_verified_at?: string | null
  last_login_at?: string | null
}

export interface RBACPermissions {
  canManageUsers: boolean
  canViewAllUsers: boolean
  canDeleteUsers: boolean
  canAccessAdmin: boolean
}

export async function isAdmin(supabase: ReturnType<typeof createClient>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) return false
  return data.role === 'admin'
}

export async function getUserRole(supabase: ReturnType<typeof createClient>): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !data) return null
  return data.role as UserRole
}

export async function getUserProfile(supabase: ReturnType<typeof createClient>): Promise<SessionUser | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('users')
    .select('role, email_verified_at, last_login_at')
    .eq('id', user.id)
    .single()

  if (error || !data) return null

  return {
    id: user.id,
    email: user.email ?? '',
    role: data.role as UserRole | undefined,
    email_verified_at: data.email_verified_at,
    last_login_at: data.last_login_at,
  }
}

export async function getPermissions(supabase: ReturnType<typeof createClient>): Promise<RBACPermissions> {
  const role = await getUserRole(supabase)
  
  return {
    canManageUsers: role === 'admin',
    canViewAllUsers: role === 'admin',
    canDeleteUsers: role === 'admin',
    canAccessAdmin: role === 'admin',
  }
}

export async function requireAuth(supabase: ReturnType<typeof createClient>): Promise<SessionUser> {
  const profile = await getUserProfile(supabase)
  if (!profile) {
    throw new Error('Authentication required')
  }
  return profile
}

export async function requireAdmin(supabase: ReturnType<typeof createClient>): Promise<SessionUser> {
  const profile = await requireAuth(supabase)
  if (profile.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return profile
}