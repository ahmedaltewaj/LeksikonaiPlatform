import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/client'

const RequestSchema = z.object({
  inquiryId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServerClient()
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const inquiryId = searchParams.get('inquiryId')

  if (!inquiryId) {
    return NextResponse.json({ error: 'inquiryId required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
