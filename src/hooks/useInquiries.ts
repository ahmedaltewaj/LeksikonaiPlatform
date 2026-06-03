'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Inquiry, Response } from '@/types'

interface UseInquiriesOptions {
  userId: string
  status?: 'pending' | 'reviewed' | 'sent' | 'archived' | 'all'
}

interface UseInquiriesResult {
  inquiries: Inquiry[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useInquiries({ userId, status = 'all' }: UseInquiriesOptions): UseInquiriesResult {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ userId })
      if (status !== 'all') {
        params.append('status', status)
      }

      const res = await fetch(`/api/v1/inquiries?${params}`, {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch inquiries')
      }

      const json = await res.json()
      setInquiries(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [userId, status])

  useEffect(() => {
    fetchInquiries()
  }, [fetchInquiries])

  return { inquiries, isLoading, error, refetch: fetchInquiries }
}

interface UseResponseOptions {
  inquiryId: string
  userId: string
}

interface UseResponseResult {
  response: Response | null
  isLoading: boolean
  error: string | null
  generateResponse: () => Promise<void>
  approveResponse: (approvedText?: string) => Promise<void>
  sendResponse: () => Promise<void>
}

export function useResponse({ inquiryId, userId }: UseResponseOptions): UseResponseResult {
  const [response, setResponse] = useState<Response | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateResponse = useCallback(async () => {
    if (!inquiryId || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      // POST to create inquiry and auto-generate response
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`,
        },
body: JSON.stringify({
        userId,
        source: 'web_form',
        bodyText: '',
      }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate response')
      }

      const json = await res.json()
      setResponse(json.data?.response || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [inquiryId, userId])

  const approveResponse = useCallback(async (approvedText?: string) => {
    if (!inquiryId || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          inquiryId,
          action: approvedText ? 'edit' : 'approve',
          approvedText,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to approve response')
      }

      setResponse(prev => prev ? { ...prev, status: approvedText ? 'edited' : 'approved', approved_text: approvedText || prev.approved_text } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [inquiryId, userId])

  const sendResponse = useCallback(async () => {
    if (!inquiryId || !userId) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          inquiryId,
          action: 'send',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send response')
      }

      setResponse(prev => prev ? { ...prev, status: 'sent' } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [inquiryId, userId])

  return { response, isLoading, error, generateResponse, approveResponse, sendResponse }
}

async function getAccessToken(): Promise<string> {
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}