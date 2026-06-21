import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/supabase/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request)
    if ('error' in auth) return auth.error

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const getCount = (table: string, filters: Record<string, unknown> = {}) => {
      return auth.supabase.from(table).select('*', { count: 'exact', head: true }).then(r => r.count || 0)
    }

    const [totalSignups, emailVerified, onboardingStarted, onboardingCompleted, firstResponseSent, activated] = await Promise.all([
      getCount('users'),
      getCount('users', { not: { email_verified_at: null } }),
      getCount('users', { not: { onboarding_started_at: null } }),
      getCount('users', { not: { onboarding_completed_at: null } }),
      getCount('users', { not: { first_response_sent_at: null } }),
      getCount('users', { eq: { is_activated: true } })
    ])

    const funnel = [
      { stage: 'Signups', count: totalSignups, target: 100 },
      { stage: 'Email Verified', count: emailVerified, target: 70 },
      { stage: 'Onboarding Started', count: onboardingStarted, target: 50 },
      { stage: 'Onboarding Completed', count: onboardingCompleted, target: 35 },
      { stage: 'First Response Sent', count: firstResponseSent, target: 25 },
      { stage: 'Activated', count: activated, target: 20 }
    ]

    const cohortData = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      
      const total = await auth.supabase.from('users').select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString()).lt('created_at', weekEnd.toISOString()).then(r => r.count || 0)
      const activatedCount = await auth.supabase.from('users').select('*', { count: 'exact', head: true })
        .eq('is_activated', true).gte('activation_completed_at', weekStart.toISOString())
        .lt('activation_completed_at', weekEnd.toISOString()).then(r => r.count || 0)

      cohortData.push({ period: `Week ${i + 1}`, total, activated: activatedCount, rate: total ? Math.round(activatedCount / total * 100) : 0 })
    }

    const [dau, wau, mau] = await Promise.all([
      getCount('analytics_events', { gte: { created_at: oneDayAgo.toISOString() } }),
      getCount('analytics_events', { gte: { created_at: sevenDaysAgo.toISOString() } }),
      getCount('analytics_events', { gte: { created_at: thirtyDaysAgo.toISOString() } })
    ])

    const { data: timeToResponse } = await auth.supabase.from('users')
      .select('first_inquiry_received_at, first_response_sent_at')
      .not('first_inquiry_received_at', 'is', null).not('first_response_sent_at', 'is', null)

    let avgTimeToFirstResponse: number | null = null
    if (timeToResponse && timeToResponse.length > 0) {
      const totalMs = timeToResponse.reduce((acc, row) => {
        return acc + (new Date(row.first_response_sent_at!).getTime() - new Date(row.first_inquiry_received_at!).getTime())
      }, 0)
      avgTimeToFirstResponse = Math.round(totalMs / timeToResponse.length / 60000)
    }

    const [totalResponses, approvedResponses] = await Promise.all([
      getCount('analytics_events', { eq: { event_type: 'response_sent' } }),
      getCount('analytics_events', { eq: { event_type: 'response_approved' } })
    ])

    const approvalRate = totalResponses ? Math.round(approvedResponses / totalResponses * 100) : null

    const npsTrends = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)

      const { data: npsData } = await auth.supabase.from('feedback').select('nps_score')
        .not('nps_score', 'is', null).gte('created_at', weekStart.toISOString()).lt('created_at', weekEnd.toISOString())

      if (npsData && npsData.length > 0) {
        const promoters = npsData.filter(f => (f.nps_score || 0) >= 9).length
        const passives = npsData.filter(f => (f.nps_score || 0) >= 7 && (f.nps_score || 0) < 9).length
        const detractors = npsData.filter(f => (f.nps_score || 0) < 7).length
        npsTrends.push({ period: `Week ${i + 1}`, nps: Math.round((promoters - detractors) / npsData.length * 100), promoters, passives, detractors, total: npsData.length })
      } else {
        npsTrends.push({ period: `Week ${i + 1}`, nps: null, promoters: 0, passives: 0, detractors: 0, total: 0 })
      }
    }

    const { data: allNps } = await auth.supabase.from('feedback').select('nps_score').not('nps_score', 'is', null)
    let overallNps: { nps: number | null; promoters: number; passives: number; detractors: number; total: number } | null = null
    if (allNps && allNps.length > 0) {
      const promoters = allNps.filter(f => (f.nps_score || 0) >= 9).length
      const passives = allNps.filter(f => (f.nps_score || 0) >= 7 && (f.nps_score || 0) < 9).length
      const detractors = allNps.filter(f => (f.nps_score || 0) < 7).length
      overallNps = { nps: Math.round((promoters - detractors) / allNps.length * 100), promoters, passives, detractors, total: allNps.length }
    }

    return NextResponse.json({
      funnel,
      cohortData: cohortData.reverse(),
      engagement: { dau, wau, mau, avgTimeToFirstResponse, approvalRate },
      npsTrends: npsTrends.reverse(),
      overallNps,
      generatedAt: now.toISOString()
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
