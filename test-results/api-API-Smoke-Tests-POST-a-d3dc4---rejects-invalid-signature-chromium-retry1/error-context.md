# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api.spec.ts >> API Smoke Tests >> POST /api/webhooks/email - rejects invalid signature
- Location: tests/smoke/api.spec.ts:51:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 401
Received: 404
```

# Test source

```ts
  1  | import { test, expect, request } from '@playwright/test';
  2  | import { createHmac } from 'crypto';
  3  | 
  4  | const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || 'test-webhook-secret';
  5  | 
  6  | function generateHmacSignature(payload: string, secret: string): string {
  7  |   return createHmac('sha256', secret).update(payload).digest('hex');
  8  | }
  9  | 
  10 | test.describe('API Smoke Tests', () => {
  11 |   test('GET /api/health - health check returns 200', async ({ request }) => {
  12 |     const response = await request.get('/api/health');
  13 |     expect(response.status()).toBe(200);
  14 |     const data = await response.json();
  15 |     expect(data.status).toBe('healthy');
  16 |     expect(data).toHaveProperty('timestamp');
  17 |   });
  18 | 
  19 |   test('GET /api/v1/inquiries - requires userId param', async ({ request }) => {
  20 |     const response = await request.get('/api/v1/inquiries');
  21 |     // Should return 400 when userId is missing
  22 |     expect(response.status()).toBe(400);
  23 |   });
  24 | 
  25 |   test('GET /api/v1/inquiries - returns 200 with valid userId', async ({ request }) => {
  26 |     const response = await request.get('/api/v1/inquiries?userId=00000000-0000-0000-0000-000000000001');
  27 |     // Returns 200 even with no data (Supabase returns empty array)
  28 |     expect([200, 500]).toContain(response.status());
  29 |   });
  30 | 
  31 |   test('POST /api/webhooks/form - accepts basic form payload', async ({ request }) => {
  32 |     const payload = {
  33 |       name: 'Test User',
  34 |       email: 'test@example.com',
  35 |       message: 'This is a test inquiry',
  36 |     };
  37 | 
  38 |     const response = await request.post('/api/webhooks/form', {
  39 |       data: payload,
  40 |       headers: {
  41 |         'Content-Type': 'application/json',
  42 |       },
  43 |     });
  44 | 
  45 |     // Form webhook returns 200 on success
  46 |     expect(response.status()).toBe(200);
  47 |     const data = await response.json();
  48 |     expect(data.status).toBe('received');
  49 |   });
  50 | 
  51 |   test('POST /api/webhooks/email - rejects invalid signature', async ({ request }) => {
  52 |     const payload = JSON.stringify({
  53 |       from: 'sender@example.com',
  54 |       to: 'receiver@example.com',
  55 |       subject: 'Test Email',
  56 |       body: 'Test email body content',
  57 |     });
  58 | 
  59 |     const response = await request.post('/api/webhooks/email', {
  60 |       data: payload,
  61 |       headers: {
  62 |         'Content-Type': 'application/json',
  63 |         'x-webhook-signature': 'invalid-signature',
  64 |       },
  65 |     });
  66 | 
  67 |     // Should reject invalid signature with 401
> 68 |     expect(response.status()).toBe(401);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  69 |   });
  70 | 
  71 |   test('POST /api/webhooks/email - accepts valid HMAC signature', async ({ request }) => {
  72 |     const payload = JSON.stringify({
  73 |       from: 'sender@example.com',
  74 |       to: 'receiver@example.com',
  75 |       subject: 'Test Email',
  76 |       body: 'Test email body content',
  77 |     });
  78 | 
  79 |     const signature = generateHmacSignature(payload, WEBHOOK_SECRET);
  80 | 
  81 |     const response = await request.post('/api/webhooks/email', {
  82 |       data: payload,
  83 |       headers: {
  84 |         'Content-Type': 'application/json',
  85 |         'x-webhook-signature': signature,
  86 |       },
  87 |     });
  88 | 
  89 |     // Should accept valid signature
  90 |     expect([200, 400, 500]).toContain(response.status());
  91 |   });
  92 | 
  93 |   test('GET /api/v1/responses - requires inquiryId param', async ({ request }) => {
  94 |     const response = await request.get('/api/v1/responses');
  95 |     // Should return 400 when inquiryId is missing
  96 |     expect(response.status()).toBe(400);
  97 |   });
  98 | });
  99 | 
```