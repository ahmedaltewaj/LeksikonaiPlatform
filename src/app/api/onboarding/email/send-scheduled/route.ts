import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail, renderOnboardingEmail, type OnboardingEmailType } from '@/lib/email'

// Days after signup for each email
const EMAIL_SCHEDULE: Record<OnboardingEmailType, number> = {
  welcome: 0,
  setup_complete: 0,
  day2_followup: 2,
  day1_tips: 1,
  day3_checkin: 3,
  day7_stats: 7,
  day14_activation: 14,
  day30_nps: 30
}

const EMAIL_SUBJECTS: Record<OnboardingEmailType, string> = {
  welcome: 'Velkommen til Leksikon.ai – Din AI-assistent er klar!',
  setup_complete: 'Din første AI-respons er klar',
  day2_followup: 'Dag 2 med Leksikon.ai – Hvordan går det?',
  day1_tips: '3 tips til bedre AI-respons',
  day3_checkin: 'Hvordan klarer du dig?',
  day7_stats: 'Din første uge med Leksikon.ai',
  day14_activation: 'Du er nu en pro – udvid dit setup',
  day30_nps: 'Hvor sandsynligt er det, at du vil anbefale os?'
}

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const emailType = searchParams.get('type') as OnboardingEmailType | null

  if (!emailType || !EMAIL_SCHEDULE[emailType]) {
    return NextResponse.json(
      { error: 'Invalid or missing email type parameter' },
      { status: 400 }
    )
  }

  const supabase = await createSupabaseServerClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Calculate date range for this email type
  const daysAgo = EMAIL_SCHEDULE[emailType]
  const startDate = new Date(Date.now() - (daysAgo + 1) * 24 * 60 * 60 * 1000).toISOString()
  const endDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

  // Find users who signed up within this window and haven't received this email yet
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, name, company_name, created_at, metadata')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  if (error) {
    console.error(`Failed to fetch users for ${emailType} email:`, error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping scheduled emails')
    return NextResponse.json({ success: true, message: 'Email not configured, skipped', sentCount: 0, failedCount: 0 })
  }

  let sentCount = 0
  let failedCount = 0
  const metadataField = `${emailType}_email_sent_at`

  for (const user of users || []) {
    try {
      // Skip if email already sent
      const userMetadata = (user.metadata || {}) as Record<string, unknown>
      if (userMetadata[metadataField]) {
        continue
      }

      const recipientName = user.name || user.email.split('@')[0]
      const companyName = (userMetadata.company_name as string) || user.company_name || 'din virksomhed'

      const emailHtml = renderOnboardingEmail({
        type: emailType,
        recipientEmail: user.email,
        recipientName,
        companyName,
        dashboardUrl: `${appUrl}/dashboard`
      })

      await sendEmail({
        to: user.email,
        subject: EMAIL_SUBJECTS[emailType],
        html: emailHtml
      })

      // Mark email as sent in user metadata
      await supabase
        .from('users')
        .update({
          metadata: { ...userMetadata, [metadataField]: new Date().toISOString() }
        })
        .eq('id', user.id)

      sentCount++
    } catch (emailError) {
      console.error(`Failed to send ${emailType} email to ${user.email}:`, emailError)
      failedCount++
    }
  }

  return NextResponse.json({
    success: true,
    message: `${emailType} emails processed: ${sentCount} sent, ${failedCount} failed`,
    sentCount,
    failedCount,
    emailType,
    daysAfterSignup: daysAgo
  })
}