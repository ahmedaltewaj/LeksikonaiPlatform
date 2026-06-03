'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function BillingCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Betaling annulleret
          </h1>

          <p className="text-gray-600 mb-8">
            Din betaling blev annulleret, og der er ikke blevet debiteret noget. Du kan altid vende tilbage og prøve igen, når du er klar.
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/pricing')}>
              Tilbage til Priser
            </Button>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>
              Gå til Dashboard
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Har du spørgsmål? Kontakt os på{' '}
          <a href="mailto:support@leksikon.ai" className="text-primary hover:underline">
            support@leksikon.ai
          </a>
        </p>
      </div>
    </div>
  )
}