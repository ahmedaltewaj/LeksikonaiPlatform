import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/email/webhook'
import { createInquiryWithResponse } from '@/lib/inquiry/service'
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

  try {
    const result = await createInquiryWithResponse({
      source: 'web_form',
      senderEmail: payload.email,
      senderName: payload.name || null,
      subject: payload.company ? 'Inquiry from ' + payload.company : null,
      bodyText: payload.message || '',
      rawContent: payload as unknown as Record<string, unknown>,
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
  } catch (error) {
    console.error('Form webhook error:', error)
    return NextResponse.json({ error: 'Failed to process form submission' }, { status: 500 })
  }
}