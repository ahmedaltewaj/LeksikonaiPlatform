'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function SuccessPage() {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'failed'>('sending')

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const sendWelcomeEmail = async () => {
      const profileData = localStorage.getItem('onboarding_profile')
      if (!profileData) {
        setEmailStatus('failed')
        return
      }

      try {
        const profile = JSON.parse(profileData)
        const appUrl = window.location.origin

        try {
          await fetch('/api/onboarding/track-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: profile.email })
          })
        } catch (e) {
          // metrics tracking failure should not block onboarding
        }

        const response = await fetch('/api/onboarding/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'welcome',
            recipientEmail: profile.email || 'user@example.com',
            recipientName: profile.yourName || 'Bruger',
            companyName: profile.companyName || 'din virksomhed',
            dashboardUrl: `${appUrl}/dashboard`
          })
        })

        if (response.ok) {
          setEmailStatus('sent')
        } else {
          setEmailStatus('failed')
        }
      } catch (error) {
        console.error('Failed to send welcome email:', error)
        setEmailStatus('failed')
      }
    }

    sendWelcomeEmail()
  }, [])

  const handleGoToDashboard = () => {
    localStorage.removeItem('onboarding_profile')
    localStorage.removeItem('onboarding_connect')
    localStorage.removeItem('onboarding_identity')
    localStorage.removeItem('onboarding_test')
    router.push('/dashboard')
  }

  return (
    <Card className="text-center py-12">
      <div className="relative mb-8">
        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        {showConfetti && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4],
                  transform: `rotate(${i * 30}deg) translateY(-40px)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Du er klar!
      </h1>
      <p className="text-lg text-gray-500 mb-4 max-w-md mx-auto">
        Din AI-assistent er nu sat op og klar til at hjælpe dig med at besvare kundeforespørgsler.
      </p>

      {emailStatus === 'sending' && (
        <p className="text-sm text-gray-400 mb-4">Sender velkomstemail...</p>
      )}
      {emailStatus === 'sent' && (
        <p className="text-sm text-emerald-600 mb-4">✓ Velkomstemail er sendt!</p>
      )}
      {emailStatus === 'failed' && (
        <p className="text-sm text-gray-400 mb-4">Kunne ikke sende velkomstemail (uskyldig)</p>
      )}

      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-medium text-gray-900 mb-3">Næste steps:</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">1.</span>
            <span>Dit dashboard viser alle indkommende forespørgsler</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">2.</span>
            <span>Klik på en forespørgsel for at se den</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">3.</span>
            <span>Godkend eller rediger AI-genererede svar</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary font-medium">4.</span>
            <span>Send svaret med ét klik</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 max-w-md mx-auto">
        <Button onClick={handleGoToDashboard} size="lg">
          Gå til dashboard
        </Button>
        <Button variant="ghost" onClick={() => window.open('/help', '_blank')}>
          Læs vores tips
        </Button>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Velkommen til Leksikon.ai — vi glæder os til at hjælpe dig!
      </p>
    </Card>
  )
}