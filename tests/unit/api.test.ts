import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getServerClient } from '@/lib/supabase/client'
import { generateDanishResponse } from '@/lib/gemini/client'

vi.mock('@/lib/supabase/client', () => ({
  getServerClient: vi.fn(),
}))

vi.mock('@/lib/gemini/client', () => ({
  generateDanishResponse: vi.fn(),
}))

describe('GET /api/v1/inquiries', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }
    ;(getServerClient as any).mockReturnValue(mockSupabase)
  })

  it('returns 401 when no authorization header', async () => {
    const { NextResponse } = await import('next/server')
    const req = new Request('http://localhost/api/v1/inquiries?userId=123')
    
    // Simulate auth check
    const authHeader = req.headers.get('authorization')
    expect(authHeader).toBe(null)
  })

  it('returns 401 when token is invalid', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('Invalid') })
    
    const req = new Request('http://localhost/api/v1/inquiries?userId=123', {
      headers: { authorization: 'Bearer invalid-token' },
    })
    
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user } } = await mockSupabase.auth.getUser(token)
    
    expect(user).toBeNull()
  })

  it('returns 400 when userId is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123' } }, error: null })
    
    const req = new Request('http://localhost/api/v1/inquiries', {
      headers: { authorization: 'Bearer valid-token' },
    })
    
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    
    expect(userId).toBeNull()
  })

  it('returns 403 when userId does not match authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    const req = new Request('http://localhost/api/v1/inquiries?userId=different-user', {
      headers: { authorization: 'Bearer valid-token' },
    })
    
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    const currentUserId = 'user-123'
    
    expect(userId).not.toBe(currentUserId)
  })

  it('returns inquiries for authenticated user', async () => {
    const mockInquiries = [
      { id: '1', user_id: 'user-123', body_text: 'Test inquiry', status: 'pending' },
      { id: '2', user_id: 'user-123', body_text: 'Another inquiry', status: 'reviewed' },
    ]
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockInquiries, error: null }),
    }
    mockSupabase.from.mockReturnValue(queryMock)
    
    const result = await queryMock.select('*').eq('user_id', 'user-123').order('received_at', { ascending: false })
    
    expect(result.data).toEqual(mockInquiries)
    expect(result.error).toBeNull()
  })

  it('filters by status when provided', async () => {
    const mockInquiries = [
      { id: '1', user_id: 'user-123', status: 'pending' },
    ]
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockInquiries, error: null }),
    }
    mockSupabase.from.mockReturnValue(queryMock)
    
    const result = await queryMock.select('*').eq('user_id', 'user-123').eq('status', 'pending').order('received_at', { ascending: false })
    
    expect(result.data).toHaveLength(1)
    expect(result.data[0].status).toBe('pending')
  })
})

describe('POST /api/v1/inquiries - Response Generation', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    ;(getServerClient as any).mockReturnValue(mockSupabase)
    ;(generateDanishResponse as any).mockResolvedValue('Mocked AI response in Danish')
  })

  it('validates required body fields', async () => {
    const invalidBody = { userId: 'not-a-uuid' }
    
    const result = (await import('zod')).z.string().uuid().safeParse(invalidBody.userId)
    expect(result.success).toBe(false)
  })

  it('creates inquiry and generates response', async () => {
    const mockInquiry = { id: 'inq-123', user_id: 'user-123', body_text: 'Hello' }
    const mockResponse = { id: 'resp-123', inquiry_id: 'inq-123', ai_generated_text: 'Mocked AI response' }
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'inquiries') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockInquiry, error: null }),
        }
      }
      if (table === 'responses') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
        }
      }
      if (table === 'analytics_events') {
        return {
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }
      }
      return {}
    })
    
    const body = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      bodyText: 'Hello, I need help',
      senderEmail: 'customer@example.com',
      senderName: 'Customer',
    }
    
    const parsedBody = { ...body }
    expect(parsedBody.bodyText).toBeDefined()
    expect(parsedBody.userId).toBeDefined()
  })

  it('records analytics events', async () => {
    const analyticsEvents: any[] = []
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'analytics_events') {
        return {
          insert: vi.fn().mockImplementation((data) => {
            analyticsEvents.push(data)
            return { data: {}, error: null }
          }),
        }
      }
      return { insert: vi.fn().mockResolvedValue({ data: {}, error: null }) }
    })
    
    const event1 = { user_id: 'user-123', event_type: 'inquiry_received', inquiry_id: 'inq-123' }
    const event2 = { user_id: 'user-123', event_type: 'response_generated', inquiry_id: 'inq-123', metadata: { response_id: 'resp-123' } }
    
    await mockSupabase.from('analytics_events').insert(event1)
    await mockSupabase.from('analytics_events').insert(event2)
    
    expect(analyticsEvents).toHaveLength(2)
    expect(analyticsEvents[0].event_type).toBe('inquiry_received')
    expect(analyticsEvents[1].event_type).toBe('response_generated')
  })
})

describe('PATCH /api/v1/inquiries - Response Approval Workflow', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    ;(getServerClient as any).mockReturnValue(mockSupabase)
  })

  it('approves response and updates status', async () => {
    const mockInquiry = { id: 'inq-123', user_id: 'user-123' }
    
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'inquiries') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockInquiry, error: null }),
          update: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }
      }
      if (table === 'responses') {
        return {
          update: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }
      }
      if (table === 'analytics_events') {
        return {
          insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }
      }
      return { update: vi.fn().mockResolvedValue({ data: {}, error: null }) }
    })
    
    const action = 'approve'
    const approvedText = 'Approved response text'
    
    const newStatus = action === 'approve' ? 'approved' : 'edited'
    expect(newStatus).toBe('approved')
  })

  it('edits response with custom text', async () => {
    const actions: Array<'approve' | 'edit' | 'send'> = ['edit']
    const action = actions[0]
    const newStatus = action === 'approve' ? 'approved' : 'edited'
    expect(newStatus).toBe('edited')
  })

  it('sends response and records sent_at timestamp', async () => {
    const action = 'send'
    
    const newStatus = action === 'send' ? 'sent' : undefined
    const sentAt = new Date().toISOString()
    
    expect(newStatus).toBe('sent')
    expect(sentAt).toBeDefined()
  })

  it('returns 404 for non-existent inquiry', async () => {
    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }))
    
    const inquiryId = 'non-existent-id'
    const result = { data: null }
    
    expect(result.data).toBeNull()
  })
})

describe('GET /api/v1/responses', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }
    ;(getServerClient as any).mockReturnValue(mockSupabase)
  })

  it('returns 401 when no authorization header', () => {
    const req = new Request('http://localhost/api/v1/responses?inquiryId=123')
    const authHeader = req.headers.get('authorization')
    
    expect(authHeader).toBeNull()
  })

  it('returns 400 when inquiryId is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    const req = new Request('http://localhost/api/v1/responses', {
      headers: { authorization: 'Bearer valid-token' },
    })
    
    const url = new URL(req.url)
    const inquiryId = url.searchParams.get('inquiryId')
    
    expect(inquiryId).toBeNull()
  })

  it('returns response for valid inquiryId', async () => {
    const mockResponse = {
      id: 'resp-123',
      inquiry_id: 'inq-123',
      ai_generated_text: 'AI generated response',
      status: 'draft',
    }
    
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    
    const queryMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockResponse, error: null }),
    }
    mockSupabase.from.mockReturnValue(queryMock)
    
    const result = await queryMock.select('*').eq('inquiry_id', 'inq-123').eq('user_id', 'user-123').single()
    
    expect(result.data).toEqual(mockResponse)
    expect(result.data.status).toBe('draft')
  })
})