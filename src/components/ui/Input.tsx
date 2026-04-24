'use client'

import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-10 px-3 text-base border rounded-lg transition-colors duration-150 
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

Input.displayName = 'Input'