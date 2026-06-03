'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const DEMO_INQUIRY = {
  senderName: 'Thomas Hansen',
  body: 'Hej, jeg vil gerne høre mere om jeres regnskabstjenester. Hvad koster det for en årlig selvangivelse for en lille virksomhed med 2-5 ansatte?',
}

export default function TestPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'generating' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')
  const [demoResponse, setDemoResponse] = useState<string | null>(null)

  const handleSendTest = async () => {
    setIsLoading(true)
    setTestStatus('testing')
    setTestMessage('')
    
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        throw new Error('Not authenticated')
      }

      localStorage.getItem('onboarding_connect')
      localStorage.getItem('onboarding_profile')
      localStorage.getItem('onboarding_identity')
      
      setTestStatus('generating')
      setTestMessage('Genererer din første AI-respons...')
      
      const response = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: session.user.id,
          source: 'web_form',
          senderEmail: 'thomas@example.dk',
          senderName: DEMO_INQUIRY.senderName,
          bodyText: DEMO_INQUIRY.body,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate demo response')
      }

      const { data: result } = await response.json()
      setDemoResponse(result.response.ai_generated_text)
      setTestStatus('success')
      setTestMessage('Din forbindelse virker! Her er din første AI-genererede respons.')
    } catch (error) {
      console.error('Test error:', error)
      setTestStatus('error')
      setTestMessage('Noget gik galt — prøv igen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding_test', JSON.stringify({
      completedAt: new Date().toISOString(),
    }))
    localStorage.setItem('onboarding_completed', 'true')
    router.push('/onboarding/success')
  }

  return (
    <Card className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Test din forbindelse
      </h1>
      <p className="text-gray-500 mb-6">
        Lad os sikre, at alt er sat op korrekt, før du starter.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Hvad skal vi teste?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Email-forbindelse (hvis konfigureret)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>Webhook-modtagelse (hvis konfigureret)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            <span>AI-responsgenerering</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Demo: Thomas Hansen</h4>
        <p className="text-sm text-blue-700 mb-1">
          <strong>Nore:</strong> {DEMO_INQUIRY.senderName}
        </p>
        <p className="text-sm text-blue-700">
          <strong>Besked:</strong> {DEMO_INQUIRY.body}
        </p>
      </div>

      {testStatus === 'idle' && (
        <Button onClick={handleSendTest} isLoading={isLoading}>
          Generer AI-respons til demo
        </Button>
      )}

      {(testStatus === 'testing' || testStatus === 'generating') && (
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-gray-600">
            {testStatus === 'testing' ? 'Tester din forbindelse...' : 'Genererer din første AI-respons...'}
          </span>
        </div>
      )}

      {testStatus === 'success' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
            <span className="text-emerald-600 text-xl">✓</span>
            <div>
              <p className="font-medium text-emerald-900">Perfekt!</p>
              <p className="text-sm text-emerald-700 mt-1">{testMessage}</p>
            </div>
          </div>
          
          {demoResponse && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">AI-genereret respons:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{demoResponse}</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button onClick={handleComplete}>
              fortsæt
            </Button>
            <Button variant="secondary" onClick={handleSendTest}>
              Generer ny respons
            </Button>
          </div>
        </div>
      )}

      {testStatus === 'error' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <span className="text-red-600 text-xl">✗</span>
            <div>
              <p className="font-medium text-red-900">Fejl</p>
              <p className="text-sm text-red-700 mt-1">{testMessage}</p>
            </div>
          </div>
          <Button onClick={handleSendTest}>
            Prøv igen
          </Button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/onboarding/success')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Spring test over og fortsæt til dashboard →
        </button>
      </div>
    </Card>
  )
}