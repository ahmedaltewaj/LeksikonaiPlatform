'use client'

import { type ReactNode } from 'react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
