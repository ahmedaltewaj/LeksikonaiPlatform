'use client'

import { useNps } from '@/components/feedback/useNps'

export function NpsStats() {
  const { npsScore, isLoading } = useNps()

  if (isLoading) {
    return <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />
  }

  if (!npsScore || npsScore.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Satisfaction</h3>
        <p className="text-gray-500 text-sm">No NPS responses yet</p>
      </div>
    )
  }

  const npsColor = npsScore.nps !== null 
    ? npsScore.nps >= 40 ? 'text-success' : npsScore.nps >= 0 ? 'text-warning' : 'text-error'
    : 'text-gray-400'

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Customer Satisfaction</h3>
        <span className={`text-3xl font-bold ${npsColor}`}>
          {npsScore.nps !== null ? `NPS ${npsScore.nps}` : 'N/A'}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{npsScore.promoters}</div>
          <div className="text-xs text-gray-500">Promoters</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warning">{npsScore.passives}</div>
          <div className="text-xs text-gray-500">Passives</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-error">{npsScore.detractors}</div>
          <div className="text-xs text-gray-500">Detractors</div>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {npsScore.total} total response{npsScore.total !== 1 ? 's' : ''}
      </div>
    </div>
  )
}