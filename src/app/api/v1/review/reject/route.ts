import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'

const RejectSchema = z.object({
  inquiryId: z.string().uuid(),
  userId: z.string().uuid(),
  reason: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = RejectSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { inquiryId, userId, reason } = parsed.data

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: inquiry } = await auth.supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { error: updateError } = await auth.supabase
    .from('responses')
    .update({
      status: 'rejected',
    })
    .eq('inquiry_id', inquiryId)
    .eq('user_id', userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const newRawContent = { ...(inquiry.raw_content || {}), rejection_reason: reason || null }

  await auth.supabase
    .from('inquiries')
    .update({
      status: 'archived',
      raw_content: newRawContent,
    })
    .eq('id', inquiryId)

  return NextResponse.json({ success: true })
}
