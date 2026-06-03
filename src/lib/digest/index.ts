import { createSupabaseServerClient } from '../supabase/server'

export interface DigestStats {
  totalSubmissions: number
  avgRating: number
  npsScore: number
  categoryBreakdown: { bug: number; feature: number; ux: number; pricing: number }
  responseRate: number
}

export interface DigestItem {
  id: string
  category: 'bug' | 'feature' | 'ux' | 'pricing'
  rating: number
  commentText: string | null
  pageUrl: string
  metadata: Record<string, unknown>
  createdAt: string
  isUrgent: boolean
}

export interface DigestData {
  periodStart: Date
  periodEnd: Date
  stats: DigestStats
  items: DigestItem[]
  escalatedItems: DigestItem[]
}

export interface DigestQueryResult {
  id: string
  category: 'bug' | 'feature' | 'ux' | 'pricing'
  rating: number
  comment_text: string | null
  page_url: string
  metadata: Record<string, unknown>
  created_at: string
}

export async function getFeedbackForPeriod(
  startDate: Date,
  endDate: Date
): Promise<DigestQueryResult[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('id, category, rating, comment_text, page_url, metadata, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch feedback:', error)
    throw error
  }

  return data || []
}

export async function computeDigestStats(
  startDate: Date,
  endDate: Date
): Promise<DigestStats> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('feedback')
    .select('rating, nps_score, comment_text, category')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (error) {
    console.error('Failed to compute digest stats:', error)
    throw error
  }

  const feedbacks = data || []
  const totalSubmissions = feedbacks.length

  if (totalSubmissions === 0) {
    return {
      totalSubmissions: 0,
      avgRating: 0,
      npsScore: 0,
      categoryBreakdown: { bug: 0, feature: 0, ux: 0, pricing: 0 },
      responseRate: 0
    }
  }

  const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalSubmissions

  const npsScores = feedbacks.map(f => f.nps_score).filter((s): s is number => s !== null)
  const npsScore = npsScores.length > 0
    ? Math.round(npsScores.reduce((sum, s) => sum + s, 0) / npsScores.length)
    : 0

  const categoryBreakdown = { bug: 0, feature: 0, ux: 0, pricing: 0 }
  for (const f of feedbacks) {
    if (f.category in categoryBreakdown) {
      categoryBreakdown[f.category as keyof typeof categoryBreakdown]++
    }
  }

  const withComment = feedbacks.filter(f => f.comment_text && f.comment_text.trim().length > 0).length
  const responseRate = Math.round((withComment / totalSubmissions) * 100)

  return {
    totalSubmissions,
    avgRating: Math.round(avgRating * 10) / 10,
    npsScore,
    categoryBreakdown,
    responseRate
  }
}

export function buildDigestData(
  periodStart: Date,
  periodEnd: Date,
  feedbacks: DigestQueryResult[],
  stats: DigestStats
): DigestData {
  const items: DigestItem[] = feedbacks.map(f => ({
    id: f.id,
    category: f.category,
    rating: f.rating,
    commentText: f.comment_text,
    pageUrl: f.page_url,
    metadata: f.metadata || {},
    createdAt: f.created_at,
    isUrgent: f.rating <= 3
  }))

  const escalatedItems = items.filter(i => i.isUrgent)

  return { periodStart, periodEnd, stats, items, escalatedItems }
}

export function getWeekBoundary(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  const start = new Date(date)
  start.setDate(date.getDate() + diffToMonday)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}