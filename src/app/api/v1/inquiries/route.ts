import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RequestSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['pending', 'reviewed']).optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  return NextResponse.json({ data: [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  return NextResponse.json({ data: {} }, { status: 201 })
}
