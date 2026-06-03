'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Textarea } from './Textarea'
import type { FeedbackData } from './useFeedback'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FeedbackData) => void
  feedbackData: FeedbackData
  onRatingChange: (rating: number) => void
  onCategoryChange: (category: FeedbackData['category']) => void
  onCommentChange: (comment: string) => void
  onNpsScoreChange: (score: number) => void
}

const CATEGORIES: { value: FeedbackData['category']; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'ux', label: 'UX' },
  { value: 'pricing', label: 'Pricing' },
]

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  feedbackData,
  onRatingChange,
  onCategoryChange,
  onCommentChange,
  onNpsScoreChange,
}: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = () => {
    if (feedbackData.rating === 0 || !feedbackData.category) return
    setIsSubmitting(true)
    // Simulate brief submit delay
    setTimeout(() => {
      onSubmit(feedbackData)
      setIsSubmitting(false)
    }, 300)
  }

  const isValid = feedbackData.rating > 0 && feedbackData.category !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Share your feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Rating */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate your experience?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRatingChange(star)}
                className={`text-2xl transition-transform hover:scale-110 ${
                  star <= feedbackData.rating ? 'text-amber-400' : 'text-gray-300'
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
          {feedbackData.rating > 0 && (
            <p className="mt-1 text-sm text-gray-500">{STAR_LABELS[feedbackData.rating - 1]}</p>
          )}
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">What is this about?</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  feedbackData.category === cat.value
                    ? 'bg-brand-navy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            value={feedbackData.comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Tell us more about your feedback..."
            maxLength={500}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">
            {feedbackData.comment.length}/500
          </p>
        </div>

        {/* NPS */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How likely are you to recommend Leksikon.ai?
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Not likely</span>
            <div className="flex gap-1 flex-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => onNpsScoreChange(score)}
                  className={`flex-1 h-8 rounded text-sm font-medium transition-colors ${
                    feedbackData.npsScore === score
                      ? score <= 3
                        ? 'bg-error text-white'
                        : score <= 6
                        ? 'bg-warning text-white'
                        : 'bg-success text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">Very likely</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          isLoading={isSubmitting}
          className="w-full"
        >
          Send Feedback
        </Button>
      </div>
    </div>
  )
}