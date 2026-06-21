'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

function BillingContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Abonnement aktiveret!
          </h1>

          <p className="text-gray-600 mb-8">
            Din {sessionId ? 'betalt' : 'ny'} plan er nu aktiv. Du kan nu nyde alle fordelene ved dit nye abonnement.
          </p>

          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8">
            Abonnement aktiv
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => window.location.href = '/dashboard'}>
              Gå til Dashboard
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/billing'}>
              Administrer Fakturering
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          En bekræftelsesmail er sendt til din email.
        </p>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <BillingContent />
    </Suspense>
  )
}