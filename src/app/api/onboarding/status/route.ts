import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const { data: userRecord } = await auth.supabase
      .from('users')
      .select('onboarding_completed_at, email_verified_at')
      .eq('id', auth.user.id)
      .single()

    const isOnboardingCompleted = !!userRecord?.onboarding_completed_at

    return NextResponse.json({
      success: true,
      data: {
        isOnboardingCompleted,
        onboardingCompletedAt: userRecord?.onboarding_completed_at,
      }
    })
  } catch (error) {
    console.error('Onboarding status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}