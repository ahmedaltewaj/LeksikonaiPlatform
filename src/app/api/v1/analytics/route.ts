import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const period = searchParams.get('period') || '30d'

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Calculate date range
  const now = new Date()
  let startDate: Date
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }

  const { data: inquiries, error: inquiriesError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .gte('received_at', startDate.toISOString())

  if (inquiriesError) {
    return NextResponse.json({ error: inquiriesError.message }, { status: 500 })
  }

  const inquiryIds = inquiries?.map(i => i.id) || []

  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*')
    .in('inquiry_id', inquiryIds)
    .eq('user_id', userId)

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 })
  }

  // Calculate metrics
  const totalInquiries = inquiries?.length || 0
  const sentResponses = responses?.filter(r => r.status === 'sent').length || 0
  const approvalRate = totalInquiries > 0 ? Math.round((sentResponses / totalInquiries) * 100) : 0

  // Avg response time (seconds between inquiry received and response sent)
  const responseTimes = responses
    ?.filter(r => r.sent_at && r.status === 'sent')
    .map(r => {
      const inquiry = inquiries?.find(i => i.id === r.inquiry_id)
      if (!inquiry || !r.sent_at) return null
      const received = new Date(inquiry.received_at).getTime()
      const sent = new Date(r.sent_at).getTime()
      return Math.round((sent - received) / (1000 * 60)) // minutes
    })
    .filter((t): t is number => t !== null)

  const avgResponseTime = responseTimes && responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  // Daily breakdown for chart
  const dailyCounts: Record<string, { date: string; inquiries: number; sent: number }> = {}
  inquiries?.forEach(inquiry => {
    const date = new Date(inquiry.received_at).toISOString().split('T')[0]
    if (!dailyCounts[date]) {
      dailyCounts[date] = { date, inquiries: 0, sent: 0 }
    }
    dailyCounts[date].inquiries++
    if (inquiry.status === 'sent') {
      dailyCounts[date].sent++
    }
  })

  const dailyData = Object.values(dailyCounts)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14) // last 14 days

  return NextResponse.json({
    data: {
      totalInquiries,
      sentResponses,
      approvalRate,
      avgResponseTime, // minutes
      dailyData,
    }
  })
}