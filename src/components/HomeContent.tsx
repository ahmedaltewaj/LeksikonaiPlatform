'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const NAV_LINKS = [
  { label: 'Produkt', href: '#features' },
  { label: 'Priser', href: '/pricing' },
]

export default function HomeContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newsletterName, setNewsletterName] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setMobileMenuOpen(false)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewsletterStatus('loading')
    setNewsletterMessage('')

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, name: newsletterName }),
      })

      if (res.ok) {
        setNewsletterStatus('success')
        setNewsletterMessage('Tak for din tilmelding!')
        setNewsletterName('')
        setNewsletterEmail('')
      } else {
        const data = await res.json()
        setNewsletterStatus('error')
        setNewsletterMessage(data.error || 'Noget gik galt. Prøv igen.')
      }
    } catch {
      setNewsletterStatus('error')
      setNewsletterMessage('Noget gik galt. Prøv igen.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-brand-navy">Leksikon.ai</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log ind
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Start gratis
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Åbn menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log ind
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start gratis
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-navy via-blue-900 to-brand-navy">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Svar på kundehenvendelser på dansk — uden at løfte en finger
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto lg:mx-0">
                Leksikon.ai hjælper danske små virksomheder med at besvare kundeemails med AI-genererede svar, du godkender før afsendelse.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30"
                >
                  Start gratis
                </Link>
                <button
                  onClick={() => scrollToSection('#how-it-works')}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Se hvordan det virker
                </button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-info/20 rounded-2xl blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">Ny henvendelse fra kunde@virksomhed.dk</p>
                        <p className="text-xs text-gray-400 mt-1">for 2 minutter siden</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm text-white">Hej, jeg vil gerne vide mere om jeres priser...</p>
                    </div>
                    <div className="bg-primary/20 rounded-lg p-4 border border-primary/30">
                      <p className="text-sm text-white">Hej [Kundenavn], tak for jeres henvendelse. Vi tilbyder...</p>
                      <p className="text-xs text-gray-400 mt-2">AI-genereret svar • Klar til godkendelse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a4 4 0 00-5.657-5.657l-1 1.414 1.414 1.414 5.657-5.657zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Dansk virksomhed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">GDPR-sikker</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-2.707a1 1 0 00-1.414-1.414L11 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Ingen kredit kort</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">Brugt af 50+ danske SMV&apos;er</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Sådan virker det
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tre simple trin til at automatisere dine kundesvar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Modtag henvendelser</h3>
                <p className="text-gray-600">
                  Tilslut din email eller webformular. Nye henvendelser kommer automatisk ind i dit dashboard.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI genererer svar</h3>
                <p className="text-gray-600">
                  Gemini analyserer henvendelsen og skriver et professionelt svar på dansk. Klar til dig.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-lg font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Godkend og send</h3>
              <p className="text-gray-600">
                Gennemgå svaret med ét klik. Rediger hvis nødvendigt, eller godkend og send med det samme.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Nøglefunktioner
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designet til danske virksomheder
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dansk sprogunderstøttelse</h3>
              <p className="text-gray-600 text-sm">
                AI&apos;en er trænet i dansk sprog og forstår danske virksomhedstoner og udtryk.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email integration</h3>
              <p className="text-gray-600 text-sm">
                Forbind nemt med Postmark, SendGrid eller andre emailudbydere.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-4M12 6v1m4.364 1.636l-.707-.707M4 12h4m-3.636 1.636l.707-.707M12 18v1M8 12v1m5.636-1.636l.707.707M15 12v1m-1.636-1.636l.707-.707" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI response generation</h3>
              <p className="text-gray-600 text-sm">
                Avanceret Gemini AI genererer professionelle svar baseret på din virksomheds stil.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard analyse</h3>
              <p className="text-gray-600 text-sm">
                Følg med i svartider, godkendelsesrate og andre vigtige metrics.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">GDPR compliant</h3>
              <p className="text-gray-600 text-sm">
                Alle data opbevares sikkert i Danmark og overholder GDPR-regler.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hurtig opsætning</h3>
              <p className="text-gray-600 text-sm">
                Kom i gang på under 5 minutter. Ingen teknisk viden kræves.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-brand-navy to-blue-900 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Perfekt til at komme i gang — gratis for altid
            </h2>
            <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Start med gratis plan og opgrader når du har brug for mere.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-brand-navy bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Se alle priser
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Ofte stillede spørgsmål
            </h2>
          </div>

          <div className="space-y-4">
            <FAQItem
              question="Hvad er Leksikon.ai?"
              answer="Leksikon.ai er en AI-drevet kundeservice-assistent designet til danske små virksomheder. Den modtager kundehenvendelser, genererer professionelle svar på dansk, og lader dig godkende eller redigere før afsendelse."
            />
            <FAQItem
              question="Hvordan fungerer AI-svarene?"
              answer="Når en kunde sender en henvendelse, analyserer vores AI den og genererer et svar baseret på din virksomheds stil og tone. Du får altid mulighed for at gennemse og redigere svaret, før det sendes til kunden."
            />
            <FAQItem
              question="Er det sikkert?"
              answer="Ja. Leksikon.ai er fuldt GDPR-kompatibel. Alle data opbevares sikkert i Danmark, og vi deler aldrig dine data med tredjepart. Du kan læse mere i vores privatlivspolitik."
            />
            <FAQItem
              question="Kan jeg prøve det gratis?"
              answer="Ja! Vi har en gratis plan hvor du kan teste alle grundlæggende funktioner med op til 25 henvendelser om måneden. Der kræves ingen kredit kort."
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Bliv opdateret med tips til din virksomhed
              </h2>
              <p className="text-lg text-gray-600">
                Tilmeld dig vores nyhedsbrev og få tips til at forbedre din kundeservice.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Navn
                  </label>
                  <Input
                    id="newsletter-name"
                    type="text"
                    placeholder="Dit navn"
                    value={newsletterName}
                    onChange={(e) => setNewsletterName(e.target.value)}
                    required
                    disabled={newsletterStatus === 'loading'}
                  />
                </div>
                <div>
                  <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="din@email.dk"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={newsletterStatus === 'loading'}
                  />
                </div>
              </div>

              {newsletterMessage && (
                <div className={`text-sm font-medium ${newsletterStatus === 'success' ? 'text-success' : 'text-error'}`}>
                  {newsletterMessage}
                </div>
              )}

              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={newsletterStatus === 'loading'}
                  disabled={newsletterStatus === 'loading'}
                >
                  Tilmeld
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-md text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gratis plan</h3>
              <p className="text-gray-600 text-sm mb-6">
                Op til 25 henvendelser om måneden. Ingen kredit kort kræves.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
              >
                Start gratis
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Betalte planer fra <Link href="/pricing" className="text-primary hover:underline">299 DKK/måned</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-xl font-bold text-white">Leksikon.ai</span>
              <p className="text-sm text-gray-400 mt-2">
                AI-powered customer communication for Danish SMEs.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produkt</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Priser
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Funktioner
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Juridisk</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privatlivspolitik
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Vilkår
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Kontakt</h4>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:info@leksikon.ai" className="text-sm text-gray-400 hover:text-white transition-colors">
                    info@leksikon.ai
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              &copy; 2026 Leksikon.ai. Alle rettigheder forbeholdes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900">{question}</span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  )
}