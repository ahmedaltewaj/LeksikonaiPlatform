import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'
import { createInquiryWithResponse, normalizeEmailPayload } from '@/lib/inquiry/service'

interface EmailPayload {
  from?: { name?: string; email?: string } | string
  sender?: { name?: string; email?: string } | string
  subject?: string
  body?: string
  text?: string
  html?: string
  messageId?: string
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

  const normalized = normalizeEmailPayload(payload)

  if (!normalized.bodyText) {
    return NextResponse.json({ error: 'Missing body content' }, { status: 400 })
  }

  const result = await createInquiryWithResponse({
    source: 'email',
    senderEmail: normalized.senderEmail,
    senderName: normalized.senderName,
    subject: normalized.subject,
    bodyText: normalized.bodyText,
    rawContent: payload as unknown as Record<string, unknown>,
    webhookMessageId: normalized.webhookMessageId,
  })

  if (result.duplicate) {
    return NextResponse.json({
      status: 'duplicate',
      inquiryId: result.duplicateInquiryId,
    }, { status: 200 })
  }

  return NextResponse.json({
    status: 'received',
    inquiryId: result.inquiryId,
    isNewUser: result.isNewUser,
    hasAiResponse: !!result.aiResponseText,
  }, { status: 200 })
}