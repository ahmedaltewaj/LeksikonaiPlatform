import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(10),
  category: z.enum(['bug', 'feature', 'ux', 'pricing']),
  comment_text: z.string().max(500).optional(),
  nps_score: z.number().int().min(0).max(10).optional(),
  page_url: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = FeedbackSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

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

  const { rating, category, comment_text, nps_score, page_url } = parsed.data

  const { data: feedback, error: feedbackError } = await supabase
    .from('feedback')
    .insert({
      user_id: user.id,
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

  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_type: 'feedback_submitted',
    metadata: { feedback_id: feedback.id, category, rating },
  })

  return NextResponse.json({ data: feedback }, { status: 201 })
}