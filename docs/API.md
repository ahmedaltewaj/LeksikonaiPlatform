# Leksikon.ai API Documentation

Complete API reference for the Leksikon.ai MVP platform.

## Base URL

```
https://leksikon.ai/api
```

## Authentication

Leksikon.ai uses **Bearer token authentication** via Supabase JWT.

### Authenticated Endpoints

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Webhook Endpoints

Webhook endpoints (`/api/webhooks/*`) use **HMAC signature verification** instead of Bearer auth.

Include the signature from the `x-webhook-signature` header when calling webhook endpoints.

---

## Table of Contents

1. [Health Check](#health-check)
2. [Inquiries](#inquiries)
3. [Responses](#responses)
4. [Review Workflow](#review-workflow)
5. [Webhooks](#webhooks)
6. [Stripe Billing](#stripe-billing)
7. [Analytics](#analytics)
8. [Error Codes](#error-codes)

---

## Health Check

### GET /api/health

Health check endpoint for uptime monitoring.

**Authentication:** None required

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2026-06-10T13:00:00.000Z",
  "service": "leksikon-ai",
  "version": "1.0.0",
  "dependencies": {
    "supabase": "ok",
    "gemini": "ok"
  },
  "responseTimeMs": 45
}
```

**Status Values:**
- `healthy` - All systems operational (HTTP 200)
- `degraded` - Some dependencies slow (HTTP 200)
- `unhealthy` - Critical failure (HTTP 503)

---

## Inquiries

### GET /api/v1/inquiries

List all inquiries for a user.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | The user's UUID |
| status | string | No | Filter by status: `pending`, `reviewed`, `sent`, `archived` |

**Example Request:**

```bash
curl -X GET "https://leksikon.ai/api/v1/inquiries?userId=550e8400-e29b-41d4-a716-446655440000&status=pending" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender_email": "customer@example.com",
      "sender_name": "John Jensen",
      "subject": "Product Inquiry",
      "body_text": "Hi, I would like to know more about your services...",
      "status": "pending",
      "source": "email",
      "received_at": "2026-06-10T10:00:00.000Z",
      "created_at": "2026-06-10T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/v1/inquiries

Create a new inquiry (typically via web form integration).

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "source": "web_form",
  "senderEmail": "customer@example.com",
  "senderName": "John Jensen",
  "subject": "Product Inquiry",
  "bodyText": "Hi, I would like to know more about your services...",
  "rawContent": {},
  "webhookMessageId": "optional-message-id"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | UUID | Yes | Your user UUID |
| source | enum | No | `email`, `web_form`, `webhook` (default: `web_form`) |
| senderEmail | email | No | Customer's email address |
| senderName | string | No | Customer's name |
| subject | string | No | Email subject line |
| bodyText | string | **Yes** | The inquiry message content |
| rawContent | object | No | Additional metadata |
| webhookMessageId | string | No | For deduplication |

**Example Request:**

```bash
curl -X POST "https://leksikon.ai/api/v1/inquiries" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "bodyText": "Hi, I would like to know more about your services...",
    "senderEmail": "customer@example.com"
  }'
```

**Example Response (201 Created):**

```json
{
  "data": {
    "inquiry": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender_email": "customer@example.com",
      "body_text": "Hi, I would like to know more about your services...",
      "status": "pending",
      "source": "web_form",
      "received_at": "2026-06-10T10:00:00.000Z"
    },
    "response": {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "inquiry_id": "123e4567-e89b-12d3-a456-426614174000",
      "ai_generated_text": "Hej John, tak for din henvendelse...",
      "status": "draft"
    }
  }
}
```

---

### PATCH /api/v1/inquiries

Update inquiry status (approve, edit, or send response).

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
  "action": "approve",
  "approvedText": "Optional edited response text"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| inquiryId | UUID | Yes | The inquiry UUID |
| action | enum | Yes | `approve`, `edit`, `send` |
| approvedText | string | No | Custom response text (for `edit` action) |

**Example Request:**

```bash
curl -X PATCH "https://leksikon.ai/api/v1/inquiries" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
    "action": "approve"
  }'
```

**Example Response:**

```json
{
  "success": true
}
```

---

### POST /api/v1/inquiries/{id}/generate

Manually generate an AI response for an inquiry.

**Authentication:** Required (Bearer token)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | The inquiry UUID |

**Request Body:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "tone": "professional"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | UUID | Yes | Your user UUID |
| tone | enum | No | `professional` (default) or `friendly` |

**Example Request:**

```bash
curl -X POST "https://leksikon.ai/api/v1/inquiries/123e4567-e89b-12d3-a456-426614174000/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "tone": "friendly"
  }'
```

**Example Response (201 Created):**

```json
{
  "data": {
    "inquiry": { ... },
    "response": {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "ai_generated_text": "Hej John, tak for din henvendelse...",
      "status": "draft"
    }
  }
}
```

---

## Responses

### GET /api/v1/responses

Get response for a specific inquiry.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| inquiryId | UUID | Yes | The inquiry UUID |

**Example Request:**

```bash
curl -X GET "https://leksikon.ai/api/v1/responses?inquiryId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**

```json
{
  "data": {
    "id": "789e0123-e89b-12d3-a456-426614174000",
    "inquiry_id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "ai_generated_text": "Hej John, tak for din henvendelse...",
    "approved_text": null,
    "status": "draft",
    "created_at": "2026-06-10T10:00:00.000Z",
    "sent_at": null
  }
}
```

---

## Review Workflow

### POST /api/v1/review/approve

Approve or edit an AI-generated response.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "approvedText": "Optional custom response text"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| inquiryId | UUID | Yes | The inquiry UUID |
| userId | UUID | Yes | Your user UUID |
| approvedText | string | No | Custom response text (required for `edit` action, uses AI text if omitted) |

**Example Request:**

```bash
curl -X POST "https://leksikon.ai/api/v1/review/approve" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "status": "approved"
}
```

---

### POST /api/v1/review/send

Send the approved response to the customer.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Request:**

```bash
curl -X POST "https://leksikon.ai/api/v1/review/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Example Response:**

```json
{
  "success": true
}
```

---

### GET /api/v1/review/pending

Get all pending inquiries awaiting review.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | Your user UUID |

**Example Request:**

```bash
curl -X GET "https://leksikon.ai/api/v1/review/pending?userId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer <token>"
```

---

### GET /api/v1/review/history

Get review history (sent responses).

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | Your user UUID |

---

## Webhooks

### POST /api/webhooks/email

Email webhook endpoint for receiving customer emails.

**Authentication:** HMAC signature verification via `x-webhook-signature` header

**Headers:**

| Header | Description |
|--------|-------------|
| x-webhook-signature | HMAC-SHA256 signature of the raw request body |

**Request Body:**

```json
{
  "from": { "name": "John Jensen", "email": "customer@example.com" },
  "subject": "Product Inquiry",
  "body": "Hi, I would like to know more about your services...",
  "text": "Hi, I would like to know more about your services...",
  "messageId": "<abc123@example.com>"
}
```

**Example Response:**

```json
{
  "status": "received",
  "inquiryId": "123e4567-e89b-12d3-a456-426614174000",
  "isNewUser": false,
  "hasAiResponse": true
}
```

**Duplicate Response (200):**

```json
{
  "status": "duplicate",
  "inquiryId": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### POST /api/webhooks/form

Web form webhook endpoint.

**Authentication:** HMAC signature verification via `x-webhook-signature` header

**Request Body:**

```json
{
  "email": "customer@example.com",
  "name": "John Jensen",
  "company": "Acme Corp",
  "message": "Hi, I would like to know more..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | email | Yes | Customer's email |
| name | string | No | Customer's name |
| company | string | No | Company name |
| message | string | No | Inquiry message |

---

## Stripe Billing

### POST /api/stripe/checkout

Create a Stripe checkout session for subscription.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "price_id": "price_abc123..."
}
```

**Example Response:**

```json
{
  "data": {
    "url": "https://checkout.stripe.com/...",
    "session_id": "cs_xxx..."
  }
}
```

---

### POST /api/stripe/portal

Create a Stripe customer portal session.

**Authentication:** Required (Bearer token)

**Example Response:**

```json
{
  "data": {
    "url": "https://billing.stripe.com/..."
  }
}
```

---

## Analytics

### GET /api/v1/analytics

Get analytics data for a user.

**Authentication:** Required (Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | Your user UUID |

---

### GET /api/analytics/overview

Get analytics overview dashboard data.

**Authentication:** Required (Bearer token)

---

## Error Codes

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid or missing parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

### Error Response Format

All errors return a consistent JSON structure:

```json
{
  "error": "Error message description"
}
```

For validation errors (400):

```json
{
  "error": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["bodyText"],
      "message": "String must contain at least 1 character"
    }
  ]
}
```

### Common Error Messages

| Error | Status | Description |
|-------|--------|-------------|
| `Unauthorized` | 401 | Missing or invalid Bearer token |
| `userId required` | 400 | Missing required userId parameter |
| `inquiryId required` | 400 | Missing required inquiryId parameter |
| `Invalid payload` | 400 | Request body failed validation |
| `Invalid signature` | 401 | Webhook HMAC signature verification failed |
| `Inquiry not found` | 404 | The specified inquiry doesn't exist |
| `Response not found` | 404 | No response exists for this inquiry |
| `Response already exists` | 409 | A response has already been generated |
| `Failed to generate response` | 500 | AI response generation failed |
| `Failed to send email` | 500 | Email sending failed |

---

## Rate Limits

No rate limits are currently enforced on the MVP.

---

## Versioning

API versioning is path-based. The current version is `v1`.

```
/api/v1/...
```

---

## Support

For API issues or questions, contact support@leksikon.ai
