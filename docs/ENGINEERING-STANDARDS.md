# Engineering Standards — Leksikon.ai MVP

**Version**: 1.0  
**Date**: 2026-04-20  
**Status**: Draft — for Engineering team use  
**Author**: CTO

---

## Purpose

This document synthesizes all technical decisions, conventions, and patterns for the Leksikon.ai MVP. It provides concrete implementation guidance for the Engineering team.

**Prerequisites**: ARCHITECTURE.md, git-workflow.md, pr-conventions.md

---

## Tech Stack (Confirmed)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Language** | TypeScript | 5.x | Strict mode required |
| **Framework** | Next.js | 14.x | App Router |
| **Database** | PostgreSQL | via Supabase | Managed, EU region |
| **Auth** | Supabase Auth | — | Email/password, JWT |
| **AI** | Gemini | 2.0 Flash | Google AI |
| **Hosting** | Vercel | — | Next.js native |
| **Email** | Supabase Edge Functions | — | Webhook inbound |
| **State** | React Server Components | — | Minimal client state |

---

## Project Structure

```
leksikon-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, register)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API Routes (webhooks, internal)
│   │   │   ├── webhooks/      # Email/form webhook handlers
│   │   │   └── v1/           # Internal API v1
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   ├── inquiry/            # Inquiry-specific components
│   │   └── response/          # Response review components
│   ├── lib/
│   │   ├── supabase/          # Supabase client + types
│   │   ├── gemini/            # Gemini API client
│   │   ├── email/             # Email provider integration
│   │   └── utils/             # Shared utilities
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # Shared TypeScript types
├── supabase/
│   ├── migrations/            # DB migrations
│   └── seed.sql               # Seed data (if needed)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local                 # Local env vars
├── .env.example               # Env var template
└── README.md
```

---

## Code Conventions

### TypeScript

- **Strict mode**: Always use `strict: true` in tsconfig
- **No `any`**: Use `unknown` and proper type guards
- **No `@ts-ignore`**: Fix properly or use eslint-disable with comment
- **Explicit types**: Function params, return values, API responses

### Naming

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-auth.ts`, `inquiry-list.tsx` |
| Components | PascalCase | `InquiryCard.tsx` |
| Functions | camelCase | `generateResponse()` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `interface UserProfile` |
| Database tables | snake_case | `inquiry_id`, `created_at` |
| API routes | kebab-case | `/api/inquiries/[id]/response` |

### Component Patterns

```typescript
// ✅ GOOD: Server component with typed props
interface Props {
  inquiryId: string;
}

export default async function InquiryDetail({ inquiryId }: Props) {
  const inquiry = await db.inquiries.findById(inquiryId);
  // Server component — no 'use client'
}

// ✅ GOOD: Client component with explicit boundary
'use client';

interface Props {
  inquiryId: string;
  onApprove: (id: string) => void;
}

export function ResponseReview({ inquiryId, onApprove }: Props) {
  // Client component — interactive
}
```

---

## API Design

### Route Handler Pattern (Next.js 14)

```typescript
// ✅ app/api/inquiries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['pending', 'reviewed']).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  const inquiries = await db.inquiries.findByUserId(userId);
  return NextResponse.json({ data: inquiries });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  
  // Create inquiry
  return NextResponse.json({ data: result }, { status: 201 });
}
```

### Webhook Handler Pattern

```typescript
// ✅ app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/email/webhook';

const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-webhook-signature');
  const rawBody = await req.text();
  
  // 1. Verify signature (HMAC)
  if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // 2. Parse and validate
  const payload = JSON.parse(rawBody);
  
  // 3. Idempotency check
  const existing = await db.inquiries.findByWebhookId(payload.messageId);
  if (existing) {
    return NextResponse.json({ status: 'already_processed' }, { status: 200 });
  }
  
  // 4. Process
  const inquiry = await db.inquiries.create({
    webhookId: payload.messageId,
    senderEmail: payload.from,
    body: payload.text,
    status: 'pending',
  });
  
  // 5. Return fast, process async if needed
  return NextResponse.json({ inquiryId: inquiry.id }, { status: 201 });
}
```

---

## Database Conventions (Supabase)

### Migration Naming

```
supabase/migrations/
├── 001_add_users.sql
├── 002_add_inquiries.sql
├── 003_add_responses.sql
└── 004_add_analytics_events.sql
```

### Row-Level Security (RLS)

**All tables MUST have RLS enabled.**

```sql
-- Example: Inquiries RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Query Pattern

```typescript
// ✅ lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default supabase;

// ✅ Server-side with service role (for API routes)
import { createClient } from '@supabase/supabase-js';

export function getServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

---

## Gemini Integration Pattern

### Response Generation

```typescript
// ✅ lib/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateDanishResponse(
  inquiry: { senderName: string; body: string },
  userId: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `
Du er en dansk kundeservicemedarbejder. Skriv et høfligt, professionelt svar på dansk.

Kundehenvendelse:
Fra: ${inquiry.senderName}
Besked: ${inquiry.body}

Svar (kort, venligt, professionelt):
`;
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  
  // Log analytics event
  await db.analyticsEvents.create({
    userId,
    eventType: 'response_generated',
    inquiryId: inquiry.id,
  });
  
  return response.text();
}
```

### Error Handling

```typescript
// ✅ Consistent error handling
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt}/${MAX_RETRIES} failed (${context}):`, error);
      
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }
  
  throw new Error(`Failed after ${MAX_RETRIES} attempts (${context}): ${lastError?.message}`);
}
```

---

## Git Workflow

### Branch Naming

```
leksikonaiaa-<issue-number>/<short-description>

Examples:
leksikonaiaa-9/init-repo
leksikonaiaa-11/core-feature
leksikonaiaa-15/github-auth
```

### Commit Messages (Conventional Commits)

```
<type>: <short description>

Types: feat, fix, docs, chore, refactor, test, perf
```

| Example | Use |
|---------|-----|
| `feat: add user authentication` | New feature |
| `fix: handle null inquiry in response generation` | Bug fix |
| `docs: add ARCHITECTURE.md` | Documentation |
| `chore: add Supabase migrations` | Infrastructure |
| `refactor: extract Gemini client` | Code restructuring |
| `test: add inquiry API tests` | Tests |
| `perf: cache Gemini responses` | Performance |

### PR Process

1. Create branch from main
2. Implement with test coverage
3. Open PR with template
4. @-mention Code Reviewer + Product Owner
5. Both approve → Engineer merges
6. CI must pass

---

## Error Handling

### API Error Response Pattern

```typescript
// ✅ Consistent error response
import { z } from 'zod';

class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR'
) {
  return NextResponse.json({ error: { message, code } }, { status: statusCode });
}

// Usage
if (!user) {
  return errorResponse('User not found', 404, 'USER_NOT_FOUND');
}
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini
GEMINI_API_KEY=AIza...

# Email Webhook
EMAIL_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Requirements

| Type | Coverage Target | Tools |
|------|---------------|-------|
| Unit | 80%+ | Vitest |
| Integration | Critical paths | Vitest + Supabase |
| E2E | Happy path | Playwright |

---

## Security Checklist

- [ ] All Supabase tables have RLS enabled
- [ ] Webhook endpoints verify HMAC signatures
- [ ] No secrets in code or logs
- [ ] User input sanitized before DB queries
- [ ] Rate limiting on public endpoints
- [ ] GDPR: all data in EU region

---

*Document maintained by CTO | Leksikon.ai*
