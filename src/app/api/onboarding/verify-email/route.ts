import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const verifyEmailSchema = z.object({
  email_address: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = verifyEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email_address } = parsed.data

    const verification_token = randomBytes(32).toString('hex')

    const { data: existingConfig } = await supabase
      .from('email_configurations')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!existingConfig) {
      return NextResponse.json({ error: 'Email configuration not found. Please save email config first.' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('email_configurations')
      .update({
        verification_token,
        verification_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating verification token:', updateError)
      return NextResponse.json({ error: 'Failed to store verification token' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/api/onboarding/verify-email?token=${verification_token}`

    const verificationHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Verificer din email</h1>
        <p style="color: #666; font-size: 16px;">
          Klik på linket herunder for at verificere din emailadresse:
        </p>
        <a href="${verifyUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verificer email
        </a>
        <p style="color: #999; font-size: 14px;">
          Linket udløber om 24 timer.
        </p>
      </div>
    `

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping verification email')
      return NextResponse.json({
        success: true,
        message: 'Verification email would be sent (email service not configured)',
        debug_url: verifyUrl
      })
    }

    await sendEmail({
      to: email_address,
      subject: 'Verificer din email – Leksikon.ai',
      html: verificationHtml
    })

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      debug_url: process.env.NODE_ENV === 'development' ? verifyUrl : undefined
    })
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Invalid verification link' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    const { data, error } = await supabase
      .from('email_configurations')
      .select('user_id, email_address')
      .eq('verification_token', token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('email_configurations')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        verification_token: null,
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('verification_token', token)

    if (updateError) {
      console.error('Error updating verification status:', updateError)
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/dashboard/settings/email?verified=true', request.url))
  } catch (error) {
    console.error('Failed to verify email:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}