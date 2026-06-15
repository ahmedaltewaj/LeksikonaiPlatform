'use client'

import { type HTMLAttributes } from 'react'

type BadgeVariant = 'pending' | 'approved' | 'draft' | 'edited' | 'sent' | 'archived' | 'error'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  draft: 'bg-gray-100 text-gray-700',
  edited: 'bg-blue-100 text-blue-800',
  sent: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-gray-200 text-gray-500',
  error: 'bg-red-100 text-red-800',
}

export function Badge({ variant = 'draft', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center py-1 px-2 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}