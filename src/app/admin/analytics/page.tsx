'use client'

import { useState, useEffect } from 'react'

interface FunnelStage {
  stage: string
  count: number
  target: number
}

interface CohortData {
  period: string
  total: number
  activated: number
  rate: number
}

interface EngagementMetrics {
  dau: number
  wau: number
  mau: number
  avgTimeToFirstResponse: number | null
  approvalRate: number | null
}

interface NpsTrend {
  period: string
  nps: number | null
  promoters: number
  passives: number
  detractors: number
  total: number
}

interface AnalyticsData {
  funnel: FunnelStage[]
  cohortData: CohortData[]
  engagement: EngagementMetrics
  npsTrends: NpsTrend[]
  overallNps: { nps: number | null; promoters: number; passives: number; detractors: number; total: number } | null
  generatedAt: string
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setData)
      .catch(() => setError('Kunne ikke hente data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen bg-gray-50 p-8"><div className="animate-pulse space-y-4"><div className="h-64 bg-gray-200 rounded-lg"></div></div></div>
  if (error) return <div className="min-h-screen bg-gray-50 p-8 text-center text-red-600">{error}</div>
  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analyse Dashboard</h1>
            <p className="text-sm text-gray-500">Brugeraktivering og engagement metrics</p>
          </div>
          <span className="text-xs text-gray-400">Opdateret: {new Date(data.generatedAt).toLocaleString('da-DK')}</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktiveringstragt</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {data.funnel.map((item) => {
                const pct = data.funnel[0].count > 0 ? Math.round((item.count / data.funnel[0].count) * 100) : 0
                const targetPct = item.target
                const width = Math.min(pct, 100)
                return (
                  <div key={item.stage} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                      <span className="text-sm text-gray-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${width}%`,
                          backgroundColor: pct >= targetPct ? '#10b981' : pct >= targetPct * 0.7 ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                    </div>
                    <div className="absolute right-0 top-0 transform translate-y-1">
                      <span className="text-xs text-gray-400">Mål: {targetPct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kohorte Analyse</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Brugere</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktiveret</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.cohortData.map((row) => (
                    <tr key={row.period}>
                      <td className="px-4 py-3 text-sm text-gray-700">{row.period}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">{row.total}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">{row.activated}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${row.rate >= 20 ? 'bg-emerald-100 text-emerald-700' : row.rate >= 10 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">DAU</p>
                <p className="text-3xl font-bold text-gray-900">{data.engagement.dau}</p>
                <p className="text-xs text-gray-400 mt-1">Sidste 24 timer</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">WAU</p>
                <p className="text-3xl font-bold text-gray-900">{data.engagement.wau}</p>
                <p className="text-xs text-gray-400 mt-1">Sidste 7 dage</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">MAU</p>
                <p className="text-3xl font-bold text-gray-900">{data.engagement.mau}</p>
                <p className="text-xs text-gray-400 mt-1">Sidste 30 dage</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Godkendelsesrate</p>
                <p className="text-3xl font-bold text-gray-900">{data.engagement.approvalRate ?? '—'}%</p>
                <p className="text-xs text-gray-400 mt-1">AI-svar godkendt</p>
              </div>
              <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-1">Gns. tid til første svar</p>
                <p className="text-3xl font-bold text-gray-900">{data.engagement.avgTimeToFirstResponse ?? '—'} <span className="text-lg font-normal">min</span></p>
                <p className="text-xs text-gray-400 mt-1">Fra første forespørgsel</p>
              </div>
            </div>
          </section>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">NPS Over tid</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {data.overallNps && (
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="text-center">
                  <p className={`text-4xl font-bold ${data.overallNps.nps !== null && data.overallNps.nps >= 40 ? 'text-emerald-500' : data.overallNps.nps !== null && data.overallNps.nps >= 0 ? 'text-amber-500' : 'text-red-500'}`}>
                    {data.overallNps.nps ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">NPS Score</p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-500">{data.overallNps.promoters}</p>
                    <p className="text-xs text-gray-500">Promoters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">{data.overallNps.passives}</p>
                    <p className="text-xs text-gray-500">Passives</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{data.overallNps.detractors}</p>
                    <p className="text-xs text-gray-500">Detractors</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {data.npsTrends.map((trend) => (
                <div key={trend.period} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-gray-500">{trend.period}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${(trend.promoters / trend.total) * 100}%` }} />
                    <div className="absolute inset-y-0 bg-amber-500" style={{ left: `${(trend.promoters / trend.total) * 100}%`, width: `${(trend.passives / trend.total) * 100}%` }} />
                    <div className="absolute inset-y-0 bg-red-500" style={{ left: `${((trend.promoters + trend.passives) / trend.total) * 100}%`, width: `${(trend.detractors / trend.total) * 100}%` }} />
                  </div>
                  <span className={`w-12 text-right text-sm font-medium ${trend.nps !== null && trend.nps >= 40 ? 'text-emerald-600' : trend.nps !== null && trend.nps >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {trend.nps ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}