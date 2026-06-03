import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

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

    const { data: emailConfig, error: configError } = await supabase
      .from('email_configurations')
      .select('email_address, is_verified')
      .eq('user_id', user.id)
      .single()

    if (configError || !emailConfig) {
      return NextResponse.json({ error: 'Email configuration not found' }, { status: 400 })
    }

    if (!emailConfig.is_verified) {
      return NextResponse.json({ error: 'Please verify your email address first' }, { status: 400 })
    }

    const testEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">✅ Test email fra Leksikon.ai</h1>
        <p style="color: #666; font-size: 16px;">
          Dette er en test email for at verificere at din emailopsætning virker korrekt.
        </p>
        <p style="color: #666; font-size: 16px;">
          Hvis du modtager denne email, er alt opsat korrekt!
        </p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #888; font-size: 14px; margin: 0;">
            <strong>Din webhook URL:</strong> ${emailConfig.email_address}
          </p>
        </div>
      </div>
    `

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Email service not configured'
      }, { status: 503 })
    }

    await sendEmail({
      to: emailConfig.email_address,
      subject: 'Test email – Leksikon.ai',
      html: testEmailHtml
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Failed to send test email:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}