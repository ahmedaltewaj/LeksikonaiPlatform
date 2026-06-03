'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Period = '7d' | '30d' | '90d'

interface DailyData {
  date: string
  inquiries: number
  sent: number
}

interface Analytics {
  totalInquiries: number
  sentResponses: number
  approvalRate: number
  avgResponseTime: number
  dailyData: DailyData[]
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('30d')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
      }
    }
    getUser()
  }, [])

  useEffect(() => {
    if (userId) fetchAnalytics()
  }, [userId, period])

  async function fetchAnalytics() {
    if (!userId) return
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      const res = await fetch(`/api/v1/analytics?userId=${userId}&period=${period}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const json = await res.json()
      setAnalytics(json.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  function downloadCSV() {
    if (!analytics) return
    const headers = ['Date', 'Inquiries', 'Sent']
    const rows = analytics.dailyData.map(d => [d.date, d.inquiries, d.sent])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const maxInquiries = analytics?.dailyData.reduce((max, d) => Math.max(max, d.inquiries), 1) || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
        <button
          onClick={downloadCSV}
          className="text-sm text-primary hover:underline"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Total Inquiries</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : analytics?.totalInquiries || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Sent Responses</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : analytics?.sentResponses || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Approval Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : `${analytics?.approvalRate || 0}%`}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Avg Response Time</p>
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : formatMinutes(analytics?.avgResponseTime || 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Inquiries</h3>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-gray-400">Loading...</div>
        ) : analytics && analytics.dailyData.length > 0 ? (
          <div className="flex items-end gap-1 h-32">
            {analytics.dailyData.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${Math.max((d.inquiries / maxInquiries) * 100, 4)}%` }}
                />
                <span className="text-xs text-gray-400">{new Date(d.date).getDate()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400">
            No data for this period
          </div>
        )}
      </div>
    </div>
  )
}