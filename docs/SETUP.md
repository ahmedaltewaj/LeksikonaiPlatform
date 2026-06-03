# Local Development Setup — Leksikon.ai

**Estimated time: 10–20 minutes**

This guide covers getting the Leksikon.ai platform running locally for development.

---

## Prerequisites

| Tool | Version | Install |
|------|--------|---------|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) or via nvm |
| npm | 10.x | Ships with Node.js 20+ |
| Git | Any recent | [git-scm.com](https://git-scm.com) |

**Optional but recommended:**
- [nvm](https://github.com/nvm-sh/nvm) — manage multiple Node versions
- [mise](https://mise.jdx.dev) — unify dev tool versioning

---

## 1. Clone the Repository

```bash
git clone https://github.com/ahmedaltewaj/LeksikonaiPlatform.git
cd LeksikonaiPlatform
```

---

## 2. Install Dependencies

```bash
npm install
```

First install takes ~30 seconds. The lock file ensures deterministic installs.

---

## 3. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Where to Get It |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API |
| `GEMINI_API_KEY` | Google AI (Gemini API) console |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local |

### Optional Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `SENTRY_DSN` | empty | Only needed for error monitoring |
| `STRIPE_SECRET_KEY` | — | Only needed for billing features |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | — | Only needed for billing features |
| `STRIPE_WEBHOOK_SECRET` | — | Only needed for billing features |
| `EMAIL_WEBHOOK_SECRET` | — | Only needed for inbound email webhooks |

> **Security note**: Never commit `.env.local` to git. It is already in `.gitignore`.

---

## 4. Set Up the Database

### Apply Migrations

```bash
# Using Supabase CLI (recommended)
npx supabase db push

# Or manually via Supabase Dashboard → SQL Editor
# Run migrations in order from supabase/migrations/
# 001_add_users.sql → 002_add_inquiries.sql → ... → 017_add_email_configurations.sql
```

### Verify Connection

```bash
npm run dev
# Visit http://localhost:3000/api/health
# Should return: { "status": "ok", "supabase": "ok", "timestamp": ... }
```

---

## 5. Start the Dev Server

```bash
npm run dev
```

Output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (creates `.next/`) |
| `npm run start` | Start production server (`npm run build` first) |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run Vitest unit tests (watch mode) |
| `npm run test:unit` | Run Vitest unit tests (once) |
| `npm run test:smoke` | Run Playwright smoke tests |
| `npm run test:smoke:headed` | Run Playwright in headed mode (debug) |

---

## Project Structure

```
leksikon-ai/
├── src/
│   ├── app/                    # Next.js App Router pages + API routes
│   │   ├── api/                # API routes (/webhooks, /v1, /onboarding)
│   │   ├── (dashboard)/         # Dashboard pages
│   │   ├── auth/                # Auth callback routes
│   │   ├── billing/            # Billing pages
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   └── page.tsx            # Landing page
│   ├── components/            # Shared UI components
│   ├── hooks/                  # React hooks
│   ├── lib/                     # Core libraries (Supabase, Gemini, Email, Stripe)
│   └── middleware.ts           # Next.js middleware (auth, routing)
├── supabase/
│   └── migrations/            # Database migrations (001 → 017+)
├── tests/                      # Playwright E2E smoke tests
├── docs/                       # Project documentation
├── .env.example               # Template for local .env.local
└── package.json               # Scripts + dependencies
```

---

## Common Local Dev Tasks

### Reset Database

```bash
# Via Supabase CLI
npx supabase db reset
```

### Clear Supabase Cache

```bash
# Ctrl+C to stop dev server
rm -rf node_modules/.cache/
npm run dev
```

### Run a Single Migration

Open `supabase/migrations/<NUMBER>_<name>.sql` in [Supabase Dashboard SQL Editor](https://supabase.com/dashboard) and run it directly.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module 'next'` | Run `npm install` — node_modules may be incomplete |
| Supabase connection error | Verify env vars are set in `.env.local`; check project status at [status.supabase.com](https://status.supabase.com) |
| TypeScript errors on first run | Run `npm run typecheck` to see all errors |
| Port 3000 already in use | `PORT=3001 npm run dev` or find and kill the process using port 3000 |
| `npm run dev` is slow | Check if your disk I/O is slow; `NEXT_TELEMETRY_DISABLED=1` speeds things up |

---

## Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Deployment Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Sentry (Error Monitoring)**: https://sentry.io/organizations/leksikonai/issues

---

*Document version: 1.0 | Owner: Engineer | Leksikon.ai*