'use client'

import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`min-h-[120px] px-3 py-3 text-base border rounded-lg transition-colors duration-150 resize-y
          ${error 
            ? 'border-error ring-2 ring-error/20 focus:border-error focus:ring-error/20' 
            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          placeholder:text-gray-400
          ${className}`}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'