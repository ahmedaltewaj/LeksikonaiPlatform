import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await authenticateRequest(request)
  if ('error' in auth) return auth.error

  try {
    const subscriberId = params.id

    const { data: subscriber, error: fetchError } = await auth.supabase
      .from('subscribers')
      .select('id, status, user_id')
      .eq('id', subscriberId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subscriber not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (subscriber.user_id && subscriber.user_id !== auth.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only unsubscribe your own subscribers' },
        { status: 403 }
      )
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json(
        { message: 'Already unsubscribed' },
        { status: 200 }
      )
    }

    const { error: updateError } = await auth.supabase
      .from('subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', subscriberId)

    if (updateError) {
      console.error('Failed to unsubscribe:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Successfully unsubscribed' 
    })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}