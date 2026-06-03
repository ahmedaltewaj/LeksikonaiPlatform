import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (user) {
      try {
        await supabase.rpc('record_activation_event', {
          p_user_id: user.id,
          p_event_type: 'onboarding_completed',
          p_metadata: { completed_at: new Date().toISOString() }
        })
      } catch {
        // best-effort
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
