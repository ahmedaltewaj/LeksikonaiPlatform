import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('Test error from /api/test-error - Sentry verification')
}

export async function POST() {
  throw new Error('Test error from POST /api/test-error - Sentry verification')
}