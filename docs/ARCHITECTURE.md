# System Architecture

## Overview

Leksikon.ai is an AI-powered customer communication assistant for Danish SMEs. The MVP focuses on a single core feature: receiving customer inquiries and generating Danish-language AI responses for review and approval.

**Design Principles:**
- Build for the next 6 months, not 6 years
- Use managed services to minimize ops burden
- Gemini API is the core AI capability
- MVP simplicity: one database, one frontend, minimal external integrations

---

## System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Danish SME User                                │
│                   (Customer Inquiry → Review → Send)                        │
└─────────────────────────────────┬─────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Leksikon.ai                                     │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────────────┐   │
│  │  Next.js    │───▶│   API Routes │───▶│  PostgreSQL (Supabase)   │   │
│  │  Frontend   │    │  (Edge/Func) │    │  - users                 │   │
│  │  (Vercel)   │    │              │    │  - inquiries             │   │
│  └─────────────┘    └──────┬───────┘    │  - responses             │   │
│                            │            │  - analytics             │   │
│                            │            └───────────────────────────┘   │
│                            │                                                 │
│                            ▼                                                 │
│                   ┌──────────────────┐                                     │
│                   │   Gemini API     │                                     │
│                   │  (Google AI)    │                                     │
│                   │  Danish language │                                     │
│                   └──────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Components

| Component | Technology | Responsibility |
|-----------|-----------|---------------|
| **Frontend** | Next.js 14 (App Router) | User dashboard, inquiry review interface, authentication UI |
| **Backend/API** | Next.js API Routes + Server Actions | Business logic, Gemini integration, webhook handlers |
| **Database** | PostgreSQL (Supabase) | User data, inquiries, responses, analytics events |
| **Authentication** | Supabase Auth | User registration, login, session management |
| **AI Engine** | Gemini 2.0 Flash | Danish language response generation |
| **Email Processing** | Supabase Edge Functions + Inbound Webhooks | Receive inquiries via email webhook |
| **File Storage** | Supabase Storage | Store inquiry attachments if any |
| **Deployment** | Vercel | Frontend + API, auto-scaling |
| **Analytics** | Custom events → PostgreSQL | Response volume, approval rate metrics |

---

## Data Model

### Users
```
users
├── id (uuid, primary key)
├── email (unique)
├── created_at
└── metadata (name, company info)
```

### Inquiries
```
inquiries
├── id (uuid, primary key)
├── user_id (fk → users)
├── source (email | web_form | webhook)
├── sender_email
├── sender_name
├── subject
├── body_text
├── raw_content (original payload)
├── status (pending | reviewed | sent | archived)
├── created_at
└── received_at
```

### Responses
```
responses
├── id (uuid, primary key)
├── inquiry_id (fk → inquiries)
├── user_id (fk → users)
├── ai_generated_text
├── status (draft | approved | edited | sent)
├── approved_text (final sent text)
├── created_at
└── sent_at
```

### Analytics Events
```
analytics_events
├── id (uuid, primary key)
├── user_id (fk → users)
├── event_type (inquiry_received | response_generated | response_approved | response_edited | response_sent)
├── inquiry_id (fk → inquiries, nullable)
├── metadata (jsonb)
└── created_at
```

---

## API Boundaries

### External APIs (Inbound)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/email` | POST | Receive inbound emails via email provider webhook |
| `/api/webhooks/form` | POST | Receive web form submissions |
| `/api/auth/*` | ALL | Supabase Auth endpoints (delegated) |

### Internal APIs (Frontend → Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/inquiries` | GET | List user's inquiries with pagination |
| `/api/inquiries/[id]` | GET | Get single inquiry details |
| `/api/inquiries/[id]/response` | POST | Generate AI response for inquiry |
| `/api/responses/[id]` | PATCH | Update response (approve/edit) |
| `/api/responses/[id]/send` | POST | Send approved response |
| `/api/analytics` | GET | Get user's analytics summary |
| `/api/users/me` | GET | Get current user profile |

---

## Key Flows

### 1. Inquiry Reception (Inbound)

```
1. Customer sends email → Email provider (Postmark/SendGrid)
2. Email provider webhook → POST /api/webhooks/email
3. API validates payload, extracts sender/body
4. API creates inquiry record (status: pending)
5. API logs analytics event (inquiry_received)
6. User sees inquiry in dashboard
```

### 2. AI Response Generation

```
1. User clicks "Generate Response" on inquiry
2. Frontend calls POST /api/inquiries/[id]/response
3. API fetches inquiry, constructs prompt with Danish context
4. API calls Gemini 2.0 Flash with prompt
5. Gemini returns Danish response draft
6. API stores response (status: draft)
7. Frontend displays response for review
```

### 3. Response Approval Workflow

```
1. User reviews AI-generated response
2. Options:
   a. Click "Approve & Send" → PATCH /api/responses/[id] (status: approved) → POST /api/responses/[id]/send
   b. Edit text → PATCH /api/responses/[id] (status: edited, approved_text: edited) → POST /api/responses/[id]/send
   c. Dismiss/Archive → PATCH /api/responses/[id] (status: archived)
3. Send flow: Email provider API → Send email to customer
4. Log analytics event (response_approved / response_edited / response_sent)
```

---

## Deployment Model

| Environment | Purpose | Setup |
|------------|--------|-------|
| **Production** | Live users | Vercel auto-deploy from main |
| **Preview** | PR review | Vercel preview deployments |
| **Development** | Local dev | `npm run dev` with local Supabase |

### Build & Deploy

- **Build**: Vercel handles Next.js builds automatically
- **Test**: CI runs `npm test` and `npm run lint` on every PR
- **Deploy**: Merges to `main` auto-deploy to production

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini
GEMINI_API_KEY=

# Email Provider (Postmark)
EMAIL_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://leksikon.ai
```

---

## Key Decisions

| Decision | Context | Rationale |
|----------|---------|-----------|
| **Next.js 14** | MVP timeline is 4-6 weeks | Full-stack React framework with built-in API routes, fast development velocity, excellent TypeScript support |
| **Supabase** | Need auth + database + storage quickly | Managed PostgreSQL, built-in auth, generous free tier, minimal ops |
| **Gemini 2.0 Flash** | Danish language MVP priority | Best Danish language performance per market analysis, cost-effective, fast |
| **Vercel** | Next.js native deployment | Zero-config hosting, preview deployments, edge functions, generous free tier |
| **No payment processing** | MVP scope explicitly excludes | Focus on validating core feature before monetization |
| **Single database** | MVP simplicity | No need for separate analytics database at this stage |
| **PostgreSQL over SQLite** | Production readiness | Supabase provides managed PostgreSQL; SQLite insufficient for production |

---

## Non-Goals (Architecture)

- **Multi-tenant isolation**: MVP has single-tenant users only
- **Real-time features**: No WebSocket/ SSE for MVP (polling acceptable)
- **Mobile native apps**: Web-only for MVP
- **Advanced caching**: No Redis/ CDN at MVP stage
- **CI/CD beyond basic**: GitHub Actions with lint + test only

---

## Security Considerations

1. **Authentication**: Supabase Auth with email/password, JWT tokens
2. **Authorization**: Row-level security (RLS) on all tables via Supabase
3. **Webhook validation**: HMAC signature verification for email webhooks
4. **Input sanitization**: All user inputs sanitized before DB storage
5. **GDPR**: All data stays in EU (Supabase EU region)
6. **API rate limiting**: Vercel Edge rate limiting on webhook endpoints
7. **No sensitive data in logs**: Inquiry content not logged

---

## Observability

| Aspect | Implementation |
|--------|---------------|
| **Error tracking** | Vercel built-in monitoring + optional Sentry |
| **Uptime monitoring** | Vercel health check endpoint |
| **Analytics** | Custom events in PostgreSQL (MVP approach) |
| **Logging** | Vercel logs + structured JSON logging for API |

---

*Document version: 1.0 | Created: 2026-04-16 | CTO: Leksikon.ai*
