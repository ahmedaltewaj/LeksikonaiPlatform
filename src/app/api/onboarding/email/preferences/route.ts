import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'

const preferencesSchema = z.object({
  email_welcome_enabled: z.boolean().optional().default(true),
  email_setup_complete_enabled: z.boolean().optional().default(true),
  email_day1_tips_enabled: z.boolean().optional().default(true),
  email_day2_followup_enabled: z.boolean().optional().default(true),
  email_day3_checkin_enabled: z.boolean().optional().default(true),
  email_day7_stats_enabled: z.boolean().optional().default(true),
  email_day14_activation_enabled: z.boolean().optional().default(true),
  email_day30_nps_enabled: z.boolean().optional().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const { data: userRecord } = await auth.supabase
      .from('users')
      .select('metadata')
      .eq('id', auth.user.id)
      .single()

    const metadata = (userRecord?.metadata || {}) as Record<string, boolean>
    const preferences = {
      email_welcome_enabled: metadata.email_welcome_enabled ?? true,
      email_setup_complete_enabled: metadata.email_setup_complete_enabled ?? true,
      email_day1_tips_enabled: metadata.email_day1_tips_enabled ?? true,
      email_day2_followup_enabled: metadata.email_day2_followup_enabled ?? true,
      email_day3_checkin_enabled: metadata.email_day3_checkin_enabled ?? true,
      email_day7_stats_enabled: metadata.email_day7_stats_enabled ?? true,
      email_day14_activation_enabled: metadata.email_day14_activation_enabled ?? true,
      email_day30_nps_enabled: metadata.email_day30_nps_enabled ?? true,
    }

    return NextResponse.json({ success: true, data: preferences })
  } catch (error) {
    console.error('Failed to fetch email preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const body = await request.json()
    const parsed = preferencesSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { data: userRecord } = await auth.supabase
      .from('users')
      .select('metadata')
      .eq('id', auth.user.id)
      .single()

    const currentMetadata = (userRecord?.metadata || {}) as Record<string, unknown>
    const updates = parsed.data

    const { error: updateError } = await auth.supabase
      .from('users')
      .update({ metadata: { ...currentMetadata, ...updates } })
      .eq('id', auth.user.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update email preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
