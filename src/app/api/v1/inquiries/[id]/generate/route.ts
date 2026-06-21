import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'
import { generateDanishResponse } from '@/lib/gemini/client'

const RequestSchema = z.object({
  userId: z.string().uuid(),
  tone: z.enum(['professional', 'friendly']).optional().default('professional'),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { id: inquiryId } = await params
  const { userId, tone } = parsed.data

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: inquiry, error: inquiryError } = await auth.supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (inquiryError || !inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const { data: existingResponse } = await auth.supabase
    .from('responses')
    .select('id')
    .eq('inquiry_id', inquiryId)
    .eq('user_id', userId)
    .single()

  if (existingResponse) {
    return NextResponse.json({ error: 'Response already exists for this inquiry' }, { status: 409 })
  }

  let aiResponse: string
  try {
    aiResponse = await generateDanishResponse(
      { senderName: inquiry.sender_name || 'Customer', body: inquiry.body_text },
      userId,
      tone
    )
  } catch (aiError) {
    console.error('AI generation failed:', aiError)
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    )
  }

  const { data: response, error: responseError } = await auth.supabase
    .from('responses')
    .insert({
      inquiry_id: inquiryId,
      user_id: userId,
      ai_generated_text: aiResponse,
      status: 'draft',
    })
    .select()
    .single()

  if (responseError) {
    return NextResponse.json({ error: responseError.message }, { status: 500 })
  }

  await auth.supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'response_generated',
    inquiry_id: inquiryId,
    metadata: { response_id: response.id, tone },
  })

  return NextResponse.json({ data: { inquiry, response } }, { status: 201 })
}
