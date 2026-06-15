import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const body = await request.json().catch(() => ({}))
    const surveyType = body.survey_type || 'manual'
    const periodDays = body.period_days || 30

    const { data: canTrigger, error: checkError } = await auth.supabase
      .rpc('can_trigger_nps_survey', { p_user_id: auth.user.id })

    if (checkError) {
      console.error('Error checking NPS eligibility:', checkError)
      return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
    }

    if (!canTrigger) {
      return NextResponse.json({ 
        error: 'Survey already pending or completed recently',
        eligible: false 
      }, { status: 200 })
    }

    const { data: trigger, error: insertError } = await auth.supabase
      .from('nps_survey_triggers')
      .insert({
        user_id: auth.user.id,
        survey_type: surveyType,
        status: 'pending',
        metadata: { period_days: periodDays }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating NPS trigger:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      data: trigger,
      eligible: true,
      message: 'NPS survey triggered successfully' 
    }, { status: 201 })
  } catch (error) {
    console.error('Error triggering NPS survey:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const { data: triggers, error: fetchError } = await auth.supabase
      .from('nps_survey_triggers')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('triggered_at', { ascending: false })
      .limit(10)

    if (fetchError) {
      console.error('Error fetching NPS triggers:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const { data: npsScore } = await auth.supabase.rpc('get_user_nps_score', { p_user_id: auth.user.id })

    return NextResponse.json({ 
      triggers: triggers || [],
      npsScore: npsScore
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching NPS data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}