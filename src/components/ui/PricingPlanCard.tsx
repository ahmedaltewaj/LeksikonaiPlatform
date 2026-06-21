'use client'

import { forwardRef } from 'react'
import { Button } from './Button'
import type { PricingPlanTier } from '@/lib/supabase/database.types'

type PricingPlanCardVariant = 'default' | 'featured'

interface PricingPlanCardProps {
  tier: PricingPlanTier
  name: string
  nameDa: string
  description: string | null
  descriptionDa: string | null
  monthlyPriceDkk: number
  annualPriceDkk: number
  currency?: 'DKK' | 'EUR'
  features: string[]
  isFeatured?: boolean
  isCurrentPlan?: boolean
  onSelectPlan?: (tier: PricingPlanTier, billingCycle: 'monthly' | 'annual') => void
  isLoading?: boolean
  className?: string
}

function formatPrice(amount: number, currency: 'DKK' | 'EUR'): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 text-success flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export const PricingPlanCard = forwardRef<HTMLDivElement, PricingPlanCardProps>(
  (
    {
      tier,
      name,
      nameDa,
      description,
      descriptionDa,
      monthlyPriceDkk,
      annualPriceDkk,
      currency = 'DKK',
      features,
      isFeatured = false,
      isCurrentPlan = false,
      onSelectPlan,
      isLoading = false,
      className = '',
    },
    ref
  ) => {
    const savings = Math.round(((monthlyPriceDkk * 12 - annualPriceDkk) / (monthlyPriceDkk * 12)) * 100)

    return (
      <div
        ref={ref}
        className={`
          relative flex flex-col rounded-xl p-6
          ${isFeatured
            ? 'border-2 border-primary shadow-lg bg-white'
            : 'border border-gray-200 shadow-sm bg-white hover:border-gray-300'
          }
          ${className}
        `}
      >
        {isFeatured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
              Mest populære
            </span>
          </div>
        )}

        {isCurrentPlan && (
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Nuværende plan
            </span>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{nameDa}</h3>
          <p className="mt-1 text-sm text-gray-500">{name}</p>
          {descriptionDa && (
            <p className="mt-2 text-sm text-gray-600">{descriptionDa}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(monthlyPriceDkk, currency)}
            </span>
            <span className="text-sm text-gray-500">/md</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            eller {formatPrice(annualPriceDkk, currency)} årligt
          </p>
          {savings > 0 && (
            <p className="mt-1 text-xs font-medium text-green-600">
              Spar {savings}% med årlig betaling
            </p>
          )}
        </div>

        <div className="flex-1">
          <ul className="space-y-2.5">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm">
                <CheckIcon />
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {onSelectPlan && !isCurrentPlan && (
          <div className="mt-6 space-y-2">
            <Button
              variant={isFeatured ? 'primary' : 'secondary'}
              className="w-full"
              onClick={() => onSelectPlan(tier, 'monthly')}
              isLoading={isLoading}
            >
              Vælg månedlig
            </Button>
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => onSelectPlan(tier, 'annual')}
              isLoading={isLoading}
            >
              Skift til årlig ({formatPrice(annualPriceDkk, currency)}/år)
            </Button>
          </div>
        )}

        {isCurrentPlan && (
          <div className="mt-6">
            <Button
              variant="secondary"
              className="w-full"
              disabled
            >
              Nuværende plan
            </Button>
          </div>
        )}
      </div>
    )
  }
)

PricingPlanCard.displayName = 'PricingPlanCard'