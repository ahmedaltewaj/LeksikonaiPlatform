'use client'

import { createBrowserClient } from '@/lib/supabase/browser-client'
import type { FeedbackCategory } from './useFeedback'

export interface FeedbackSubmission {
  rating: number
  category: FeedbackCategory
  comment: string
  npsScore: number
  page_url: string
}

export async function submitFeedback(data: FeedbackSubmission): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createBrowserClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Not authenticated - don't submit but don't error
      console.log('User not authenticated, skipping feedback submission')
      return { success: true }
    }

    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: data.rating,
        category: data.category.toLowerCase(),
        comment_text: data.comment || undefined,
        nps_score: data.npsScore,
        page_url: data.page_url,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.error || 'Failed to submit feedback' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: 'Network error' }
  }
}