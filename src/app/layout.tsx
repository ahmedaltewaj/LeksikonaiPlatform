'use client'

import './globals.css'
import { type ReactNode } from 'react'
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="da">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}