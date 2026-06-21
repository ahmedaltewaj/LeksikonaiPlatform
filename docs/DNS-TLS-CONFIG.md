# DNS and TLS Configuration — Leksikon.ai

**Version**: 1.1
**Date**: 2026-05-29
**Status**: Blocked — waiting on Vercel deployment (LEKAA-13)
**Author**: Engineer

---

## Overview

Production DNS and TLS configuration for `leksikon.ai` hosted on Vercel with Cloudflare as CDN/WAF.

## Current State

- **Domain**: `leksikon.ai`
- **Hosting**: Vercel (Next.js app, region `fra1`)
- **CDN/WAF**: Cloudflare (proxy active)
- **Current DNS**: A records pointing to Cloudflare IPs (104.21.80.33, 172.67.173.170)
- **Result**: **502 Bad Gateway** — Cloudflare cannot reach Vercel origin
- **TLS**: Cloudflare Universal SSL active (terminates TLS at edge)
- **Vercel project name**: `leksikon-ai` (from vercel.json project reference)
- **No local `.vercel/` directory** — Vercel CLI not authenticated locally

## Diagnosis

The 502 is a **Cloudflare → Vercel connectivity failure**, not a TLS issue.

1. Cloudflare is proxying traffic but cannot reach the origin Vercel deployment
2. Vercel project exists (confirmed by `vercel.json`), but no active deployment is reachable
3. `leksikon-ai.vercel.app` returns 404 — either the project needs a deployment or the URL is wrong
4. LEKAA-13 ("Deploy to production") is `in_progress` and is the true root cause

## DNS Configuration (Current)

### Cloudflare DNS Records (A records — incorrect for Vercel)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | 104.21.80.33 | Proxied |
| A | @ | 172.67.173.170 | Proxied |
| AAAA | @ | 2606:4700:3033::ac43:adaa | Proxied |
| AAAA | @ | 2606:4700:3030::6815:5021 | Proxied |

### Cloudflare SSL Settings

- **SSL/TLS Mode**: Full (strict) — confirmed working at edge
- **Edge Certificates**: Cloudflare Universal SSL (free) — valid
- **Problem**: Origin is unreachable, SSL inspection cannot occur

## Required DNS Setup (Once Vercel Deploy Works)

When LEKAA-13 deploys to Vercel successfully:

1. **Change DNS at domain registrar** (not Cloudflare proxy):
   - Remove the A records for `@`
   - Add CNAME: `@` → `cname.vercel-dns.com`
   - Add CNAME: `www` → `cname.vercel-dns.com`

2. **Vercel domain verification:**
   - Go to Vercel Dashboard → Project → Settings → Domains
   - Add `leksikon.ai`
   - Verify ownership via DNS record
   - Vercel will provide a verification token to add as TXT record

3. **Do NOT proxy the CNAME** — set Cloudflare to DNS-only mode for the CNAME record until Vercel verifies it

## Environment Variables (Required on Vercel)

```
NEXT_PUBLIC_APP_URL=https://leksikon.ai
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<gemini-key>
SENTRY_DSN=<sentry-dsn>
```

## Verification

### After Vercel deploy (LEKAA-13 resolves):

1. Check DNS propagation:
   ```bash
   dig +short leksikon.ai
   # Should return Vercel IPs (not Cloudflare IPs directly)
   ```

2. Test HTTPS:
   ```bash
   curl -I https://leksikon.ai
   # Should return 200 or redirect, not 502
   ```

3. Health check:
   ```bash
   curl https://leksikon.ai/api/health
   # Should return {status: ok, ...}
   ```

## Blockers

| Blocker Issue | Status | Action Needed |
|---------------|--------|---------------|
| LEKAA-13: Deploy to production | in_progress | Vercel deployment must complete first |
| No Vercel CLI auth locally | — | Once LEKAA-13 is done, run `vercel login` locally |

---

## Production Checklist

- [x] Cloudflare Universal SSL active (edge TLS working)
- [x] DNS resolves to Cloudflare (104.21.80.33, 172.67.173.170)
- [x] TLS handshake succeeds at edge (Cloudflare terminates)
- [ ] DNS updated to CNAME to Vercel (waiting on LEKAA-13)
- [ ] Vercel domain verified and deployment active
- [ ] HTTPS working for all routes
- [ ] Health check returns 200: `https://leksikon.ai/api/health`

---

*Document maintained by Engineer | Leksikon.ai*
