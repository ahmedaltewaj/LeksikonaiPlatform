import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

/**
 * GET /api/health
 * 
 * Health check endpoint for uptime monitoring.
 * Returns 200 when healthy/degraded, 503 when unhealthy.
 * 
 * Alert thresholds (from docs/monitoring.md):
 * - healthy: responseTime < 500ms, supabase = ok
 * - degraded: responseTime 500-2000ms OR supabase slow
 * - unhealthy: responseTime > 2000ms OR supabase error
 */
export async function GET() {
  const startTime = Date.now()
  let supabaseStatus: DependencyStatus = 'ok'
  let geminiStatus: DependencyStatus = 'ok'

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error && error.code !== 'PGRST116') {
      supabaseStatus = 'error'
    }
  } catch {
    supabaseStatus = 'error'
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.length < 10) {
      geminiStatus = 'error'
    }
  } catch {
    geminiStatus = 'error'
  }

  const responseTimeMs = Date.now() - startTime
  
  let overallStatus: HealthCheckStatus = 'healthy'
  if (supabaseStatus === 'error' || geminiStatus === 'error') {
    overallStatus = 'degraded'
  }
  if (supabaseStatus === 'error' && geminiStatus === 'error') {
    overallStatus = 'unhealthy'
  }

  const body: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: 'leksikon-ai',
    version: '1.0.0',
    dependencies: {
      supabase: supabaseStatus,
      gemini: geminiStatus,
    },
    responseTimeMs,
  }

  const status = overallStatus === 'unhealthy' ? 503 : 200

  return NextResponse.json(body, { status })
}
