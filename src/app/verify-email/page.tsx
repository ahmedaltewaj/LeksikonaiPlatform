'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

function EmailVerificationContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resent, setResent] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleResend = async () => {
    if (!email || isResending) return

    setIsResending(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      setResent(true)
    } catch (error) {
      console.error('Error resending verification:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md text-center">
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tjek din email
        </h1>
        <p className="text-gray-500">
          Vi har sendt et verifikationslink til{' '}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
        <h2 className="text-sm font-medium text-gray-700 mb-2">
          Næste step:
        </h2>
        <ol className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">1.</span>
            <span>Åbn emailen fra Leksikon.ai</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">2.</span>
            <span>Klik på verifikationslinket</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary font-medium">3.</span>
            <span>Kom i gang med at sætte din AI-assistent op</span>
          </li>
        </ol>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Brugte du ikke den rigtige email?{' '}
        <Link href="/signup" className="text-primary hover:underline">
          Prøv igen
        </Link>
      </p>

      {resent ? (
        <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
          ✓ Et nyt verifikationslink er sendt!
        </p>
      ) : (
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          {isResending ? 'Sender...' : 'Send verifikationslink igen'}
        </button>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Vi glæder os til at hjælpe dig med at automatisere dine kundesvar!
        </p>
      </div>
    </Card>
  )
}

function EmailVerificationLoading() {
  return (
    <Card className="w-full max-w-md text-center p-8">
      <div className="animate-pulse">
        <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full mb-4" />
        <div className="h-8 bg-gray-200 rounded mb-2 w-48 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
      </div>
    </Card>
  )
}

export default function EmailVerificationNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<EmailVerificationLoading />}>
        <EmailVerificationContent />
      </Suspense>
    </div>
  )
}