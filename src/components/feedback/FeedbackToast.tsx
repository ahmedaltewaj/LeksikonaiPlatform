'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface FeedbackToastProps {
  isVisible: boolean
  onDismiss: () => void
  duration?: number
}

export function FeedbackToast({ isVisible, onDismiss, duration = 2000 }: FeedbackToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onDismiss, duration])

  if (!isVisible) return null

  return createPortal(
    <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
      <div className="bg-success-green text-white rounded-lg shadow-xl px-4 py-3 flex items-center gap-3 max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p className="font-medium">Thank you!</p>
          <p className="text-sm text-white/80">Your feedback helps us improve.</p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 text-white/60 hover:text-white transition-colors duration-150"
          aria-label="Dismiss notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  )
}