# Error Monitoring & Alerting Runbook

## Sentry Integration

Sentry is already configured in the project.

### Configuration Files
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking  
- `instrumentation.ts` - Next.js instrumentation
- `next.config.js` - Sentry webpack plugin integration

### Environment Variables

Add these to your Vercel/project environment:

```
SENTRY_DSN=<from-sentry-dashboard>
```

Get your DSN from: Sentry Dashboard → Project → Settings → Client Keys (DSN)

### How It Works
1. Errors in both client and server code are automatically captured
2. Source maps are uploaded for readable stack traces
3. `tracesSampleRate: 0.1` in production (10% of transactions)

## Health Check Endpoint

**URL:** `GET /api/health`

**Purpose:** Uptime monitoring and dependency health verification.

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "leksikon-ai",
  "version": "1.0.0",
  "dependencies": {
    "supabase": "ok|error",
    "gemini": "ok"
  },
  "responseTimeMs": 123
}
```

**Status Definitions:**
- `healthy` - All dependencies OK
- `degraded` - One or more dependencies have issues
- `unhealthy` - Service cannot serve requests

### Monitoring Setup
Point your uptime checker (e.g., UptimeRobot, Pingdom) to:
```
GET https://<your-domain>/api/health
```

Alert on non-200 response or when `status` is not `healthy`.

## Alerting Setup

Sentry automatically alerts on:
- New errors
- Error rate spikes
- Performance regressions

Configure additional alerts in Sentry dashboard:
1. Go to Alerts → Create Alert
2. Set conditions (e.g., error count > X in Y minutes)
3. Set notification channels (email, Slack, etc.)

## Common Error Scenarios

### Supabase Connection Issues
**Symptom:** `/api/health` returns `supabase: error`

**Actions:**
1. Check Supabase dashboard for outages
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set correctly
3. Check Supabase project status at status.supabase.com

### High Error Rate
**Symptom:** Sentry shows spike in error count

**Actions:**
1. Open Sentry issue details
2. Check affected users/user count
3. Review recent deployments
4. Identify root cause and patch

## Runbook

1. **Deploy complete** → Sentry receives errors automatically
2. **Monitor** → Check `/api/health` for uptime
3. **Alert** → Sentry sends notifications on critical errors
4. **Respond** → Fix issues and redeploy