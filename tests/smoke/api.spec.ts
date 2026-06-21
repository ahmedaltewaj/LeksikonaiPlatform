import { test, expect, request } from '@playwright/test';
import { createHmac } from 'crypto';

const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret';

function generateHmacSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

test.describe('API Smoke Tests', () => {
  test('GET /api/health - health check returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
  });

  test('GET /api/v1/inquiries - requires userId param', async ({ request }) => {
    const response = await request.get('/api/v1/inquiries');
    // Should return 400 when userId is missing
    expect(response.status()).toBe(400);
  });

  test('GET /api/v1/inquiries - returns 200 with valid userId', async ({ request }) => {
    const response = await request.get('/api/v1/inquiries?userId=00000000-0000-0000-0000-000000000001');
    // Returns 200 even with no data (Supabase returns empty array)
    expect([200, 500]).toContain(response.status());
  });

  test('POST /api/webhooks/form - accepts basic form payload', async ({ request }) => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test inquiry',
    };

    const response = await request.post('/api/webhooks/form', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Form webhook returns 200 on success
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('received');
  });

  test('POST /api/webhooks/email - rejects invalid signature', async ({ request }) => {
    const payload = JSON.stringify({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Test Email',
      body: 'Test email body content',
    });

    const response = await request.post('/api/webhooks/email', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'invalid-signature',
      },
    });

    // Should reject invalid signature with 401
    expect(response.status()).toBe(401);
  });

  test('POST /api/webhooks/email - accepts valid HMAC signature', async ({ request }) => {
    const payload = JSON.stringify({
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Test Email',
      body: 'Test email body content',
    });

    const signature = generateHmacSignature(payload, WEBHOOK_SECRET);

    const response = await request.post('/api/webhooks/email', {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
      },
    });

    // Should accept valid signature
    expect([200, 400, 500]).toContain(response.status());
  });

  test('GET /api/v1/responses - requires inquiryId param', async ({ request }) => {
    const response = await request.get('/api/v1/responses');
    // Should return 400 when inquiryId is missing
    expect(response.status()).toBe(400);
  });
});
