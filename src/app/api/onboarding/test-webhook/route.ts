import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', timestamp: new Date().toISOString() }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (response.ok) {
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Webhook returned non-success status' },
          { status: 400 }
        )
      }
    } catch (fetchError) {
      return NextResponse.json(
        { error: 'Failed to connect to webhook URL' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}