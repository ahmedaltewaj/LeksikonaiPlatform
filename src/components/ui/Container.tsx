'use client'

import { type HTMLAttributes } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide'
}

const sizeClasses = {
  default: 'max-w-7xl',
  narrow: 'max-w-sm',
  wide: 'max-w-full',
}

export function Container({ size = 'default', className = '', children, ...props }: ContainerProps) {
  return (
    <div
      className={`mx-auto px-6 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}