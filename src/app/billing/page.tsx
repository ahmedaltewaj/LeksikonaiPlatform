'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BillingHistory } from '@/components/ui/BillingHistory'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import type { Subscription, Invoice, BillingSubscriptionStatus } from '@/lib/supabase/database.types'

const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_123',
  user_id: 'user_123',
  plan_id: 'professional',
  status: 'active',
  billing_cycle: 'monthly',
  current_period_start: '2025-04-15T00:00:00Z',
  current_period_end: '2025-05-15T00:00:00Z',
  cancel_at_period_end: false,
  canceled_at: null,
  stripe_subscription_id: 'sub_stripe_123',
  stripe_customer_id: 'cus_stripe_123',
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2025-04-15T00:00:00Z',
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_001',
    user_id: 'user_123',
    subscription_id: 'sub_123',
    stripe_invoice_id: 'in_stripe_001',
    number: 'LEK-2025-004',
    status: 'paid',
    amount_dkk: 799,
    amount_eur: null,
    currency: 'DKK',
    period_start: '2025-04-15T00:00:00Z',
    period_end: '2025-05-15T00:00:00Z',
    paid_at: '2025-04-15T10:30:00Z',
    due_date: '2025-04-20T00:00:00Z',
    invoice_url: '#',
    created_at: '2025-04-15T10:30:00Z',
    updated_at: '2025-04-15T10:30:00Z',
  },
  {
    id: 'inv_002',
    user_id: 'user_123',
    subscription_id: 'sub_123',
    stripe_invoice_id: 'in_stripe_002',
    number: 'LEK-2025-003',
    status: 'paid',
    amount_dkk: 799,
    amount_eur: null,
    currency: 'DKK',
    period_start: '2025-03-15T00:00:00Z',
    period_end: '2025-04-15T00:00:00Z',
    paid_at: '2025-03-15T09:15:00Z',
    due_date: '2025-03-20T00:00:00Z',
    invoice_url: '#',
    created_at: '2025-03-15T09:15:00Z',
    updated_at: '2025-03-15T09:15:00Z',
  },
  {
    id: 'inv_003',
    user_id: 'user_123',
    subscription_id: 'sub_123',
    stripe_invoice_id: 'in_stripe_003',
    number: 'LEK-2025-002',
    status: 'paid',
    amount_dkk: 799,
    amount_eur: null,
    currency: 'DKK',
    period_start: '2025-02-15T00:00:00Z',
    period_end: '2025-03-15T00:00:00Z',
    paid_at: '2025-02-15T14:00:00Z',
    due_date: '2025-02-20T00:00:00Z',
    invoice_url: '#',
    created_at: '2025-02-15T14:00:00Z',
    updated_at: '2025-02-15T14:00:00Z',
  },
]

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratis',
  starter: 'Start',
  professional: 'Professionel',
  enterprise: 'Enterprise',
}

const statusConfig: Record<BillingSubscriptionStatus, { label: string; badgeClass: string }> = {
  active: { label: 'Aktiv', badgeClass: 'bg-green-100 text-green-800' },
  past_due: { label: 'I restance', badgeClass: 'bg-yellow-100 text-yellow-800' },
  canceled: { label: 'Annulleret', badgeClass: 'bg-red-100 text-red-800' },
  trialing: { label: 'Prøveperiode', badgeClass: 'bg-blue-100 text-blue-800' },
  paused: { label: 'Sat på pause', badgeClass: 'bg-gray-100 text-gray-600' },
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatAmount(amount: number, currency: 'DKK' | 'EUR' = 'DKK'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function BillingPage() {
  const router = useRouter()
  const [subscription] = useState<Subscription | null>(MOCK_SUBSCRIPTION)
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES)
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log('Downloading invoice:', invoiceId)
  }

  const handleChangePlan = () => {
    router.push('/pricing')
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    try {
      console.log('Canceling subscription...')
      await new Promise(resolve => setTimeout(resolve, 500))
      setShowCancelModal(false)
    } catch (error) {
      console.error('Error canceling subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Fakturering</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen aktiv abonnement fundet.</p>
            <Button className="mt-4" onClick={() => router.push('/pricing')}>
              Se vores planer
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const status = statusConfig[subscription.status]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Fakturering</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Nuværende plan</h3>
            <p className="text-2xl font-bold text-gray-900">
              {PLAN_NAMES[subscription.plan_id] ?? subscription.plan_id}
            </p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Næste faktura</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatDate(subscription.current_period_end)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatAmount(799)} inkl. moms
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Faktureringsperiode</h3>
            <p className="text-lg font-medium text-gray-900">
              {formatDate(subscription.current_period_start)} — {formatDate(subscription.current_period_end)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Månedlig betaling
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Abonnementsdetaljer</h3>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleChangePlan}>
                Skift plan
              </Button>
              {subscription.stripe_customer_id && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const supabase = createClient()
                      const { data: { session } } = await supabase.auth.getSession()
                      if (!session) {
                        router.push('/login')
                        return
                      }
                      const res = await fetch('/api/stripe/portal', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({ customer_id: subscription.stripe_customer_id }),
                      })
                      const json = await res.json()
                      if (json.data?.url) {
                        window.location.href = json.data.url
                      }
                    } catch (error) {
                      console.error('Portal error:', error)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  isLoading={isLoading}
                >
                  Administrer fakturering
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Plan</p>
              <p className="font-medium text-gray-900">{PLAN_NAMES[subscription.plan_id]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Faktureringscyklus</p>
              <p className="font-medium text-gray-900">
                {subscription.billing_cycle === 'monthly' ? 'Månedlig' : 'Årlig'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Startdato</p>
              <p className="font-medium text-gray-900">{formatDate(subscription.current_period_start)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Pris</p>
              <p className="font-medium text-gray-900">{formatAmount(799)}/md</p>
            </div>
          </div>

          {!subscription.cancel_at_period_end && (
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Annuller abonnement
              </button>
            </div>
          )}

          {subscription.cancel_at_period_end && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-warning">
                Dit abonnement annullères {formatDate(subscription.current_period_end)}
              </p>
            </div>
          )}
        </div>

        <BillingHistory
          invoices={invoices}
          onDownloadInvoice={handleDownloadInvoice}
        />

        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Annuller abonnement?</h3>
              <p className="text-gray-600 mb-6">
                Er du sikker på at du vil annullere dit abonnement? Du mister adgang til betalte funktioner ved periodens udløb.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                  Behold abonnement
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription} isLoading={isLoading}>
                  Annuller abonnement
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}