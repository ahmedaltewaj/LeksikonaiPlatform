import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from './server'

/**
 * Authenticated user info returned by authenticateRequest
 */
export interface AuthenticatedUser {
  id: string
  email: string
}

/**
 * Result of authenticateRequest - either the user or a 401 response
 */
export type AuthResult =
  | { user: AuthenticatedUser; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> }
  | { error: NextResponse }

/**
 * Authenticate a request using Bearer token in Authorization header.
 * Returns the authenticated user or a 401 NextResponse.
 * 
 * Usage:
 *   const auth = await authenticateRequest(request)
 *   if ('error' in auth) return auth.error
 *   // use auth.user and auth.supabase
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 }),
    }
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 }),
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    supabase,
  }
}

/**
 * Verify that the authenticated user owns the specified resource.
 * Returns 403 if the user doesn't match.
 */
export async function verifyResourceOwnership(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  resourceUserId: string
): Promise<NextResponse | null> {
  if (userId !== resourceUserId) {
    return NextResponse.json(
      { error: 'Forbidden: You do not have permission to access this resource' },
      { status: 403 }
    )
  }
  return null
}

/**
 * Result of authorizeAdmin - either the authenticated user or a 403 response
 */
export type AdminResult =
  | { user: AuthenticatedUser; supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> }
  | { error: NextResponse }

/**
 * Verify the authenticated user has admin role.
 * Returns 403 if user is not an admin.
 *
 * Usage:
 *   const auth = await authorizeAdmin(request)
 *   if ('error' in auth) return auth.error
 *   // use auth.user and auth.supabase (user is guaranteed admin)
 */
export async function authorizeAdmin(
  request: NextRequest
): Promise<AdminResult> {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth

  const { data: userRecord, error: roleError } = await auth.supabase
    .from('users')
    .select('role')
    .eq('id', auth.user.id)
    .single()

  if (roleError || !userRecord || userRecord.role !== 'admin') {
    return {
      error: NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      ),
    }
  }

  return auth
}