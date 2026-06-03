'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { RejectModal } from '@/components/review/RejectModal'
import { ReviewHistory } from '@/components/review/ReviewHistory'
import { createClient } from '@/lib/supabase/client'
import type { Inquiry, Response } from '@/types'

type TabType = 'pending' | 'history'

export default function ReviewPage() {
  return <ReviewPageClient />
}

function ReviewPageClient() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)
      setUserEmail(session.user.email ?? null)
    } catch (err) {
      console.error('Auth check failed:', err)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Response Review</h1>
            <nav className="flex gap-1">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'history'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                History
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
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
        {activeTab === 'pending' ? (
          <PendingReviewTab userId={userId} />
        ) : (
          <ReviewHistory userId={userId} />
        )}
      </main>
    </div>
  )
}

function PendingReviewTab({ userId }: { userId: string | null }) {
  const [pendingItems, setPendingItems] = useState<(Inquiry & { response: Response | null })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Inquiry & { response: Response | null } | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [itemToReject, setItemToReject] = useState<Inquiry & { response: Response | null } | null>(null)

  useEffect(() => {
    if (userId) fetchPendingItems()
  }, [userId])

  async function fetchPendingItems() {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) return

      const res = await fetch(`/api/v1/review/pending?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch pending items')

      const json = await res.json()
      setPendingItems(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApprove(item: Inquiry & { response: Response | null }) {
    if (!item.response || !userId) return

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: item.id,
          userId,
          approvedText: item.response.ai_generated_text,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve')

      await fetchPendingItems()
      setSelectedItem(null)
    } catch (err) {
      console.error('Approve failed:', err)
    }
  }

  async function handleSend(item: Inquiry & { response: Response | null }) {
    if (!item.response || !userId) return

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: item.id,
          userId,
        }),
      })

      if (!res.ok) throw new Error('Failed to send')

      await fetchPendingItems()
      setSelectedItem(null)
    } catch (err) {
      console.error('Send failed:', err)
    }
  }

  async function handleReject(item: Inquiry & { response: Response | null }, reason: string) {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: item.id,
          userId,
          reason,
        }),
      })

      if (!res.ok) throw new Error('Failed to reject')

      setRejectModalOpen(false)
      setItemToReject(null)
      await fetchPendingItems()
      setSelectedItem(null)
    } catch (err) {
      console.error('Reject failed:', err)
    }
  }

  function openRejectModal(item: Inquiry & { response: Response | null }) {
    setItemToReject(item)
    setRejectModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <Card><div className="h-24 bg-gray-100 rounded" /></Card>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button variant="secondary" onClick={fetchPendingItems}>Retry</Button>
      </div>
    )
  }

  if (pendingItems.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12 l4 4 L15 8M21 12 a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-1">All caught up!</p>
          <p className="text-sm">No responses waiting for review.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pending items list */}
      <div className="space-y-4">
        {pendingItems.map(item => (
          <Card
            key={item.id}
            variant={selectedItem?.id === item.id ? 'elevated' : 'interactive'}
            className={selectedItem?.id === item.id ? 'border-primary ring-2 ring-primary/20' : ''}
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {item.sender_name || item.sender_email}
                  </span>
                  <Badge variant="pending">Draft</Badge>
                </div>
                {item.subject && (
                  <p className="text-sm text-gray-500 truncate mb-1">{item.subject}</p>
                )}
                <p className="text-sm text-gray-400 truncate">{item.body_text}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDate(item.received_at)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Response detail */}
      <div>
        {selectedItem ? (
          <ResponseDetailPanel
            item={selectedItem}
            userId={userId}
            onApprove={() => handleApprove(selectedItem)}
            onSend={() => handleSend(selectedItem)}
            onReject={() => openRejectModal(selectedItem)}
          />
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-400">
              <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm">Select a response to review</p>
            </div>
          </Card>
        )}
      </div>

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false)
          setItemToReject(null)
        }}
        onReject={(reason) => itemToReject && handleReject(itemToReject, reason)}
      />
    </div>
  )
}

function ResponseDetailPanel({
  item,
  userId,
  onApprove,
  onSend,
  onReject,
}: {
  item: Inquiry & { response: Response | null }
  userId: string | null
  onApprove: () => void
  onSend: () => void
  onReject: () => void
}) {
  const [editedText, setEditedText] = useState(item.response?.ai_generated_text || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setEditedText(item.response?.ai_generated_text || '')
    setIsEditing(false)
  }, [item.id, item.response?.ai_generated_text])

  const handleSaveEdit = async () => {
    if (!item.response || !userId) return
    setIsProcessing(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/v1/review/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          inquiryId: item.id,
          userId,
          approvedText: editedText,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')
      setIsEditing(false)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      {/* Customer Inquiry */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Inquiry</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-700">
              {item.sender_name || item.sender_email}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{item.sender_email}</span>
          </div>
          {item.subject && (
            <p className="text-sm font-medium text-gray-900 mb-1">{item.subject}</p>
          )}
          <p className="text-sm text-gray-600">{item.body_text}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">AI Response</h3>
          {item.response && (
            <Badge variant={item.response.status === 'draft' ? 'pending' : 'approved'}>
              {item.response.status}
            </Badge>
          )}
        </div>

        <Textarea
          value={editedText}
          onChange={e => {
            setEditedText(e.target.value)
            setIsEditing(true)
          }}
          rows={6}
          placeholder="Edit the response or leave as-is..."
          className="mb-4"
        />
        {isEditing && (
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isProcessing}
              className="bg-success hover:bg-emerald-600"
            >
              Save Changes
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditedText(item.response?.ai_generated_text || '')
                setIsEditing(false)
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={async () => {
            setIsProcessing(true)
            await onApprove()
            await onSend()
            setIsProcessing(false)
          }}
          isLoading={isProcessing}
          disabled={!item.response || item.response.status === 'sent'}
          className="bg-success hover:bg-emerald-600"
        >
          Approve & Send
        </Button>
        <Button
          variant="secondary"
          onClick={onSend}
          isLoading={isProcessing}
          disabled={!item.response || (item.response.status !== 'approved' && item.response.status !== 'edited')}
        >
          Send Response
        </Button>
        <Button
          variant="ghost"
          onClick={onReject}
          disabled={!item.response || item.response.status === 'sent'}
          className="text-error hover:text-error"
        >
          Reject
        </Button>
      </div>
    </Card>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return date.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
  }
}
