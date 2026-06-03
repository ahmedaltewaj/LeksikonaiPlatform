import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyName, industry, companySize, primaryLanguage, name, role, email } = body

    if (!companyName || !industry || !companySize || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const profileData = {
      company_name: companyName,
      industry,
      company_size: companySize,
      primary_language: primaryLanguage,
      name,
      role,
      onboarding_started_at: new Date().toISOString()
    }

    let userId: string | null = null

    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (user && !authError) {
        userId = user.id
      }
    }

    if (userId) {
      await supabase
        .from('users')
        .update({
          name,
          company_name: companyName,
          metadata: profileData
        })
        .eq('id', userId)

      try {
        await supabase.rpc('record_activation_event', {
          p_user_id: userId,
          p_event_type: 'onboarding_started',
          p_metadata: { companyName, industry, companySize }
        })
      } catch (e) {
        // best effort
      }
    } else if (email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        await supabase
          .from('users')
          .update({
            name,
            company_name: companyName,
            metadata: profileData
          })
          .eq('id', existingUser.id)

        try {
          await supabase.rpc('record_activation_event', {
            p_user_id: existingUser.id,
            p_event_type: 'onboarding_started',
            p_metadata: { companyName, industry, companySize }
          })
        } catch (e) {
          // best effort
        }
      }
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