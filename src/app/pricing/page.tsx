'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingPlanCard } from '@/components/ui/PricingPlanCard'
import { createClient } from '@/lib/supabase/client'
import type { PricingPlanTier, PricingPlan } from '@/lib/supabase/database.types'

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    tier: 'free',
    name: 'Free',
    name_da: 'Gratis',
    description: 'Perfekt til at komme i gang og teste grundlæggende funktioner.',
    description_da: 'Perfekt til at komme i gang og teste grundlæggende funktioner.',
    monthly_price_dkk: 0,
    monthly_price_eur: 0,
    annual_price_dkk: 0,
    annual_price_eur: 0,
    currency: 'DKK',
    features: [
      'Op til 25 henvendelser/måned',
      '1 email konto',
      'AI-genererede svar',
      'Dansk sprogunderstøttelse',
      'Basis analyse',
    ],
    limits: {
      monthly_inquiries: 25,
      team_members: 1,
      email_accounts: 1,
      ai_generated_responses: 25,
    },
    is_active: true,
    is_featured: false,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'starter',
    tier: 'starter',
    name: 'Starter',
    name_da: 'Start',
    description: 'For små virksomheder der vil have mere ud af AI-assistenten.',
    description_da: 'For små virksomheder der vil have mere ud af AI-assistenten.',
    monthly_price_dkk: 299,
    monthly_price_eur: null,
    annual_price_dkk: 2748,
    annual_price_eur: null,
    currency: 'DKK',
    features: [
      'Op til 150 henvendelser/måned',
      '3 email konti',
      'AI-genererede svar',
      'Dansk sprogunderstøttelse',
      'Detaljeret analyse',
      'Email support',
    ],
    limits: {
      monthly_inquiries: 150,
      team_members: 3,
      email_accounts: 3,
      ai_generated_responses: 150,
    },
    is_active: true,
    is_featured: false,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'professional',
    tier: 'professional',
    name: 'Professional',
    name_da: 'Professionel',
    description: 'For voksende virksomheder med behov for avanceret automation.',
    description_da: 'For voksende virksomheder med behov for avanceret automation.',
    monthly_price_dkk: 799,
    monthly_price_eur: null,
    annual_price_dkk: 7188,
    annual_price_eur: null,
    currency: 'DKK',
    features: [
      'Op til 500 henvendelser/måned',
      '10 email konti',
      'AI-genererede svar med avanceret redigering',
      'Dansk sprogunderstøttelse',
      'Avanceret analyse og rapportering',
      'Prioritets email support',
      'API adgang',
    ],
    limits: {
      monthly_inquiries: 500,
      team_members: 10,
      email_accounts: 10,
      ai_generated_responses: 500,
    },
    is_active: true,
    is_featured: true,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'enterprise',
    tier: 'enterprise',
    name: 'Enterprise',
    name_da: 'Enterprise',
    description: 'Skræddersyet løsning til store organisationer.',
    description_da: 'Skræddersyet løsning til store organisationer.',
    monthly_price_dkk: 1999,
    monthly_price_eur: null,
    annual_price_dkk: 17988,
    annual_price_eur: null,
    currency: 'DKK',
    features: [
      'Ubegrænsede henvendelser',
      'Ubegrænsede email konti',
      'AI-genererede svar med fuld kontrol',
      'Dansk sprogunderstøttelse',
      'Custom rapportering og integrationer',
      'Dedikeret account manager',
      'SLA og sikkerhedscertificeringer',
    ],
    limits: {
      monthly_inquiries: null,
      team_members: null,
      email_accounts: null,
      ai_generated_responses: null,
    },
    is_active: true,
    is_featured: false,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    created_at: '',
    updated_at: '',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Kan jeg skifte plan når som helst?',
    a: 'Ja, du kan til enhver tid opgradere eller nedgradere din plan. Ændringer træder i kraft fra næste faktureringsperiode.',
  },
  {
    q: 'Hvad sker der når jeg når min grænse for henvendelser?',
    a: 'Når du når din månedlige grænse, kan du stadig se og håndtere eksisterende henvendelser, men nye vil blive sat i kø til næste måned.',
  },
  {
    q: 'Er der en gratis prøveperiode?',
    a: 'Ja, alle betalte planer har en 14-dages gratis prøveperiode. Du kan annullere når som helst i prøveperioden uden omkostninger.',
  },
  {
    q: 'Hvordan fungerer årlig fakturering?',
    a: 'Ved årlig fakturering betaler du for hele året på forhånd og får typisk 15-20% rabat sammenlignet med månedlig fakturering.',
  },
  {
    q: 'Tilbyder I refusion?',
    a: 'Vi tilbyder fuld refusion inden for 30 dage efter dit første køb, hvis du ikke er tilfreds med tjenesten.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [currentTier, setCurrentTier] = useState<PricingPlanTier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSelectPlan = async (tier: PricingPlanTier, billingCycle: 'monthly' | 'annual') => {
    const priceIds: Record<PricingPlanTier, string> = {
      free: '',
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? 'price_starter_monthly',
      professional: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID ?? 'price_professional_monthly',
      enterprise: '',
    }

    const priceId = priceIds[tier]
    if (!priceId || tier === 'free' || tier === 'enterprise') {
      router.push('/pricing')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ price_id: priceId }),
      })

      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      } else {
        throw new Error(json.error ?? 'Checkout failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      router.push('/pricing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Priser</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vælg den plan der passer til din virksomhed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start gratis og skift til en betalt plan når du er klar. Alle priser er i danske kroner og ekskl. moms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PLANS.map(plan => (
            <PricingPlanCard
              key={plan.tier}
              tier={plan.tier}
              name={plan.name}
              nameDa={plan.name_da}
              description={plan.description}
              descriptionDa={plan.description_da}
              monthlyPriceDkk={plan.monthly_price_dkk}
              annualPriceDkk={plan.annual_price_dkk}
              currency={plan.currency}
              features={plan.features}
              isFeatured={plan.is_featured}
              isCurrentPlan={currentTier === plan.tier}
              onSelectPlan={handleSelectPlan}
              isLoading={isLoading}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-16">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Ofte stillede spørgsmål</h3>
          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-gray-900">{item.q}</span>
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 text-gray-600">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Har du spørgsmål om priser eller virksomhedsløsninger?</p>
          <a
            href="mailto:info@leksikon.ai"
            className="text-primary hover:text-primary-hover font-medium"
          >
            Kontakt os for enterprise-priser
          </a>
        </div>
      </main>
    </div>
  )
}