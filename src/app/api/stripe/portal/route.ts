import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { authenticateRequest } from '@/lib/supabase/auth'

const PortalSchema = z.object({
  customer_id: z.string().min(1, 'customer_id is required'),
})

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = PortalSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { customer_id } = parsed.data

  try {
    const { data: subscription } = await auth.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('stripe_customer_id', customer_id)
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 403 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${baseUrl}/dashboard`,
    })

    return NextResponse.json({ data: { url: portalSession.url } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe portal session creation failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}