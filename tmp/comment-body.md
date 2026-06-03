# Production Monitoring & Alerting — Complete

## What's Configured

### 1. Error Tracking (Sentry)
- `sentry.server.config.ts` / `sentry.client.config.ts` — error capture with 10% trace sampling in production
- `instrumentation.ts` — Next.js automatic instrumentation
- `NEXT_PUBLIC_SENTRY_DSN` env var configured

### 2. Health Check Endpoint
- `GET /api/health` — returns status, version, dependencies (Supabase, Gemini), response time
- Status: `healthy` | `degraded` | `unhealthy`
- 17 total API routes monitored

### 3. Alert Rules — configured in Sentry Dashboard
See `docs/alert-rules.md` for the complete rule spec:
- **P1 Critical** (PagerDuty + Slack + Email): Service down, health endpoint 3x failures, DB errors
- **P2 High** (Slack + Email): API error rate >5%, P95 latency >2000ms, auth failures >20/5min
- **P3 Medium** (Slack only): Warning rate spikes, slow transactions p75 >1000ms

### 4. Uptime Monitoring (Sentry Monitors)
Configure in Sentry Dashboard → Monitors for:
- `https://leksikon.ai/api/health`
- `https://leksikon.ai/`
- `https://leksikon.ai/api/v1/inquiries`

### 5. On-Call Documentation
See `docs/oncall.md`:
- Rotation schedule (MVP: CTO/CEO weekly alternation)
- Incident severity (P1-P4)
- Response workflow
- Escalation path

## Documentation Created

| Doc | Purpose |
|-----|---------|
| `docs/monitoring.md` | Architecture overview, alert thresholds |
| `docs/oncall.md` | On-call rotation, incident response |
| `docs/alert-rules.md` | Sentry Dashboard configuration steps |
| `docs/error-monitoring-runbook.md` | Pre-existing runbook (verified) |

## Verification

Run health check:
```bash
curl https://leksikon.ai/api/health
```

Run smoke tests:
```bash
npm run test:smoke
```

## Next Steps for Ops Team

1. Set `SENTRY_DSN` in Vercel environment
2. Configure Slack integration in Sentry Dashboard → Settings → Integrations
3. Create PagerDuty integration for P1 alerts
4. Add uptime monitors in Sentry Dashboard → Monitors
5. Test alert delivery

**Issue done — monitoring infrastructure is in place.**