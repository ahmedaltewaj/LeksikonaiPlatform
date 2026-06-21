import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateDanishResponse, ResponseTone } from '@/lib/gemini/client'

export interface InquiryInput {
  /** UUID of the SME owner (optional - will be looked up by senderEmail if not provided) */
  userId?: string
  source: 'email' | 'web_form' | 'webhook'
  senderEmail: string
  senderName?: string | null
  subject?: string | null
  bodyText: string
  rawContent?: Record<string, unknown>
  webhookMessageId?: string | null
}

export interface CreateInquiryResult {
  inquiryId: string
  userId: string | null
  isNewUser: boolean
  aiResponseText: string | null
  responseId: string | null
  duplicate: boolean
  duplicateInquiryId?: string
}

/**
 * Result of createInquiryWithResponse - returns inquiry and response objects
 */
export interface InquiryResponseTuple {
  inquiry: {
    id: string
    user_id: string | null
    source: string
    sender_email: string
    sender_name: string | null
    subject: string | null
    body_text: string
    status: string
    created_at: string
  }
  response: {
    id: string
    ai_generated_text: string
    status: string
  } | null
}

/**
 * Error thrown when inquiry ingestion fails
 */
export class InquiryIngestionError extends Error {
  constructor(
    message: string,
    public readonly code: 'USER_NOT_FOUND' | 'INSERT_FAILED' | 'VALIDATION_ERROR' | 'AI_GENERATION_FAILED' | 'DUPLICATE_MESSAGE',
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = 'InquiryIngestionError'
  }
}

/**
 * Unified inquiry ingestion service.
 * Handles all channels (email, form, API) consistently.
 * 
 * - Uses provided userId or looks up by senderEmail
 * - Checks for duplicate message-ID
 * - Generates AI response
 * - Creates response record
 * - Logs analytics
 * 
 * @param input - Normalized inquiry data from any source (userId is optional - looked up by email if not provided)
 * @param tone - Tone for AI-generated response (default: 'professional')
 * @returns Created inquiry result with AI response
 */
export async function createInquiryWithResponse(
  input: InquiryInput,
  tone: ResponseTone = 'professional'
): Promise<CreateInquiryResult> {
  const supabase = await createSupabaseServerClient()

  // Check for duplicate message-ID
  if (input.webhookMessageId) {
    const { data: existing } = await supabase
      .from('inquiries')
      .select('id, user_id')
      .eq('webhook_message_id', input.webhookMessageId)
      .single()

    if (existing) {
      return {
        inquiryId: existing.id,
        userId: existing.user_id,
        isNewUser: false,
        aiResponseText: null,
        responseId: null,
        duplicate: true,
        duplicateInquiryId: existing.id,
      }
    }
  }

  // Resolve userId - use provided or look up by sender email
  let userId: string | null = input.userId ?? null
  let isNewUser = false

  if (!userId && input.senderEmail && input.senderEmail !== 'unknown@example.com') {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.senderEmail)
      .single()

    if (existingUser) {
      userId = existingUser.id
    } else {
      isNewUser = true
    }
  }

  // Create inquiry record
  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert({
      user_id: userId,
      source: input.source,
      sender_email: input.senderEmail,
      sender_name: input.senderName ?? null,
      subject: input.subject ?? null,
      body_text: input.bodyText.slice(0, 10000),
      raw_content: input.rawContent ?? null,
      webhook_message_id: input.webhookMessageId ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (inquiryError || !inquiry) {
    throw new InquiryIngestionError(
      `Failed to create inquiry: ${inquiryError?.message}`,
      'INSERT_FAILED',
      500
    )
  }

  // Generate AI response
  let responseRecord: { id: string; ai_generated_text: string; status: string } | null = null

  try {
    const aiResponseText = await generateDanishResponse(
      { senderName: input.senderName || 'Customer', body: input.bodyText },
      userId || 'anonymous',
      tone
    )

    // Create response record
    const { data: response } = await supabase
      .from('responses')
      .insert({
        inquiry_id: inquiry.id,
        user_id: userId,
        ai_generated_text: aiResponseText,
        status: 'draft',
      })
      .select()
      .single()

    if (response) {
      responseRecord = {
        id: response.id,
        ai_generated_text: response.ai_generated_text,
        status: response.status,
      }
    }
  } catch (aiError) {
    console.error('AI response generation failed:', aiError)
    // Continue without AI response - inquiry is still created
  }

  // Log analytics
  await supabase.from('analytics_events').insert([
    {
      user_id: userId,
      event_type: 'inquiry_received',
      inquiry_id: inquiry.id,
      metadata: { source: input.source, sender_email: input.senderEmail },
    },
    {
      user_id: userId,
      event_type: 'response_generated',
      inquiry_id: inquiry.id,
      metadata: responseRecord ? { response_id: responseRecord.id } : undefined,
    },
  ])

  return {
    inquiryId: inquiry.id,
    userId: inquiry.user_id,
    isNewUser,
    aiResponseText: responseRecord?.ai_generated_text ?? null,
    responseId: responseRecord?.id ?? null,
    duplicate: false,
  }
}

/**
 * Input for the flexible ingestInquiry function
 */
export interface IngestInquiryInput {
  /** Source of the inquiry (email, web_form, webhook) */
  source: 'email' | 'web_form' | 'webhook'
  /** User ID - can be provided directly or derived from senderEmail */
  userId?: string
  /** Sender's email address - used for user lookup if userId not provided */
  senderEmail: string
  /** Sender's display name */
  senderName?: string | null
  /** Email subject line (for email sources) */
  subject?: string | null
  /** The main body/text of the inquiry */
  bodyText: string
  /** Original raw payload (useful for debugging and reprocessing) */
  rawContent?: Record<string, unknown> | null
  /** External message ID (e.g., from email provider) */
  webhookMessageId?: string | null
}

/**
 * Options for ingestInquiry
 */
export interface IngestInquiryOptions {
  /**
   * Whether to automatically generate an AI response after creating the inquiry.
   * Default: false
   */
  autoGenerateResponse?: boolean
  /**
   * Tone for AI-generated response.
   * Default: 'professional'
   */
  tone?: 'professional' | 'friendly'
  /**
   * Skip user lookup - assume userId is valid or sender is anonymous.
   * Default: false
   */
  skipUserLookup?: boolean
}

/**
 * Result of successful inquiry ingestion
 */
export interface IngestInquiryResult {
  /** The created inquiry record */
  inquiry: {
    id: string
    user_id: string | null
    source: string
    sender_email: string
    sender_name: string | null
    subject: string | null
    body_text: string
    status: string
    created_at: string
  }
  /** The AI-generated response (if autoGenerateResponse was true) */
  response?: {
    id: string
    ai_generated_text: string
    status: string
  }
  /** The user ID this inquiry was associated with */
  userId: string | null
  /** Whether this was a duplicate message */
  duplicate: boolean
}

/**
 * Alternative flexible inquiry ingestion function.
 * Use this when you need more control over the ingestion process.
 * 
 * @param input - Normalized inquiry data from any source
 * @param options - Configuration options
 * @returns The created inquiry and optionally the AI-generated response
 */
export async function ingestInquiry(
  input: IngestInquiryInput,
  options: IngestInquiryOptions = {}
): Promise<IngestInquiryResult> {
  const {
    autoGenerateResponse = false,
    tone = 'professional',
    skipUserLookup = false,
  } = options

  // Validation
  if (!input.bodyText || input.bodyText.trim().length === 0) {
    throw new InquiryIngestionError('Missing body content', 'VALIDATION_ERROR', 400)
  }

  if (!input.senderEmail) {
    throw new InquiryIngestionError('Missing sender email', 'VALIDATION_ERROR', 400)
  }

  const supabase = await createSupabaseServerClient()

  // Check for duplicate message-ID
  if (input.webhookMessageId) {
    const { data: existing } = await supabase
      .from('inquiries')
      .select('id, user_id')
      .eq('webhook_message_id', input.webhookMessageId)
      .single()

    if (existing) {
      return {
        inquiry: {
          id: existing.id,
          user_id: existing.user_id,
          source: input.source,
          sender_email: input.senderEmail,
          sender_name: input.senderName ?? null,
          subject: input.subject ?? null,
          body_text: '',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        userId: existing.user_id,
        duplicate: true,
      }
    }
  }

  // Resolve user ID
  let userId: string | null = null

  if (input.userId) {
    // User ID provided directly (e.g., from authenticated API call)
    userId = input.userId
  } else if (!skipUserLookup && input.senderEmail && input.senderEmail !== 'unknown@example.com') {
    // Look up user by sender email (for webhook sources)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', input.senderEmail)
      .single()

    userId = existingUser?.id ?? null
  }

  // Create inquiry record
  const { data: inquiry, error: inquiryError } = await supabase
    .from('inquiries')
    .insert({
      user_id: userId,
      source: input.source,
      sender_email: input.senderEmail,
      sender_name: input.senderName ?? null,
      subject: input.subject ?? null,
      body_text: input.bodyText.slice(0, 10000),
      raw_content: input.rawContent ?? null,
      webhook_message_id: input.webhookMessageId ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (inquiryError || !inquiry) {
    throw new InquiryIngestionError(
      `Failed to insert inquiry: ${inquiryError?.message ?? 'Unknown error'}`,
      'INSERT_FAILED',
      500
    )
  }

  // Log analytics event
  if (userId) {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_type: 'inquiry_received',
      inquiry_id: inquiry.id,
      metadata: { source: input.source, sender_email: input.senderEmail },
    })
  }

  // Build result
  const result: IngestInquiryResult = {
    inquiry: {
      id: inquiry.id,
      user_id: inquiry.user_id,
      source: inquiry.source,
      sender_email: inquiry.sender_email,
      sender_name: inquiry.sender_name,
      subject: inquiry.subject,
      body_text: inquiry.body_text,
      status: inquiry.status,
      created_at: inquiry.created_at,
    },
    userId,
    duplicate: false,
  }

  // Auto-generate response if requested
  if (autoGenerateResponse && userId) {
    let aiResponseText: string
    try {
      aiResponseText = await generateDanishResponse(
        { senderName: input.senderName || 'Customer', body: input.bodyText },
        userId,
        tone
      )
    } catch (error) {
      console.error('AI generation failed during inquiry ingestion:', error)
      aiResponseText = 'Tak for din henvendelse. Vi har modtaget din besked og vil svare dig hurtigst muligt.'
    }

    const { data: response } = await supabase
      .from('responses')
      .insert({
        inquiry_id: inquiry.id,
        user_id: userId,
        ai_generated_text: aiResponseText,
        status: 'draft',
      })
      .select()
      .single()

    if (response) {
      result.response = {
        id: response.id,
        ai_generated_text: response.ai_generated_text,
        status: response.status,
      }

      // Log response generation event
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'response_generated',
        inquiry_id: inquiry.id,
        metadata: { response_id: response.id, tone },
      })
    }
  }

  return result
}

/**
 * Extract and normalize email payload for inquiry ingestion
 * 
 * @param payload - Raw email webhook payload
 * @returns Normalized inquiry input ready for ingestInquiry
 */
export function normalizeEmailPayload(payload: {
  from?: { name?: string; email?: string } | string
  sender?: { name?: string; email?: string } | string
  subject?: string
  body?: string
  text?: string
  html?: string
  messageId?: string
}): {
  senderEmail: string
  senderName: string | null
  subject: string | null
  bodyText: string
  webhookMessageId: string | null
} {
  // Extract body text
  const bodyText = payload.body || payload.text || payload.html?.replace(/<[^>]+>/g, '') || ''

  // Extract sender email
  let senderEmail: string
  const from = payload.from
  if (!from) {
    senderEmail = payload.sender && typeof payload.sender === 'string' 
      ? payload.sender 
      : 'unknown@example.com'
  } else if (typeof from === 'string') {
    senderEmail = from
  } else {
    senderEmail = from.email || (typeof payload.sender === 'string' ? payload.sender : 'unknown@example.com')
  }

  // Extract sender name
  let senderName: string | null = null
  if (typeof from === 'object' && from?.name) {
    senderName = from.name
  } else if (typeof payload.sender === 'object' && payload.sender?.name) {
    senderName = payload.sender.name
  }

  return {
    senderEmail,
    senderName,
    subject: payload.subject || null,
    bodyText,
    webhookMessageId: payload.messageId || null,
  }
}

/**
 * Extract and normalize form payload for inquiry ingestion
 * 
 * @param payload - Raw form webhook payload
 * @returns Normalized inquiry input ready for ingestInquiry
 */
export function normalizeFormPayload(payload: {
  email?: string
  name?: string
  company?: string
  message?: string
  source?: string
}): {
  senderEmail: string
  senderName: string | null
  bodyText: string
} {
  return {
    senderEmail: payload.email || 'unknown@example.com',
    senderName: payload.name || null,
    bodyText: payload.message || payload.company || 'No message content',
  }
}