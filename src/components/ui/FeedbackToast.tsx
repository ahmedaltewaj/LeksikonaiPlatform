'use client'

import { useEffect, useState } from 'react'

interface FeedbackToastProps {
  show: boolean
  message?: string
  onDismiss: () => void
}

export function FeedbackToast({ show, message = "Thanks for your feedback!", onDismiss }: FeedbackToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
    } else {
      // Fade out animation
      const timer = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [show])

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-3 transition-opacity duration-300 z-50 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      role="alert"
    >
      {/* Checkmark icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="font-medium">{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 hover:opacity-80 transition-opacity"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}