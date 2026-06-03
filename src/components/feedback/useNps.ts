import { useState, useCallback, useEffect } from 'react'

export interface NpsTrigger {
  id: string
  user_id: string
  triggered_at: string
  survey_type: string
  status: string
  nps_score: number | null
  responded_at: string | null
  metadata: Record<string, unknown>
}

export interface NpsScore {
  promoters: number
  passives: number
  detractors: number
  total: number
  nps: number | null
}

interface UseNpsReturn {
  triggers: NpsTrigger[]
  npsScore: NpsScore | null
  isLoading: boolean
  error: string | null
  triggerSurvey: (surveyType?: string, periodDays?: number) => Promise<boolean>
  refreshData: () => Promise<void>
}

export function useNps(): UseNpsReturn {
  const [triggers, setTriggers] = useState<NpsTrigger[]>([])
  const [npsScore, setNpsScore] = useState<NpsScore | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const authHeader = localStorage.getItem('sb-access-token')
    if (!authHeader) return

    try {
      const response = await fetch('/api/nps', {
        headers: { Authorization: `Bearer ${authHeader}` }
      })
      const data = await response.json()
      if (response.ok) {
        setTriggers(data.triggers || [])
        setNpsScore(data.npsScore)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch NPS data')
      }
    } catch (err) {
      setError('Network error')
    }
  }, [])

  const triggerSurvey = useCallback(async (surveyType = 'manual', periodDays = 30): Promise<boolean> => {
    const authHeader = localStorage.getItem('sb-access-token')
    if (!authHeader) return false

    setIsLoading(true)
    try {
      const response = await fetch('/api/nps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authHeader}`
        },
        body: JSON.stringify({ survey_type: surveyType, period_days: periodDays })
      })
      const data = await response.json()
      if (response.ok && data.eligible) {
        await fetchData()
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { triggers, npsScore, isLoading, error, triggerSurvey, refreshData: fetchData }
}