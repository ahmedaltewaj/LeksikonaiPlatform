'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

type ConnectionMethod = 'email' | 'webform' | null

const EMAIL_PROVIDERS = [
  { value: 'gmail', label: 'Gmail', icon: '📧' },
  { value: 'outlook', label: 'Outlook', icon: '📧' },
  { value: 'imap', label: 'Andet (IMAP)', icon: '📬' },
]

const STEPS = {
  selectMethod: 'selectMethod',
  emailConnect: 'emailConnect',
  webformSetup: 'webformSetup',
}

interface FormData {
  emailProvider: string
  emailAddress: string
  webformEmbed: string
}

interface EmailConfig {
  id?: string
  email_address?: string
  email_provider?: string
  status?: string
  is_verified?: boolean
  webhook_url?: string
}

export default function ConnectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionMethod, setConnectionMethod] = useState<ConnectionMethod>(null)
  const [currentStep, setCurrentStep] = useState(STEPS.selectMethod)
  const [formData, setFormData] = useState<FormData>({
    emailProvider: '',
    emailAddress: '',
    webformEmbed: '',
  })
  const [existingConfig, setExistingConfig] = useState<EmailConfig | null>(null)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [debugUrl, setDebugUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchExistingConfig()
  }, [])

  async function fetchExistingConfig() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      const res = await fetch('/api/onboarding/email-config', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setExistingConfig(json.data)
          if (json.data.email_address) {
            setFormData(prev => ({
              ...prev,
              emailAddress: json.data.email_address,
              emailProvider: json.data.email_provider || ''
            }))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching email config:', error)
    }
  }

  async function handleSaveEmailConfig() {
    if (!formData.emailAddress || !formData.emailProvider) return
    
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      const res = await fetch('/api/onboarding/email-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email_address: formData.emailAddress,
          email_provider: formData.emailProvider,
          webhook_url: `https://api.leksikon.dk/webhook/email/${session.user.id}`
        })
      })

      if (res.ok) {
        await fetchExistingConfig()
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving email config:', error)
      return false
    }
  }

  async function handleSendVerification() {
    if (!formData.emailAddress) return

    setIsSendingVerification(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      const saved = await handleSaveEmailConfig()
      if (!saved) return

      const res = await fetch('/api/onboarding/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email_address: formData.emailAddress
        })
      })

      if (res.ok) {
        const json = await res.json()
        setVerificationSent(true)
        if (json.debug_url) {
          setDebugUrl(json.debug_url)
        }
      }
    } catch (error) {
      console.error('Error sending verification:', error)
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    try {
      if (connectionMethod === 'email' && formData.emailAddress) {
        await handleSaveEmailConfig()
      }

      localStorage.setItem('onboarding_connect', JSON.stringify({
        method: connectionMethod,
        data: formData,
        completedAt: new Date().toISOString(),
      }))
      
      router.push('/onboarding/identity')
    } catch (error) {
      console.error('Error saving connection:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_connect', JSON.stringify({
      skipped: true,
      completedAt: new Date().toISOString(),
    }))
    router.push('/onboarding/identity')
  }

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Hvordan vil du modtage kundeforespørgsler?
      </h2>
      <p className="text-gray-500 mb-6">
        Vælg den metode, der passer bedst til din virksomhed.
      </p>

      <button
        type="button"
        onClick={() => {
          setConnectionMethod('email')
          setCurrentStep(STEPS.emailConnect)
        }}
        className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl">📧</span>
          <div>
            <h3 className="font-medium text-gray-900">Email-integration</h3>
            <p className="text-sm text-gray-500 mt-1">
              Forbind din indbakke, så kundeforespørgsler automatisk dukker op i dit dashboard
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => {
          setConnectionMethod('webform')
          setCurrentStep(STEPS.webformSetup)
        }}
        className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all text-left"
      >
        <div className="flex items-start gap-4">
          <span className="text-2xl">📋</span>
          <div>
            <h3 className="font-medium text-gray-900">Webformular</h3>
            <p className="text-sm text-gray-500 mt-1">
              Embed vores formular på din hjemmeside, så kunder kan sende beskeder direkte
            </p>
          </div>
        </div>
      </button>
    </div>
  )

  const renderEmailConnect = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setCurrentStep(STEPS.selectMethod)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        ← Tilbage
      </button>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Forbind din email
      </h2>
      <p className="text-gray-500 mb-6">
        Vælg din email-udbyder og log ind for at forbinde din indbakke.
      </p>

      <div className="space-y-3">
        {EMAIL_PROVIDERS.map(provider => (
          <button
            key={provider.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, emailProvider: provider.value }))}
            className={`w-full p-4 border rounded-xl transition-all text-left flex items-center gap-4 ${
              formData.emailProvider === provider.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="font-medium text-gray-900">{provider.label}</span>
          </button>
        ))}
      </div>

      {(formData.emailProvider === 'imap' || formData.emailProvider) && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email-adresse
            </label>
            <Input
              id="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, emailAddress: e.target.value }))}
              placeholder="din@email.dk"
            />
          </div>

          {existingConfig && existingConfig.webhook_url && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Din Webhook URL:</p>
              <code className="text-xs bg-gray-200 px-2 py-1 rounded break-all">
                {existingConfig.webhook_url}
              </code>
              <p className="text-xs text-gray-500 mt-2">
                Brug denne URL i din email providers webhook-indstillinger
              </p>
            </div>
          )}

          {existingConfig?.status === 'verified' && (
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="text-lg">✓</span>
              <span className="text-sm font-medium">Email verificeret</span>
            </div>
          )}

          {existingConfig?.status === 'pending' && !existingConfig.is_verified && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <span className="text-lg">⏳</span>
                <span className="text-sm font-medium">Afventer verificering</span>
              </div>
              {!verificationSent ? (
                <Button
                  onClick={handleSendVerification}
                  isLoading={isSendingVerification}
                  variant="secondary"
                  size="sm"
                >
                  Send verificeringslink igen
                </Button>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Verificeringslink sendt! Tjek din indbakke.</p>
                  {debugUrl && (
                    <a href={debugUrl} className="text-primary hover:underline mt-1 block">
                      (Debug: Åbn verificeringslink)
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {existingConfig?.status === 'not_configured' && !existingConfig.is_verified && (
            <Button
              onClick={handleSendVerification}
              isLoading={isSendingVerification}
              variant="secondary"
              size="sm"
            >
              Send verificeringslink
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Spring dette over for nu
        </button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
          disabled={
            !formData.emailProvider || 
            (formData.emailProvider === 'imap' && !formData.emailAddress)
          }
        >
          Forbind
        </Button>
      </div>
    </div>
  )

  const renderWebformSetup = () => (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setCurrentStep(STEPS.selectMethod)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        ← Tilbage
      </button>

      <h2 className="text-xl font-semibold text-gray-900 mb-1">
        Opret din webformular
      </h2>
      <p className="text-gray-500 mb-6">
        Kopier denne kode og embed den på din hjemmeside.
      </p>

      <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono text-gray-700 overflow-x-auto">
        {`<script src="https://leksikon.ai/embed.js" data-key="YOUR_KEY"></script>`}
      </div>

      <div>
        <label htmlFor="webformEmbed" className="block text-sm font-medium text-gray-700 mb-1.5">
          Test din formular (valgfrit)
        </label>
        <Input
          id="webformEmbed"
          type="text"
          value={formData.webformEmbed}
          onChange={(e) => setFormData(prev => ({ ...prev, webformEmbed: e.target.value }))}
          placeholder="Indsæt din test-URL"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Spring dette over for nu
        </button>
        <Button
          onClick={handleSubmit}
          isLoading={isLoading}
        >
          Fortsæt
        </Button>
      </div>
    </div>
  )

  return (
    <Card>
      {currentStep === STEPS.selectMethod && renderMethodSelection()}
      {currentStep === STEPS.emailConnect && renderEmailConnect()}
      {currentStep === STEPS.webformSetup && renderWebformSetup()}
    </Card>
  )
}