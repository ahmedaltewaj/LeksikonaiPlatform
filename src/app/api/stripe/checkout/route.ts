import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { authorizeAdmin } from '@/lib/supabase/auth'

const CheckoutSchema = z.object({
  price_id: z.string().min(1, 'price_id is required'),
})

export async function POST(req: NextRequest) {
  const auth = await authorizeAdmin(req)
  if ('error' in auth) return auth.error

  const body = await req.json()
  const parsed = CheckoutSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { price_id } = parsed.data

  try {
    const { data: customerData } = await auth.supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    let customerId: string

    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id
    } else {
      const customers = await stripe.customers.list({
        email: auth.user.email ?? undefined,
        limit: 1,
      })

      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        const newCustomer = await stripe.customers.create({
          email: auth.user.email ?? undefined,
          metadata: {
            user_id: auth.user.id,
          },
        })
        customerId = newCustomer.id
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      currency: 'dkk',
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel`,
      metadata: {
        user_id: auth.user.id,
      },
      subscription_data: {
        metadata: {
          user_id: auth.user.id,
        },
      },
    })

    return NextResponse.json({ data: { url: session.url, session_id: session.id } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Stripe checkout session creation failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}