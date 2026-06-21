'use client'

import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`h-10 px-3 pr-10 text-base border rounded-lg transition-colors duration-150 appearance-none bg-white
          ${error 
            ? 'border-error ring-2 ring-error/20 focus:border-error focus:ring-error/20' 
            : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
          }
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          bg-no-repeat bg-[right_12px_center]
          ${className}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '20px' }}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'