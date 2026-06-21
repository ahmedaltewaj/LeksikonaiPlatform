import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  try {
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product'],
    })

    return NextResponse.json({ data: prices.data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}