import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)

    // Check if user needs onboarding
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userRecord } = await supabase
        .from('users')
        .select('onboarding_completed_at')
        .eq('id', user.id)
        .single()

      const hasCompletedOnboarding = !!userRecord?.onboarding_completed_at

      // If next param is set, use it; otherwise check onboarding status
      const redirectPath = next !== '/dashboard' ? next : (hasCompletedOnboarding ? '/dashboard' : '/onboarding')
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}${next ?? '/dashboard'}`)
}