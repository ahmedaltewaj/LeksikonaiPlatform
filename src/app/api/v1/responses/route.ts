import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/supabase/auth'

const RequestSchema = z.object({
  inquiryId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req)
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const inquiryId = searchParams.get('inquiryId')

  if (!inquiryId) {
    return NextResponse.json({ error: 'inquiryId required' }, { status: 400 })
  }

  const { data, error } = await auth.supabase
    .from('responses')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .eq('user_id', auth.user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
