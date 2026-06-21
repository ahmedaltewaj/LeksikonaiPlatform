'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import type { Inquiry, Response } from '@/types'

interface ResponseReviewProps {
  inquiry: Inquiry
  userId: string
  onResponseSent?: () => void
}

export function ResponseReview({ inquiry, userId, onResponseSent }: ResponseReviewProps) {
  const [response, setResponse] = useState<Response | null>(null)
  const [editedText, setEditedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchResponse()
  }, [inquiry.id])

  async function fetchResponse() {
    setIsLoading(true)
    setError(null)

    try {
      const createClient = (await import('@/lib/supabase/client')).createClient
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`/api/v1/inquiries?userId=${userId}&status=${inquiry.status}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch response')

      const json = await res.json()
      const inquiryResponse = json.data?.find((r: any) => r.inquiry_id === inquiry.id)
      setResponse(inquiryResponse || null)
      setEditedText(inquiryResponse?.ai_generated_text || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateResponse() {
    setIsGenerating(true)
    setError(null)

    try {
      const createClient = (await import('@/lib/supabase/client')).createClient
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(`/api/v1/inquiries/${inquiry.id}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ userId }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to generate response')
      }

      const json = await res.json()
      setResponse(json.data?.response || null)
      setEditedText(json.data?.response?.ai_generated_text || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleApprove() {
    if (!response || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const createClient = (await import('@/lib/supabase/client')).createClient
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          userId,
          approvedText: editedText,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to approve response')
      }

      const newStatus = editedText !== response.ai_generated_text ? 'edited' : 'approved'
      setResponse(prev => prev ? { ...prev, status: newStatus, approved_text: editedText } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApproveAndSend() {
    if (!response || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const createClient = (await import('@/lib/supabase/client')).createClient
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const approveRes = await fetch('/api/v1/review/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          userId,
          approvedText: editedText,
        }),
      })

      if (!approveRes.ok) {
        const json = await approveRes.json()
        throw new Error(json.error || 'Failed to approve response')
      }

      const sendRes = await fetch('/api/v1/review/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          userId,
        }),
      })

      if (!sendRes.ok) {
        const json = await sendRes.json()
        throw new Error(json.error || 'Failed to send response')
      }

      setResponse(prev => prev ? { ...prev, status: 'sent', approved_text: editedText } : null)
      localStorage.setItem('feedback_shown', 'true')
      onResponseSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSend() {
    if (!response || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const createClient = (await import('@/lib/supabase/client')).createClient
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          userId,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to send response')
      }

      setResponse(prev => prev ? { ...prev, status: 'sent' } : null)
      localStorage.setItem('feedback_shown', 'true')
      onResponseSent?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !response) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-20 bg-gray-100 rounded" />
          <div className="h-10 bg-gray-100 rounded" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Inquiry</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-700">
              {inquiry.sender_name || inquiry.sender_email}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{inquiry.sender_email}</span>
          </div>
          {inquiry.subject && (
            <p className="text-sm font-medium text-gray-900 mb-1">{inquiry.subject}</p>
          )}
          <p className="text-sm text-gray-600">{inquiry.body_text}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">AI Response</h3>
          {response && (
            <Badge variant={response.status === 'sent' ? 'sent' : response.status === 'draft' ? 'pending' : response.status === 'edited' ? 'edited' : 'approved'}>
              {response.status}
            </Badge>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {response ? (
          <Textarea
            value={editedText}
            onChange={e => setEditedText(e.target.value)}
            rows={6}
            placeholder="Edit the response or leave as-is..."
            className="mb-4"
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
            <p className="text-gray-500 mb-4">No response generated yet</p>
            <Button onClick={handleGenerateResponse} isLoading={isGenerating}>
              Generate Response
            </Button>
          </div>
        )}
      </div>

      {response && response.status !== 'sent' && (
        <div className="flex gap-3">
          <Button
            onClick={handleApproveAndSend}
            isLoading={isLoading}
            className="bg-success hover:bg-emerald-600"
          >
            Approve & Send
          </Button>
          <Button
            variant="secondary"
            onClick={handleSend}
            isLoading={isLoading}
            disabled={response.status !== 'approved' && response.status !== 'edited'}
          >
            Send Response
          </Button>
          <Button
            variant="ghost"
            onClick={handleApprove}
            isLoading={isLoading}
            disabled={response.status === 'approved' || response.status === 'edited'}
          >
            Approve Only
          </Button>
        </div>
      )}

      {response?.status === 'sent' && (
        <div className="flex items-center gap-2 text-emerald-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Response sent successfully</span>
        </div>
      )}
    </Card>
  )
}