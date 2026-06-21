'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUserEmail()
  }, [])

  async function fetchUserEmail() {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user?.email) {
      setEmail(session.user.email)
      setNewEmail(session.user.email)
    }
    setIsLoading(false)
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setIsUpdating(true)
    setError('')
    setSuccess('')

    if (newEmail === email) {
      setError('Den nye email er den samme som den nuværende')
      setIsUpdating(false)
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setSuccess('Vi har sendt et bekræftelseslink til den nye email. Klik på linket for at bekræfte ændringen.')
      setEmail(newEmail)
    }
    setIsUpdating(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profilindstillinger</h1>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Email</h2>
          <p className="text-sm text-gray-500 mb-4">
            Din emailadresse bruges til at logge ind og modtage vigtige beskeder fra os.
          </p>

          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          {success && (
            <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>
          )}

          <form onSubmit={handleUpdateEmail}>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="din@email.dk"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" isLoading={isUpdating}>
                Opdater email
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Adgangskode</h2>
          <p className="text-sm text-gray-500 mb-4">
            Vil du ændre din adgangskode?{' '}
            <a href="/forgot-password" className="text-primary hover:underline">
              Nulstil din adgangskode
            </a>
          </p>
        </Card>
      </div>
    </div>
  )
}