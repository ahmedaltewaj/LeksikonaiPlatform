export type User = {
  id: string
  email: string
  created_at: string
  metadata: Record<string, unknown>
}

export type Inquiry = {
  id: string
  user_id: string
  source: 'email' | 'web_form' | 'webhook'
  sender_email: string
  sender_name: string | null
  subject: string | null
  body_text: string
  raw_content: Record<string, unknown> | null
  webhook_message_id: string | null
  status: 'pending' | 'reviewed' | 'sent' | 'archived'
  created_at: string
  received_at: string
}

export type Response = {
  id: string
  inquiry_id: string
  user_id: string
  ai_generated_text: string
  status: 'draft' | 'approved' | 'edited' | 'sent'
  approved_text: string | null
  created_at: string
  sent_at: string | null
}

export type AnalyticsEvent = {
  id: string
  user_id: string
  event_type: 'inquiry_received' | 'response_generated' | 'response_approved' | 'response_edited' | 'response_sent'
  inquiry_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type InquiryStatus = 'pending' | 'reviewed' | 'sent' | 'archived'
export type ResponseStatus = 'draft' | 'approved' | 'edited' | 'sent'
export type InquirySource = 'email' | 'web_form' | 'webhook'
export type EventType = 'inquiry_received' | 'response_generated' | 'response_approved' | 'response_edited' | 'response_sent'
