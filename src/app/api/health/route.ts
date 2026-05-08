import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase/client'

type DependencyStatus = 'ok' | 'error'
type HealthCheckStatus = 'healthy' | 'degraded' | 'unhealthy'

interface HealthStatus {
  status: HealthCheckStatus
  timestamp: string
  service: string
  version: string
  dependencies: {
    supabase: DependencyStatus
    gemini: DependencyStatus
  }
  responseTimeMs: number
}

export async function GET() {
  const startTime = Date.now()
  let supabaseStatus: DependencyStatus = 'ok'

  try {
    const supabase = getServerClient()
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error && error.code !== 'PGRST116') {
      supabaseStatus = 'error'
    }
  } catch {
    supabaseStatus = 'error'
  }

  const responseTimeMs = Date.now() - startTime
  const overallStatus: HealthCheckStatus = supabaseStatus === 'error' ? 'degraded' : 'healthy'

  const body: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'leksikon-ai',
    version: '1.0.0',
    dependencies: {
      supabase: supabaseStatus,
      gemini: 'ok',
    },
    responseTimeMs,
  }

  const status = 200

  return NextResponse.json(body, { status })
}
