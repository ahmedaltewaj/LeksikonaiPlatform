import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('http://localhost:54321', 'mock-anon-key')

export function getServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key'
  return createClient(url, key)
}
