import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ApproveSchema = z.object({
  inquiryId: z.string().uuid(),
  userId: z.string().uuid(),
  approvedText: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = ApproveSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { inquiryId, userId, approvedText } = parsed.data

  const supabase = await createSupabaseServerClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('id, user_id')
    .eq('id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: response } = await supabase
    .from('responses')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (!response) {
    return NextResponse.json({ error: 'Response not found' }, { status: 404 })
  }

  const newStatus = approvedText && approvedText !== response.ai_generated_text ? 'edited' : 'approved'
  const textToUse = approvedText || response.ai_generated_text

  const { error: updateError } = await supabase
    .from('responses')
    .update({
      status: newStatus,
      approved_text: textToUse,
    })
    .eq('inquiry_id', inquiryId)
    .eq('user_id', userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await supabase
    .from('inquiries')
    .update({ status: 'reviewed' })
    .eq('id', inquiryId)

  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: newStatus === 'edited' ? 'response_edited' : 'response_approved',
    inquiry_id: inquiryId,
  })

  return NextResponse.json({ success: true, status: newStatus })
}
