import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createSupabaseServerClient()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: eligibleUsers, error: userError } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .lte('created_at', (new Date(thirtyDaysAgo.getTime() + 86400000)).toISOString())

    if (userError) {
      console.error('Error fetching eligible users:', userError)
      return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
    }

    const results = []
    for (const user of eligibleUsers || []) {
      const { data: canTrigger } = await supabase.rpc('can_trigger_nps_survey', { p_user_id: user.id })
      
      if (canTrigger) {
        const { data: trigger } = await supabase
          .from('nps_survey_triggers')
          .insert({
            user_id: user.id,
            survey_type: 'thirty_day',
            status: 'pending',
            metadata: { triggered_by: 'cron', eligible_since: thirtyDaysAgo.toISOString() }
          })
          .select()
          .single()
        
        results.push({ user_id: user.id, triggered: !!trigger })
      } else {
        results.push({ user_id: user.id, triggered: false, reason: 'not_eligible' })
      }
    }

    return NextResponse.json({ 
      message: `Processed ${results.length} users`,
      results 
    }, { status: 200 })
  } catch (error) {
    console.error('Error in NPS eligibility check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}