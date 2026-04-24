import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient } from '@/lib/supabase/client'

const RequestSchema = z.object({
  inquiryId: z.string().uuid(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const inquiryId = searchParams.get('inquiryId')

  if (!inquiryId) {
    return NextResponse.json({ error: 'inquiryId required' }, { status: 400 })
  }

  const supabase = getServerClient()

  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('inquiry_id', inquiryId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
