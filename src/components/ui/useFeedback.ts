'use client'

import { useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser-client'

export interface FeedbackData {
  rating: number
  category: 'bug' | 'feature' | 'ux' | 'pricing' | null
  comment: string
  npsScore: number
}

interface UseFeedbackReturn {
  isOpen: boolean
  showToast: boolean
  isSubmitting: boolean
  feedbackData: FeedbackData
  openFeedback: () => void
  closeFeedback: () => void
  submitFeedback: (data: FeedbackData) => Promise<void>
  dismissToast: () => void
  setRating: (rating: number) => void
  setCategory: (category: FeedbackData['category']) => void
  setComment: (comment: string) => void
  setNpsScore: (score: number) => void
}

const initialFeedbackData: FeedbackData = {
  rating: 0,
  category: null,
  comment: '',
  npsScore: 5,
}

async function submitToApi(data: FeedbackData): Promise<void> {
  const supabase = createBrowserClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: data.rating,
      category: data.category,
      comment_text: data.comment || undefined,
      nps_score: data.npsScore,
      page_url: window.location.href,
    }),
  })
}

export function useFeedback(): UseFeedbackReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(initialFeedbackData)

  const openFeedback = useCallback(() => setIsOpen(true), [])
  const closeFeedback = useCallback(() => setIsOpen(false), [])

  const submitFeedback = useCallback(async (data: FeedbackData) => {
    if (!data.category || data.rating === 0) return
    
    setIsSubmitting(true)
    try {
      await submitToApi(data)
      localStorage.setItem('feedback_shown', 'true')
      setIsOpen(false)
      setShowToast(true)
      setFeedbackData(initialFeedbackData)
      setTimeout(() => setShowToast(false), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const dismissToast = useCallback(() => setShowToast(false), [])

  const setRating = useCallback((rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }))
  }, [])

  const setCategory = useCallback((category: FeedbackData['category']) => {
    setFeedbackData(prev => ({ ...prev, category }))
  }, [])

  const setComment = useCallback((comment: string) => {
    setFeedbackData(prev => ({ ...prev, comment: comment.slice(0, 500) }))
  }, [])

  const setNpsScore = useCallback((npsScore: number) => {
    setFeedbackData(prev => ({ ...prev, npsScore }))
  }, [])

  return {
    isOpen,
    showToast,
    isSubmitting,
    feedbackData,
    openFeedback,
    closeFeedback,
    submitFeedback,
    dismissToast,
    setRating,
    setCategory,
    setComment,
    setNpsScore,
  }
}