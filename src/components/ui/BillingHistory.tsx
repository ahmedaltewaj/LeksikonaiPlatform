'use client'

import { forwardRef } from 'react'
import type { Invoice, InvoiceStatus } from '@/lib/supabase/database.types'

interface BillingHistoryProps {
  invoices: Invoice[]
  isLoading?: boolean
  onDownloadInvoice?: (invoiceId: string) => void
  className?: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatAmount(amountDkk: number, currency: 'DKK' | 'EUR' = 'DKK'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amountDkk)
}

const statusConfig: Record<InvoiceStatus, { label: string; badgeClass: string }> = {
  draft: { label: 'Kladde', badgeClass: 'bg-gray-100 text-gray-600' },
  open: { label: 'Åben', badgeClass: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Betalt', badgeClass: 'bg-green-100 text-green-700' },
  uncollectible: { label: 'Inkasserbar', badgeClass: 'bg-red-100 text-red-700' },
  void: { label: 'Annulleret', badgeClass: 'bg-gray-100 text-gray-500' },
}

export const BillingHistory = forwardRef<HTMLDivElement, BillingHistoryProps>(
  ({ invoices, isLoading = false, onDownloadInvoice, className = '' }, ref) => {
    if (isLoading) {
      return (
        <div ref={ref} className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (invoices.length === 0) {
      return (
        <div ref={ref} className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Fakturaoversigt</h3>
          </div>
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500">Ingen fakturaer endnu</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fakturaoversigt</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Faktura nr.</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Periode</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Beløb</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Dato</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(invoice => {
                const status = statusConfig[invoice.status]
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {invoice.number ?? `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(invoice.period_start)} — {formatDate(invoice.period_end)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatAmount(invoice.amount_dkk, invoice.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.badgeClass}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invoice.paid_at ? formatDate(invoice.paid_at) : formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {invoice.invoice_url && (
                        <button
                          type="button"
                          onClick={() => onDownloadInvoice?.(invoice.id)}
                          className="text-primary hover:text-primary-hover font-medium"
                        >
                          Download PDF
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

BillingHistory.displayName = 'BillingHistory'