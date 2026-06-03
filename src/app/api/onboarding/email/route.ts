import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, renderOnboardingEmail } from '@/lib/email'
import { z } from 'zod'

const onboardingEmailSchema = z.object({
  type: z.enum(['welcome', 'setup_complete', 'day2_followup', 'day1_tips', 'day3_checkin', 'day7_stats', 'day14_activation', 'day30_nps']),
  recipientEmail: z.string().email(),
  recipientName: z.string().min(1),
  companyName: z.string().min(1),
  dashboardUrl: z.string().url().optional().default('http://localhost:3000/dashboard')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = onboardingEmailSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { type, recipientEmail, recipientName, companyName, dashboardUrl } = parsed.data

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email send')
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const emailHtml = renderOnboardingEmail({
      type,
      recipientEmail,
      recipientName,
      companyName,
      dashboardUrl
    })

    const emailSubjects: Record<string, string> = {
      welcome: 'Velkommen til Leksikon.ai – Din AI-assistent er klar!',
      setup_complete: 'Din første AI-respons er klar',
      day2_followup: 'Dag 2 med Leksikon.ai – Hvordan går det?',
      day1_tips: '3 tips til bedre AI-respons',
      day3_checkin: 'Hvordan klarer du dig?',
      day7_stats: 'Din første uge med Leksikon.ai',
      day14_activation: 'Du er nu en pro – udvid dit setup',
      day30_nps: 'Hvor sandsynligt er det, at du vil anbefale os?'
    }

    await sendEmail({
      to: recipientEmail,
      subject: emailSubjects[type] || emailSubjects.welcome,
      html: emailHtml
    })

    return NextResponse.json({ 
      success: true,
      message: `Onboarding email (${type}) sent successfully`,
      recipient: recipientEmail
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to send onboarding email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}