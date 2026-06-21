'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import type { FeedbackCategory, FeedbackData } from './useFeedback'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  feedbackData: FeedbackData
  onRatingChange: (rating: number) => void
  onCategoryChange: (category: FeedbackCategory) => void
  onCommentChange: (comment: string) => void
  onNpsScoreChange: (score: number) => void
}

const categories: FeedbackCategory[] = ['Bug', 'Feature', 'UX', 'Pricing']
const starLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Amazing']

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
  const [errors, setErrors] = useState<{ rating?: string; category?: string }>({})

  const validate = (): boolean => {
    const newErrors: { rating?: string; category?: string } = {}
    if (feedbackData.rating === 0) {
      newErrors.rating = 'Please select a rating'
    }
    if (!feedbackData.category) {
      newErrors.category = 'Please select a category'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-150"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Share Your Feedback</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How would you rate your experience?</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => onRatingChange(star)}
                  className="text-2xl transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                  aria-label={`Rate ${star} stars`}
                >
                  <span className={star <= feedbackData.rating ? 'text-amber-400' : 'text-gray-300'}>
                    ★
                  </span>
                </button>
              ))}
              {feedbackData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-500">{starLabels[feedbackData.rating]}</span>
              )}
            </div>
            {errors.rating && <p className="text-sm text-error mt-1">{errors.rating}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What is this about?</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 border ${
                    feedbackData.category === cat
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-brand-navy'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p className="text-sm text-error mt-1">{errors.category}</p>}
          </div>

          <div>
            <Textarea
              value={feedbackData.comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="Tell us more (optional)..."
              maxLength={500}
              className="w-full"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{feedbackData.comment.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How likely are you to recommend Leksikon.ai?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Not likely</span>
              <input
                type="range"
                min="0"
                max="10"
                value={feedbackData.npsScore}
                onChange={(e) => onNpsScoreChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-navy"
              />
              <span className="text-sm text-gray-500">Very likely</span>
            </div>
            <div className="flex justify-between mt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <span key={num} className="text-xs text-gray-400 w-4 text-center">{num}</span>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-brand-navy mt-2">Score: {feedbackData.npsScore}</p>
          </div>

          <Button type="submit" className="w-full bg-brand-navy hover:bg-brand-navy/90">
            Send Feedback
          </Button>
        </form>
      </div>
    </div>,
    document.body
  )
}