import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/supabase/auth'

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  if (userId !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: inquiries, error: inquiriesError } = await auth.supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['sent', 'archived'])
    .order('received_at', { ascending: false })
    .limit(50)

  if (inquiriesError) {
    return NextResponse.json({ error: inquiriesError.message }, { status: 500 })
  }

  const inquiryIds = inquiries?.map(i => i.id) || []

  if (inquiryIds.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const { data: responses, error: responsesError } = await auth.supabase
    .from('responses')
    .select('*')
    .in('inquiry_id', inquiryIds)
    .eq('user_id', userId)

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 })
  }

  const data = inquiries?.map(inquiry => ({
    ...inquiry,
    response: responses?.find(r => r.inquiry_id === inquiry.id) || null,
  })) || []

  return NextResponse.json({ data })
}
