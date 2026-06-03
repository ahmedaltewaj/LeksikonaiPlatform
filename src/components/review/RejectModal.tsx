'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onReject: (reason: string) => void
}

export function RejectModal({ isOpen, onClose, onReject }: RejectModalProps) {
  const [reason, setReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    setTimeout(() => textareaRef.current?.focus(), 50)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleReject = () => {
    setIsRejecting(true)
    setTimeout(() => {
      onReject(reason)
      setIsRejecting(false)
      setReason('')
    }, 300)
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-error"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 id="reject-modal-title" className="text-xl font-semibold text-gray-900 mb-2">
            Reject Response
          </h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to reject this response? You can optionally provide a reason for the rejection.
          </p>
        </div>

        {/* Reason Textarea */}
        <div className="mb-6">
          <label htmlFor="reject-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <Textarea
            ref={textareaRef}
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter a reason for rejecting this response..."
            maxLength={500}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-400 text-right">
            {reason.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isRejecting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            isLoading={isRejecting}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  )
}