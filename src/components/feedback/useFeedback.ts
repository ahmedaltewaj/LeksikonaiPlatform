'use client'

import { useState, useCallback } from 'react'
import { submitFeedback as submitToApi } from './submitFeedback'

export type FeedbackCategory = 'Bug' | 'Feature' | 'UX' | 'Pricing'

export interface FeedbackData {
  rating: number
  category: FeedbackCategory | null
  comment: string
  npsScore: number
}

interface UseFeedbackReturn {
  isModalOpen: boolean
  isToastVisible: boolean
  isSubmitting: boolean
  feedbackData: FeedbackData
  openModal: () => void
  closeModal: () => void
  hideToast: () => void
  setRating: (rating: number) => void
  setCategory: (category: FeedbackCategory) => void
  setComment: (comment: string) => void
  setNpsScore: (score: number) => void
  submitFeedback: () => Promise<void>
  resetForm: () => void
}

const initialFeedbackData: FeedbackData = {
  rating: 0,
  category: null,
  comment: '',
  npsScore: 5,
}

export function useFeedback(): UseFeedbackReturn {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isToastVisible, setIsToastVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackData>(initialFeedbackData)

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const hideToast = useCallback(() => setIsToastVisible(false), [])

  const setRating = useCallback((rating: number) => {
    setFeedbackData(prev => ({ ...prev, rating }))
  }, [])

  const setCategory = useCallback((category: FeedbackCategory) => {
    setFeedbackData(prev => ({ ...prev, category }))
  }, [])

  const setComment = useCallback((comment: string) => {
    setFeedbackData(prev => ({ ...prev, comment: comment.slice(0, 500) }))
  }, [])

  const setNpsScore = useCallback((npsScore: number) => {
    setFeedbackData(prev => ({ ...prev, npsScore }))
  }, [])

  const doSubmit = useCallback(async () => {
    if (!feedbackData.category || feedbackData.rating === 0) return
    
    setIsSubmitting(true)
    try {
      await submitToApi({
        rating: feedbackData.rating,
        category: feedbackData.category,
        comment: feedbackData.comment,
        npsScore: feedbackData.npsScore,
        page_url: window.location.href,
      })
      setIsModalOpen(false)
      setIsToastVisible(true)
      setFeedbackData(initialFeedbackData)
    } finally {
      setIsSubmitting(false)
    }
  }, [feedbackData])

  const resetForm = useCallback(() => {
    setFeedbackData(initialFeedbackData)
  }, [])

  return {
    isModalOpen,
    isToastVisible,
    isSubmitting,
    feedbackData,
    openModal,
    closeModal,
    hideToast,
    setRating,
    setCategory,
    setComment,
    setNpsScore,
    submitFeedback: doSubmit,
    resetForm,
  }
}