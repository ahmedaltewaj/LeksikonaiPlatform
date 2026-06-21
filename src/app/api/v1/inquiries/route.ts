import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'
import { ingestInquiry } from '@/lib/inquiry/service'

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
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const status = searchParams.get('status')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let query = auth.supabase
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
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { userId, source, senderEmail, senderName, subject, bodyText, rawContent, webhookMessageId } = parsed.data

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await ingestInquiry(
      {
        source: source || 'web_form',
        userId,
        senderEmail: senderEmail || 'unknown@example.com',
        senderName: senderName || null,
        subject: subject || null,
        bodyText,
        rawContent: rawContent || null,
        webhookMessageId: webhookMessageId || null,
      },
      { autoGenerateResponse: true, tone: 'professional', skipUserLookup: true }
    )

    return NextResponse.json({
      data: {
        inquiry: result.inquiry,
        response: result.response,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create inquiry:', error)
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = ResponseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { inquiryId, action, approvedText } = parsed.data

  const { data: inquiry } = await auth.supabase
    .from('inquiries')
    .select('user_id')
    .eq('id', inquiryId)
    .single()

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const userId = inquiry.user_id

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (action === 'approve' || action === 'edit') {
    const newStatus = action === 'approve' ? 'approved' : 'edited'
    const textToUse = approvedText || ''

    await auth.supabase
      .from('responses')
      .update({ status: newStatus, approved_text: textToUse })
      .eq('inquiry_id', inquiryId)
      .eq('user_id', userId)

    await auth.supabase
      .from('inquiries')
      .update({ status: 'reviewed' })
      .eq('id', inquiryId)

    await auth.supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: action === 'approve' ? 'response_approved' : 'response_edited',
      inquiry_id: inquiryId,
    })
  } else if (action === 'send') {
    await auth.supabase
      .from('responses')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('inquiry_id', inquiryId)
      .eq('user_id', userId)

    await auth.supabase
      .from('inquiries')
      .update({ status: 'sent' })
      .eq('id', inquiryId)

    await auth.supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'response_sent',
      inquiry_id: inquiryId,
    })
  }

  return NextResponse.json({ success: true })
}