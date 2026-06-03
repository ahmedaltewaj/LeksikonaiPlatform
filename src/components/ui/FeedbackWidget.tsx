'use client'

import { useEffect, useState } from 'react'
import { FeedbackButton } from './FeedbackButton'
import { FeedbackModal } from './FeedbackModal'
import { FeedbackToast } from './FeedbackToast'
import { useFeedback } from './useFeedback'

interface FeedbackWidgetProps {
  alwaysVisible?: boolean
}

export function FeedbackWidget({ alwaysVisible = false }: FeedbackWidgetProps) {
  const {
    isOpen,
    showToast,
    feedbackData,
    openFeedback,
    closeFeedback,
    submitFeedback,
    dismissToast,
    setRating,
    setCategory,
    setComment,
    setNpsScore,
  } = useFeedback()

  const [eligible, setIsEligible] = useState(false)

  useEffect(() => {
    if (alwaysVisible) {
      setIsEligible(true)
      return
    }
    const shown = localStorage.getItem('feedback_shown')
    setIsEligible(shown === 'true')
  }, [alwaysVisible])

  if (!eligible) return null

  return (
    <>
      <FeedbackButton onClick={openFeedback} />
      <FeedbackModal
        isOpen={isOpen}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
        feedbackData={feedbackData}
        onRatingChange={setRating}
        onCategoryChange={setCategory}
        onCommentChange={setComment}
        onNpsScoreChange={setNpsScore}
      />
      <FeedbackToast show={showToast} onDismiss={dismissToast} />
    </>
  )
}