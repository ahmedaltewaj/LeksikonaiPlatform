import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const { data: inquiries, error: inquiriesError } = await supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('received_at', { ascending: true })

  if (inquiriesError) {
    return NextResponse.json({ error: inquiriesError.message }, { status: 500 })
  }

  const inquiryIds = inquiries?.map(i => i.id) || []

  if (inquiryIds.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select('*')
    .in('inquiry_id', inquiryIds)
    .eq('user_id', userId)
    .in('status', ['draft', 'approved', 'edited'])

  if (responsesError) {
    return NextResponse.json({ error: responsesError.message }, { status: 500 })
  }

  const data = inquiries?.map(inquiry => ({
    ...inquiry,
    response: responses?.find(r => r.inquiry_id === inquiry.id) || null,
  })) || []

  return NextResponse.json({ data })
}
