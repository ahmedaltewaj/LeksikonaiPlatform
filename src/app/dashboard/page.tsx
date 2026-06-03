'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { NpsStats } from '@/components/ui/NpsStats'
import { InquiryList } from '@/components/inquiry/InquiryList'
import { ResponseReview } from '@/components/response/ResponseReview'
import { AnalyticsDashboard } from '@/components/ui/AnalyticsDashboard'
import { FeedbackWidget } from '@/components/ui/FeedbackWidget'
import type { Inquiry } from '@/types'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface EmailConfig {
  status: string
  is_verified: boolean
}

export default function DashboardPage() {
  return <DashboardClient />
}

function DashboardClient() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'reviewed' | 'all'>('pending')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null)

  useEffect(() => {
    fetchUserAndInquiries()
    fetchEmailConfigStatus()
  }, [])

  async function fetchEmailConfigStatus() {
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

  async function fetchUserAndInquiries() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setError('Please log in to view your dashboard')
        setIsLoading(false)
        return
      }

      setUserId(session.user.id)
      setUserEmail(session.user.email ?? null)

      const res = await fetch(
        `/api/v1/inquiries?userId=${session.user.id}&status=${statusFilter === 'all' ? '' : statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!res.ok) throw new Error('Failed to fetch inquiries')

      const json = await res.json()
      setInquiries(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleStatusChange(newStatus: 'pending' | 'reviewed' | 'all') {
    setStatusFilter(newStatus)
    setSelectedInquiry(null)
    setIsLoading(true)

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) return

      const params = new URLSearchParams({ userId: session.user.id })
      if (newStatus !== 'all') {
        params.append('status', newStatus)
      }

      const res = await fetch(`/api/v1/inquiries?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch inquiries')

      const json = await res.json()
      setInquiries(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  function handleSelectInquiry(inquiry: Inquiry) {
    setSelectedInquiry(inquiry)
  }

  function handleResponseSent() {
    fetchUserAndInquiries()
    setSelectedInquiry(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Leksikon.ai Dashboard</h1>
          <div className="flex items-center gap-4">
            {emailConfig && emailConfig.status !== 'verified' && (
              <a 
                href="/dashboard/settings/email" 
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100"
              >
                <span className="text-xs">⚠️</span>
                <span>Email ikke verificeret</span>
              </a>
            )}
            <a href="/dashboard/settings/email" className="text-sm text-gray-600 hover:text-gray-900">
              Email indstillinger
            </a>
            <a href="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              Profil
            </a>
            {userEmail && (
              <span className="text-sm text-gray-600">{userEmail}</span>
            )}
            <Button 
              variant="secondary" 
              size="sm"
              isLoading={isSigningOut}
              onClick={handleSignOut}
            >
              Log ud
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <NpsStats />
          <AnalyticsDashboard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Customer Inquiries</h2>
                <select
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                  value={statusFilter}
                  onChange={e => handleStatusChange(e.target.value as 'pending' | 'reviewed' | 'all')}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {userId ? (
                <InquiryList
                  inquiries={inquiries}
                  isLoading={isLoading}
                  error={error}
                  onSelectInquiry={handleSelectInquiry}
                  selectedInquiryId={selectedInquiry?.id}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please log in to view your inquiries.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Response Review</h2>
            </div>

            <div className="p-6">
              {selectedInquiry && userId ? (
                <ResponseReview
                  inquiry={selectedInquiry}
                  userId={userId}
                  onResponseSent={handleResponseSent}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="text-sm">Select an inquiry to review or generate a response</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FeedbackWidget />
    </div>
  )
}