'use client'

import { useEffect } from 'react'

interface FeedbackButtonProps {
  onClick: () => void
  visible?: boolean
}

export function FeedbackButton({ onClick, visible = true }: FeedbackButtonProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClick()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClick, visible])

  if (!visible) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-brand-navy text-white rounded-full shadow-lg hover:bg-brand-navy/90 transition-all duration-150 p-4 group"
      aria-label="Open feedback form"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 transform transition-transform duration-150 group-hover:scale-110"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </button>
  )
}