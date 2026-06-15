import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { PricingPlan } from '@/lib/supabase/database.types'
import { authenticateRequest } from '@/lib/supabase/auth'

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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    const activePlans = PLANS.filter(plan => plan.is_active)
    return NextResponse.json({ plans: activePlans })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

const selectPlanSchema = z.object({
  plan_tier: z.enum(['free', 'starter', 'professional', 'enterprise']),
  billing_cycle: z.enum(['monthly', 'annual']),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return auth.error

    const body = await request.json()
    const validated = selectPlanSchema.parse(body)
    const plan = PLANS.find(p => p.tier === validated.plan_tier)

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    console.log('Plan selected by user', auth.user.id, ':', validated.plan_tier, 'billing:', validated.billing_cycle)

    return NextResponse.json({
      success: true,
      plan: plan,
      billing_cycle: validated.billing_cycle,
      message: 'Plan selection processed',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error selecting plan:', error)
    return NextResponse.json(
      { error: 'Failed to select plan' },
      { status: 500 }
    )
  }
}