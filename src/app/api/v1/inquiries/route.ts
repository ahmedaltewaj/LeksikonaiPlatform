import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/client'
import { generateDanishResponse } from '@/lib/gemini/client'

const RequestSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'sent', 'archived']).optional(),
  source: z.enum(['email', 'web_form', 'webhook']).optional(),
  senderEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  subject: z.string().optional(),
  bodyText: z.string().min(1),
  rawContent: z.record(z.string(), z.unknown()).optional(),
  webhookMessageId: z.string().optional(),
})

const ResponseSchema = z.object({
  inquiryId: z.string().uuid(),
  action: z.enum(['approve', 'edit', 'send']),
  approvedText: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServerClient()
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  let query = supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .order('received_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const supabase = getServerClient()
  const { userId, source, senderEmail, senderName, subject, bodyText, rawContent, webhookMessageId } = parsed.data

  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert({
      user_id: userId,
      source: source || 'web_form',
      sender_email: senderEmail || 'unknown@example.com',
      sender_name: senderName,
      subject,
      body_text: bodyText,
      raw_content: rawContent,
      webhook_message_id: webhookMessageId,
      status: 'pending',
    })
    .select()
    .single()

  if (inquiryError) {
    return NextResponse.json({ error: inquiryError.message }, { status: 500 })
  }

  const aiResponse = await generateDanishResponse(
    { senderName: senderName || 'Customer', body: bodyText },
    userId
  )

  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      inquiry_id: inquiry.id,
      user_id: userId,
      ai_generated_text: aiResponse,
      status: 'draft',
    })
    .select()
    .single()

  if (responseError) {
    return NextResponse.json({ error: responseError.message }, { status: 500 })
  }

  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'inquiry_received',
    inquiry_id: inquiry.id,
  })

  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'response_generated',
    inquiry_id: inquiry.id,
    metadata: { response_id: response.id },
  })

  return NextResponse.json({ data: { inquiry, response } }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const parsed = ResponseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const supabase = getServerClient()
  const { inquiryId, action, approvedText } = parsed.data

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('user_id')
    .eq('id', inquiryId)
    .single()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const userId = inquiry.user_id

  if (action === 'approve' || action === 'edit') {
    const newStatus = action === 'approve' ? 'approved' : 'edited'
    const textToUse = approvedText || ''

    await supabase
      .from('responses')
      .update({ status: newStatus, approved_text: textToUse })
      .eq('inquiry_id', inquiryId)
      .eq('user_id', userId)

    await supabase
      .from('inquiries')
      .update({ status: 'reviewed' })
      .eq('id', inquiryId)

    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: action === 'approve' ? 'response_approved' : 'response_edited',
      inquiry_id: inquiryId,
    })
  } else if (action === 'send') {
    await supabase
      .from('responses')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
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
  }

  return NextResponse.json({ success: true })
}
