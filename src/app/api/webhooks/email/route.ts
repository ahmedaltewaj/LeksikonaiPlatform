import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'
import { getServerClient } from '@/lib/supabase/client'

interface EmailPayload {
  from?: { name?: string; email?: string } | string
  sender?: { name?: string; email?: string } | string
  subject?: string
  body?: string
  text?: string
  html?: string
  messageId?: string
}

function extractBody(payload: EmailPayload): string {
  return payload.body || payload.text || payload.html?.replace(/<[^>]+>/g, '') || ''
}

function extractSenderEmail(payload: EmailPayload): string {
  const from = payload.from
  if (!from) return payload.sender && typeof payload.sender === 'string' ? payload.sender : 'unknown@example.com'
  if (typeof from === 'string') return from
  return from.email || (typeof payload.sender === 'string' ? payload.sender : 'unknown@example.com')
}

function extractSenderName(payload: EmailPayload): string | null {
  const from = payload.from
  if (typeof from === 'object' && from?.name) return from.name
  if (typeof payload.sender === 'object' && payload.sender?.name) return payload.sender.name
  return null
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature')
  const rawBody = await req.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: EmailPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const bodyText = extractBody(payload)
  if (!bodyText) {
    return NextResponse.json({ error: 'Missing body content' }, { status: 400 })
  }

  const supabase = getServerClient()

  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert({
      source: 'email',
      sender_email: extractSenderEmail(payload),
      sender_name: extractSenderName(payload),
      subject: payload.subject || null,
      body_text: bodyText.slice(0, 10000),
      raw_content: payload,
      webhook_message_id: payload.messageId || null,
      status: 'pending',
    })
    .select()
    .single()

  if (inquiryError) {
    console.error('Failed to insert inquiry:', inquiryError)
    return NextResponse.json({ error: 'Failed to store inquiry' }, { status: 500 })
  }

  await supabase.from('analytics_events').insert({
    event_type: 'inquiry_received',
    inquiry_id: inquiry.id,
    metadata: { source: 'email', sender_email: extractSenderEmail(payload) },
  })

  return NextResponse.json({ status: 'received', inquiryId: inquiry.id }, { status: 200 })
}