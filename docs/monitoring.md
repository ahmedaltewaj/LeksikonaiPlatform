# Monitoring & Alerting Configuration

## Overview

Production monitoring for Leksikon.ai platform.这套配置处理:
- Error tracking and alerting (Sentry)
- Uptime monitoring
- Performance metrics
- Alert thresholds and notification routing
- On-call rotation

## Components

### 1. Health Endpoint

`GET /api/health` returns:
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "leksikon-ai",
  "version": "1.0.0",
  "dependencies": {
    "supabase": "ok|error",
    "gemini": "ok|error"
  },
  "responseTimeMs": 45
}
```

**Alert thresholds:**
- `healthy`: responseTime < 500ms, supabase = ok
- `degraded`: responseTime 500-2000ms OR supabase slow
- `unhealthy`: responseTime > 2000ms OR supabase error

### 2. Sentry Alert Rules

| Alert | Trigger | Severity | Notify |
|-------|---------|----------|--------|
| Error spike | >10 errors in 5min | critical | Email + Slack |
| API error rate | >5% of requests fail | high | Email + Slack |
| P95 latency | >2000ms for 5min | high | Slack |
| Health endpoint down | 3 consecutive failures | critical | Email + Slack |
| Database errors | >5 DB errors in 5min | high | Slack |
| Auth failures | >20 failed logins in 5min | medium | Slack |

### 3. Uptime Monitoring

**Monitored endpoints:**
- `https://leksikon.ai/api/health` (health check)
- `https://leksikon.ai/` (frontend)
- `https://leksikon.ai/api/v1/inquiries` (core API)

**SLA targets:**
- 99.5% uptime (43.8 min downtime/month)
- P95 response time < 500ms
- Error rate < 1%

### 4. Notification Routing

| Severity | Channel | Response Time |
|----------|---------|---------------|
| Critical | Email + Slack + PagerDuty | 15 min |
| High | Slack + Email | 1 hour |
| Medium | Slack | Next business day |
| Low | Email digest | Weekly |

### 5. On-Call Rotation

See `ONCALL.md` for full rotation schedule and procedures.

## Environment Variables

```env
# Sentry (already configured in sentry.server.config.ts)
SENTRY_DSN=your-dsn

# Optional: PagerDuty integration for critical alerts
# PAGERDUTY_ROUTING_KEY=your-key
```

## Verification

Run the health check:
```bash
curl -w "\nTime: %{time_total}s\n" https://leksikon.ai/api/health
```

Expected response time < 500ms for healthy status.