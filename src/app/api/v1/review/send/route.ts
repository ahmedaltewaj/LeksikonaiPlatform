import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'

const SendSchema = z.object({
  inquiryId: z.string().uuid(),
  userId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = SendSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { inquiryId, userId } = parsed.data

  const supabase = await createSupabaseServerClient()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*, responses(*)')
    .eq('id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const response = inquiry.responses?.[0]
  if (!response) {
    return NextResponse.json({ error: 'Response not found' }, { status: 404 })
  }

  const textToSend = response.approved_text || response.ai_generated_text

  try {
    await sendEmail({
      to: inquiry.sender_email,
      subject: inquiry.subject || 'Response from Leksikon',
      html: `<p>${textToSend.replace(/\n/g, '<br>')}</p>`,
    })
  } catch (emailError) {
    console.error('Failed to send email:', emailError)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  await supabase
    .from('responses')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('inquiry_id', inquiryId)
    .eq('user_id', userId)

  await supabase
    .from('inquiries')
    .update({ status: 'sent' })
    .eq('id', inquiryId)

  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'response_sent',
    inquiry_id: inquiryId,
  })

  return NextResponse.json({ success: true })
}
