import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(10),
  category: z.enum(['bug', 'feature', 'ux', 'pricing']),
  comment_text: z.string().max(500).optional(),
  nps_score: z.number().int().min(0).max(10).optional(),
  page_url: z.string(),
})

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = FeedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const { rating, category, comment_text, nps_score, page_url } = parsed.data

  const { data: feedback, error: feedbackError } = await auth.supabase
    .from('feedback')
    .insert({
      user_id: auth.user.id,
      rating,
      category,
      comment_text,
      nps_score,
      page_url,
      status: 'new',
    })
    .select()
    .single()

  if (feedbackError) {
    return NextResponse.json({ error: feedbackError.message }, { status: 500 })
  }

  await auth.supabase.from('analytics_events').insert({
    user_id: auth.user.id,
    event_type: 'feedback_submitted',
    metadata: { feedback_id: feedback.id, category, rating },
  })

  return NextResponse.json({ data: feedback }, { status: 201 })
}