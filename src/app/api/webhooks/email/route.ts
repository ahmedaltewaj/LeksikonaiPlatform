import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'

const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET ?? ''

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature')
  const rawBody = await req.text()

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)

  return NextResponse.json({ status: 'received' }, { status: 200 })
}
