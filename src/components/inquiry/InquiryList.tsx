'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Inquiry } from '@/types'

interface InquiryListProps {
  inquiries: Inquiry[]
  isLoading: boolean
  error: string | null
  onSelectInquiry: (inquiry: Inquiry) => void
  selectedInquiryId?: string
  userId: string
  onGenerateResponse: (inquiry: Inquiry) => Promise<void>
}

export function InquiryList({
  inquiries,
  isLoading,
  error,
  onSelectInquiry,
  selectedInquiryId,
  userId,
  onGenerateResponse,
}: InquiryListProps) {
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card>
              <div className="h-20 bg-gray-100 rounded" />
            </Card>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-error">
        <p>Failed to load inquiries: {error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-900 mb-1">No inquiries yet</p>
        <p className="text-sm">Connect your email or web form to get started.</p>
      </div>
    )
  }

  async function handleGenerateResponse(e: React.MouseEvent, inquiry: Inquiry) {
    e.stopPropagation()
    setGeneratingId(inquiry.id)
    setGenerateError(null)
    try {
      await onGenerateResponse(inquiry)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate response')
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {inquiries.map(inquiry => (
        <Card
          key={inquiry.id}
          variant={selectedInquiryId === inquiry.id ? 'elevated' : 'interactive'}
          className={selectedInquiryId === inquiry.id ? 'border-primary ring-2 ring-primary/20' : ''}
          onClick={() => onSelectInquiry(inquiry)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {inquiry.sender_name || inquiry.sender_email}
                </span>
                <StatusBadge status={inquiry.status} />
              </div>
              {inquiry.subject && (
                <p className="text-sm text-gray-500 truncate mb-1">{inquiry.subject}</p>
              )}
              <p className="text-sm text-gray-400 truncate">{inquiry.body_text}</p>
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap">
              {formatDate(inquiry.received_at)}
            </div>
          </div>

          {inquiry.status === 'pending' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
              {generateError && (
                <span className="text-sm text-red-600">{generateError}</span>
              )}
              <Button
                size="sm"
                variant="secondary"
                isLoading={generatingId === inquiry.id}
                onClick={e => handleGenerateResponse(e, inquiry)}
              >
                Generate Response
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: Inquiry['status'] }) {
  const variantMap: Record<Inquiry['status'], 'pending' | 'approved' | 'draft' | 'archived' | 'error'> = {
    pending: 'pending',
    reviewed: 'approved',
    sent: 'approved',
    archived: 'archived',
  }

  const labelMap: Record<Inquiry['status'], string> = {
    pending: 'Pending',
    reviewed: 'Reviewed',
    sent: 'Sent',
    archived: 'Archived',
  }

  return <Badge variant={variantMap[status]}>{labelMap[status]}</Badge>
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
