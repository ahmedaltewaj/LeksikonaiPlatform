'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Inquiry, Response } from '@/types'

interface HistoryItem extends Inquiry {
  response: Response | null
  rejection_reason?: string | null
}

interface ReviewHistoryProps {
  userId: string | null
}

export function ReviewHistory({ userId }: ReviewHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) fetchHistory()
  }, [userId])

  async function fetchHistory() {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) return

      const res = await fetch(`/api/v1/review/history?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch history')

      const json = await res.json()
      setItems(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card><div className="h-24 bg-gray-100 rounded" /></Card>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchHistory}>Retry</Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-1">No history yet</p>
          <p className="text-sm">Approved and rejected responses will appear here.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">
        {items.length} Response{items.length !== 1 ? 's' : ''} in History
      </h2>
      {items.map(item => (
        <Card key={item.id}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {item.sender_name || item.sender_email}
                </span>
                <HistoryBadge status={item.response?.status || 'draft'} />
              </div>
              {item.subject && (
                <p className="text-sm text-gray-500 truncate mb-1">{item.subject}</p>
              )}
              <p className="text-sm text-gray-400 truncate">{item.body_text}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatDate(item.response?.sent_at || item.created_at)}
            </span>
          </div>

          {item.response?.approved_text && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-3">
              {item.response.approved_text}
            </div>
          )}

          {item.status === 'archived' && typeof (item.raw_content as Record<string, unknown>)?.rejection_reason === 'string' && (
            <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
              <span className="font-medium">Rejection reason:</span> {(item.raw_content as Record<string, string>).rejection_reason}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function HistoryBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'approved' | 'draft' | 'pending' | 'archived' | 'error'> = {
    approved: 'approved',
    sent: 'approved',
    edited: 'approved',
    draft: 'pending',
    rejected: 'error',
  }

  const labelMap: Record<string, string> = {
    approved: 'Approved',
    sent: 'Sent',
    edited: 'Edited',
    draft: 'Draft',
    rejected: 'Rejected',
  }

  return <Badge variant={variantMap[status] || 'draft'}>{labelMap[status] || status}</Badge>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
  }
}
