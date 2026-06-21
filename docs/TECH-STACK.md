# Tech Stack Document

**Version**: 1.0  
**Date**: 2026-04-24  
**Status**: Complete  
**Owner**: Engineer  

---

## Purpose

This document evaluates and documents the technology choices for the Leksikon.ai MVP. It provides rationale for each selection to support architectural decisions and team alignment.

---

## Technology Choices

### Frontend Framework

| Property | Value |
|----------|-------|
| **Technology** | Next.js |
| **Version** | 14.x |
| **Renderer** | App Router + React Server Components |
| **Language** | TypeScript 5.x (strict mode) |

**Evaluation:**

- **Chosen for**: Fast development velocity, built-in API routes, excellent TypeScript support, Vercel native deployment
- **Alternatives considered**:
  - Plain React + Express: More setup time, no built-in API routing
  - Remix: Good alternative but Next.js has broader ecosystem support
- **Rationale**: MVP timeline (4-6 weeks) requires maximum velocity. Next.js 14 App Router provides full-stack capabilities with minimal infrastructure setup.

---

### Backend / API

| Property | Value |
|----------|-------|
| **Technology** | Next.js API Routes + Server Actions |
| **Runtime** | Edge Functions (Vercel) |
| **Validation** | Zod |

**Evaluation:**

- **Chosen for**: Unified codebase, Edge Function deployment, seamless frontend integration
- **Rationale**: Same deployment unit as frontend eliminates separate API hosting complexity for MVP.

---

### Database

| Property | Value |
|----------|-------|
| **Technology** | PostgreSQL |
| **Provider** | Supabase (managed) |
| **Region** | EU |
| **ORM** | Supabase JS client |

**Evaluation:**

- **Chosen for**: Managed PostgreSQL with built-in auth, generous free tier, minimal ops burden
- **Alternatives considered**:
  - SQLite: Insufficient for production (MVP needs concurrent user support)
  - PlanetScale: MySQL, less familiar to team
  - Neon: Good alternative, PostgreSQL selected for Supabase ecosystem fit
- **Rationale**: Supabase provides auth + database bundle with RLS security. EU region satisfies GDPR requirements.

---

### Authentication

| Property | Value |
|----------|-------|
| **Technology** | Supabase Auth |
| **Method** | Email/password |
| **Token** | JWT |

**Evaluation:**

- **Chosen for**: Native Supabase integration, works seamlessly with Supabase client
- **Rationale**: Part of Supabase ecosystem, zero additional infrastructure for MVP.

---

### AI Engine

| Property | Value |
|----------|-------|
| **Technology** | Gemini |
| **Model** | 2.0 Flash |
| **Provider** | Google AI (Gemini API) |
| **Focus** | Danish language |

**Evaluation:**

- **Chosen for**: Best Danish language performance per market analysis, cost-effective, fast inference
- **Alternatives considered**:
  - GPT-4: Higher cost, similar quality but less Danish optimization
  - Claude: Good quality but less Danish-specific training data evident
  - Llama (self-hosted): Too much infra complexity for MVP timeline
- **Rationale**: Gemini 2.0 Flash offers best Danish language performance at lowest cost for MVP scope. Google's investment in multilingual capabilities provides confidence in Danish language quality.

---

### Hosting & Deployment

| Property | Value |
|----------|-------|
| **Technology** | Vercel |
| **Features** | Auto-scaling, Edge Functions, Preview Deployments |
| **CI/CD** | GitHub Actions (basic lint + test) |

**Evaluation:**

- **Chosen for**: Next.js native hosting, zero-config deployment, preview environments for PR review
- **Alternatives considered**:
  - AWS (EC2/ECS): More control but significant ops overhead
  - Railway/Render: Good options but Vercel has better Next.js integration
- **Rationale**: Vercel- Next.js integration is seamless. Preview deployments accelerate code review. Free tier sufficient for MVP.

---

### Email Processing

| Property | Value |
|----------|-------|
| **Technology** | Supabase Edge Functions + Inbound Webhooks |
| **Provider integration** | Postmark/SendGrid |

**Evaluation:**

- **Chosen for**: Supabase ecosystem fit, Edge Function deployment, webhook-first approach
- **Rationale**: Email provider webhooks → Edge Function → Supabase is a simple, reliable flow for MVP.

---

### File Storage

| Property | Value |
|----------|-------|
| **Technology** | Supabase Storage |
| **Purpose** | Inquiry attachments |

**Evaluation:**

- **Chosen for**: Part of Supabase ecosystem, unified credentials
- **Rationale**: Minimal MVP use case (attachments on inquiries). Supabase Storage handles it with no additional providers.

---

### State Management

| Property | Value |
|----------|-------|
| **Technology** | React Server Components |
| **Client State** | Minimal (useEffect where needed) |

**Evaluation:**

- **Chosen for**: MVP simplicity, no need for Redux/Zustand overhead
- **Rationale**: Most data is server-fetched. Client interactivity limited to response review workflow.

---

## Summary Table

| Layer | Technology | Version | Priority |
|-------|-----------|---------|----------|
| Language | TypeScript | 5.x (strict) | Required |
| Framework | Next.js | 14.x | Required |
| Database | PostgreSQL (Supabase) | — | Required |
| Auth | Supabase Auth | — | Required |
| AI | Gemini | 2.0 Flash | Required |
| Hosting | Vercel | — | Required |
| Email | Supabase Edge Functions | — | Required |
| Storage | Supabase Storage | — | Required |
| State | RSC + minimal client | — | Required |

---

## Non-Choices (Out of Scope for MVP)

| Technology | Reason |
|------------|--------|
| Redis/Cache | No scaling requirements at MVP stage |
| WebSocket/SSE | Polling acceptable for MVP |
| Mobile native | Web-only for MVP |
| Multi-tenant isolation | Single-tenant MVP |
| Payment processing | Deferred post-MVP |
| Advanced CI/CD | Basic lint + test only for MVP |

---

## Technology Debt & Future Considerations

1. **PostgreSQL over MySQL**: PostgreSQL chosen for JSONB support and Supabase native fit. MySQL remains an alternative if Supabase proves limiting.
2. **No caching layer**: Redis deferred until performance metrics indicate need.
3. **Monolithic Next.js**: All-in-one codebase chosen for MVP simplicity. Microservices considered only at significant scale.
4. **Gemini over GPT-4**: Cost-performance ratio favors Gemini for MVP. OpenAI remains available if Gemini quality disappoints.

---

## Dependencies

Core runtime dependencies:

```
next: ^14.x
typescript: ^5.x
@supabase/supabase-js: ^2.x
@google/generative-ai: ^0.2.x
zod: ^3.x
```

---

*Document maintained by Engineer | Leksikon.ai*
