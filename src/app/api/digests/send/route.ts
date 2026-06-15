import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { authorizeAdmin } from '@/lib/supabase/auth'
import { getFeedbackForPeriod, computeDigestStats, buildDigestData, getWeekBoundary, type DigestData } from '@/lib/digest'
import { renderWeeklyDigest, sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request)
    if ('error' in auth) return auth.error

    const body = await request.json().catch(() => ({}))
    const source = body.source || 'manual'

    const { start, end } = getWeekBoundary()
    const periodStart = body.periodStart ? new Date(body.periodStart) : start
    const periodEnd = body.periodEnd ? new Date(body.periodEnd) : end

    const feedbacks = await getFeedbackForPeriod(periodStart, periodEnd)
    const stats = await computeDigestStats(periodStart, periodEnd)
    const digestData: DigestData = buildDigestData(periodStart, periodEnd, feedbacks, stats)

    const { data: recipients, error: recipientError } = await auth.supabase
      .from('digest_recipients')
      .select('id, email, name, role')
      .eq('active', true)

    if (recipientError) {
      console.error('Failed to fetch digest recipients:', recipientError)
      return NextResponse.json(
        { error: 'Failed to fetch digest recipients' },
        { status: 500 }
      )
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ message: 'No active digest recipients found', sent: 0, stats })
    }

    const digestHtml = renderWeeklyDigest(digestData)
    const weekStr = periodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    let sentCount = 0
    const digestLogEntries = []

    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: `Weekly Feedback Digest · ${weekStr}`,
          html: digestHtml
        })

        const { data: logEntry, error: logError } = await auth.supabase
          .from('digest_logs')
          .insert({
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            total_inquiries: feedbacks.length,
            recipient_id: recipient.id,
            status: 'sent',
            subject: `Weekly Feedback Digest`
          })
          .select()
          .single()

        if (!logError && logEntry) {
          digestLogEntries.push(logEntry)
        }

        sentCount++
      } catch (err) {
        console.error(`Failed to send digest to ${recipient.email}:`, err)
        await auth.supabase.from('digest_logs').insert({
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          total_inquiries: feedbacks.length,
          recipient_id: recipient.id,
          status: 'failed'
        })
      }
    }

    return NextResponse.json({
      message: `Digest sent to ${sentCount} recipients`,
      sent: sentCount,
      total: recipients.length,
      stats,
      source,
      digestLogs: digestLogEntries
    })
  } catch (error) {
    console.error('Error sending digest:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}