'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const EMAIL_TYPES = [
  { key: 'email_welcome_enabled', label: 'Velkommen email', description: 'Sendes når du fuldfører onboarding' },
  { key: 'email_setup_complete_enabled', label: 'Setup Complete', description: 'Sendes når første opsætning er klar' },
  { key: 'email_day1_tips_enabled', label: 'Dag 1 Tips', description: 'Tips til at komme i gang' },
  { key: 'email_day2_followup_enabled', label: 'Dag 2 Opfølgning', description: 'Opfølgning efter 2 dage' },
  { key: 'email_day3_checkin_enabled', label: 'Dag 3 Check-in', description: 'Check-in efter 3 dage' },
  { key: 'email_day7_stats_enabled', label: 'Dag 7 Statistik', description: 'Ugentlig statistik email' },
  { key: 'email_day14_activation_enabled', label: 'Dag 14 Activation', description: 'Aktivering efter 2 uger' },
  { key: 'email_day30_nps_enabled', label: 'Dag 30 NPS', description: 'NPS undersøgelse efter en måned' },
]

interface EmailConfig {
  id: string
  email_address: string
  email_provider: string
  is_verified: boolean
  spf_verified: boolean
  dkim_verified: boolean
  status: string
  webhook_url: string | null
}

export default function EmailSettingsPage() {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isCheckingDns, setIsCheckingDns] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [dnsCheckResult, setDnsCheckResult] = useState<{spf: boolean, dkim: boolean} | null>(null)

  useEffect(() => {
    fetchPreferences()
    fetchEmailConfig()

    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      fetchEmailConfig()
    }
  }, [])

  async function fetchPreferences() {
    try {
      const res = await fetch('/api/onboarding/email/preferences')
      if (!res.ok) return

      const json = await res.json()
      if (json.success && json.data) {
        setPreferences(json.data)
      } else {
        const prefs: Record<string, boolean> = {}
        EMAIL_TYPES.forEach(({ key }) => {
          prefs[key] = true
        })
        setPreferences(prefs)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchEmailConfig() {
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
          setEmailConfig(json.data)
        }
      }
    } catch (error) {
      console.error('Error fetching email config:', error)
    }
  }

  function handleToggle(key: string) {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaveSuccess(false)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/onboarding/email/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      })

      if (!res.ok) throw new Error('Failed to save')

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCheckDns() {
    if (!emailConfig?.email_address) return

    setIsCheckingDns(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      const res = await fetch('/api/onboarding/check-dns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email_address: emailConfig.email_address
        })
      })

      if (res.ok) {
        const json = await res.json()
        setDnsCheckResult({
          spf: json.spf_verified,
          dkim: json.dkim_verified
        })
        await fetchEmailConfig()
      }
    } catch (error) {
      console.error('Error checking DNS:', error)
    } finally {
      setIsCheckingDns(false)
    }
  }

  async function handleSendTest() {
    if (!emailConfig?.email_address) return

    setIsSendingTest(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) return

      const res = await fetch('/api/onboarding/send-test', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (res.ok) {
        alert('Test email sendt! Tjek din indbakke.')
      } else {
        const json = await res.json()
        alert(json.error || 'Fejl ved sending af test email')
      }
    } catch (error) {
      console.error('Error sending test:', error)
    } finally {
      setIsSendingTest(false)
    }
  }

  function getStatusDisplay(status: string, isVerified: boolean) {
    if (status === 'verified') {
      return { label: 'Verificeret', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    }
    if (status === 'pending' || !isVerified) {
      return { label: 'Afventer verificering', color: 'text-amber-600', bg: 'bg-amber-50' }
    }
    return { label: 'Ikke konfigureret', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Indstillinger</h1>
        <p className="text-gray-500">
          Konfigurer hvilke onboarding emails du vil modtage
        </p>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-gray-500">
          Indlæser...
        </Card>
      ) : (
        <>
          {emailConfig && (
            <Card className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Email Forbindelse Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-500">{emailConfig.email_address}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusDisplay(emailConfig.status, emailConfig.is_verified).bg} ${getStatusDisplay(emailConfig.status, emailConfig.is_verified).color}`}>
                    {getStatusDisplay(emailConfig.status, emailConfig.is_verified).label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">SPF</p>
                    <span className={`text-lg ${emailConfig.spf_verified ? '✅' : '❌'}`} />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">DKIM</p>
                    <span className={`text-lg ${emailConfig.dkim_verified ? '✅' : '❌'}`} />
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Verificeret</p>
                    <span className={`text-lg ${emailConfig.is_verified ? '✅' : '❌'}`} />
                  </div>
                </div>

                {emailConfig.webhook_url && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-1">Webhook URL</p>
                    <code className="text-xs break-all">{emailConfig.webhook_url}</code>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCheckDns}
                    isLoading={isCheckingDns}
                  >
                    Tjek DNS
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSendTest}
                    isLoading={isSendingTest}
                    disabled={!emailConfig.is_verified}
                  >
                    Send test email
                  </Button>
                </div>

                {dnsCheckResult && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <p>DNS check resultat: SPF {dnsCheckResult.spf ? '✅' : '❌'}, DKIM {dnsCheckResult.dkim ? '✅' : '❌'}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card className="mb-6">
            <div className="divide-y divide-gray-100">
              {EMAIL_TYPES.map(({ key, label, description }) => (
                <div key={key} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences[key] ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences[key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              {saveSuccess && (
                <p className="text-sm text-emerald-600">Gemt!</p>
              )}
            </div>
            <Button onClick={handleSave} isLoading={isSaving}>
              Gem ændringer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}