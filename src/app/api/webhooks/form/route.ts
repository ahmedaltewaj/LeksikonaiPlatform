import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'
import { z } from 'zod'

const FormWebhookSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  message: z.string().min(1).optional(),
  source: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-webhook-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: z.infer<typeof FormWebhookSchema>
  try {
    payload = FormWebhookSchema.parse(JSON.parse(rawBody))
  } catch (parseError) {
    console.error('Form webhook parse error:', parseError)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  console.log('Form webhook received:', payload)

  return NextResponse.json({ status: 'received' }, { status: 200 })
}
