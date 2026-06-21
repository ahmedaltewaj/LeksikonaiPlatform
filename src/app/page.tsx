import type { Metadata } from 'next'
import HomeContent from '@/components/HomeContent'

export const metadata: Metadata = {
  title: 'Leksikon.ai — AI-drevet kundeservice for danske SMV\'er',
  description: 'Leksikon.ai hjælper danske små virksomheder med at besvare kundeemails med AI-genererede svar, du godkender før afsendelse.',
  openGraph: {
    title: 'Leksikon.ai — AI-drevet kundeservice',
    description: 'Besvar kundeemails på dansk med AI. Godkend før afsendelse.',
    url: 'https://leksikon.ai',
    siteName: 'Leksikon.ai',
  },
}

export default function HomePage() {
  return <HomeContent />
}