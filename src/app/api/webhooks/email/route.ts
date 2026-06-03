import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  const supabase = await createSupabaseServerClient()

  const senderEmail = extractSenderEmail(payload)

  // Look up user by sender email to associate inquiry with their account
  const { data: senderUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', senderEmail)
    .single()

  if (!senderUser) {
    console.error('No user found for sender email:', senderEmail)
    return NextResponse.json({ error: 'No user found for sender email' }, { status: 400 })
  }

  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert({
      user_id: senderUser.id,
      source: 'email',
      sender_email: senderEmail,
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
    user_id: senderUser.id,
    event_type: 'inquiry_received',
    inquiry_id: inquiry.id,
    metadata: { source: 'email', sender_email: senderEmail },
  })

  return NextResponse.json({ status: 'received', inquiryId: inquiry.id }, { status: 200 })
}