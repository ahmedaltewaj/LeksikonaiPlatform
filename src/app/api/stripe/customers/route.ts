import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  }

  try {
    const customer = await stripe.customers.retrieve(customerId)

    if (customer.deleted) {
      return NextResponse.json({ error: 'Customer deleted' }, { status: 410 })
    }

    return NextResponse.json({ data: customer })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}