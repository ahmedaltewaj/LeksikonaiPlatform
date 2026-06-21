'use client'

import { type HTMLAttributes, forwardRef } from 'react'

type CardVariant = 'default' | 'elevated' | 'interactive'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-gray-200 shadow-sm',
  elevated: 'shadow-md',
  interactive: 'border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl p-5 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'