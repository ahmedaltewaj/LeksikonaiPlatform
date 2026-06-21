import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const body = await request.json()
    const { companyName, industry, companySize, primaryLanguage, name, role, email } = body

    if (!companyName || !industry || !companySize || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const profileData = {
      company_name: companyName,
      industry,
      company_size: companySize,
      primary_language: primaryLanguage,
      name,
      role,
      onboarding_started_at: new Date().toISOString()
    }

    await auth.supabase
      .from('users')
      .update({
        name,
        company_name: companyName,
        metadata: profileData
      })
      .eq('id', auth.user.id)

    try {
      await auth.supabase.rpc('record_activation_event', {
        p_user_id: auth.user.id,
        p_event_type: 'onboarding_started',
        p_metadata: { companyName, industry, companySize }
      })
    } catch (e) {
      // best effort
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}