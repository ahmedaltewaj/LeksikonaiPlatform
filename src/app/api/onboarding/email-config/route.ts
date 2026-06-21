import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'

const emailConfigSchema = z.object({
  email_address: z.string().email(),
  email_provider: z.enum(['gmail', 'outlook', 'imap']),
  webhook_url: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const { data, error } = await auth.supabase
      .from('email_configurations')
      .select('*')
      .eq('user_id', auth.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching email config:', error)
      return NextResponse.json({ error: 'Failed to fetch email configuration' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: data || null
    })
  } catch (error) {
    console.error('Failed to fetch email config:', error)
    return NextResponse.json({ error: 'Failed to fetch email configuration' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const body = await request.json()
    const parsed = emailConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email_address, email_provider, webhook_url } = parsed.data

    const { data: existing } = await auth.supabase
      .from('email_configurations')
      .select('id')
      .eq('user_id', auth.user.id)
      .single()

    if (existing) {
      const { error: updateError } = await auth.supabase
        .from('email_configurations')
        .update({
          email_address,
          email_provider,
          webhook_url,
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', auth.user.id)

      if (updateError) {
        console.error('Error updating email config:', updateError)
        return NextResponse.json({ error: 'Failed to update email configuration' }, { status: 500 })
      }
    } else {
      const { error: insertError } = await auth.supabase
        .from('email_configurations')
        .insert({
          user_id: auth.user.id,
          email_address,
          email_provider,
          webhook_url,
          status: 'pending'
        })

      if (insertError) {
        console.error('Error inserting email config:', insertError)
        return NextResponse.json({ error: 'Failed to create email configuration' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email configuration saved'
    })
  } catch (error) {
    console.error('Failed to save email config:', error)
    return NextResponse.json({ error: 'Failed to save email configuration' }, { status: 500 })
  }
}