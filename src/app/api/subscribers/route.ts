import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email(),
  userId: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = subscribeSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServerClient()
    const { email, userId } = parsed.data

    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', checkError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (existing) {
      if (existing.status === 'unsubscribed') {
        const { data, error } = await supabase
          .from('subscribers')
          .update({ 
            status: 'active', 
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          return NextResponse.json(
            { error: 'Failed to resubscribe' },
            { status: 500 }
          )
        }

        return NextResponse.json({ 
          message: 'Successfully resubscribed',
          subscriber: data 
        })
      }

      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 409 }
      )
    }

    const { data: newSubscriber, error } = await supabase
      .from('subscribers')
      .insert({
        email,
        user_id: userId || null,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create subscriber:', error)
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Successfully subscribed',
      subscriber: newSubscriber 
    }, { status: 201 })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}