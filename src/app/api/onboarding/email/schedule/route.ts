import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, renderOnboardingEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

  const { data: subscribers, error } = await supabase
    .from('subscribers')
    .select('id, email, metadata, created_at')
    .eq('status', 'active')
    .gte('created_at', threeDaysAgo)
    .lte('created_at', twoDaysAgo)

  if (error) {
    console.error('Failed to fetch subscribers for day-2 email:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping day-2 email sends')
    return NextResponse.json({ success: true, message: 'Email not configured, skipped', sentCount: 0, failedCount: 0 })
  }

  let sentCount = 0
  let failedCount = 0

  for (const subscriber of subscribers || []) {
    try {
      const metadata = (subscriber.metadata || {}) as Record<string, unknown>
      const recipientName = (metadata.onboarding_name as string) || subscriber.email.split('@')[0]
      const companyName = (metadata.company_name as string) || 'din virksomhed'

      const emailHtml = renderOnboardingEmail({
        type: 'day2_followup',
        recipientEmail: subscriber.email,
        recipientName,
        companyName,
        dashboardUrl: `${appUrl}/dashboard`
      })

      await sendEmail({
        to: subscriber.email,
        subject: 'Dag 2 med Leksikon.ai – Hvordan går det?',
        html: emailHtml
      })

      await supabase
        .from('subscribers')
        .update({ 
          metadata: { ...metadata, day2_email_sent_at: new Date().toISOString() }
        })
        .eq('id', subscriber.id)

      sentCount++
    } catch (emailError) {
      console.error(`Failed to send day-2 email to ${subscriber.email}:`, emailError)
      failedCount++
    }
  }

  return NextResponse.json({
    success: true,
    message: `Day-2 followup emails processed: ${sentCount} sent, ${failedCount} failed`,
    sentCount,
    failedCount
  })
}