# Alerting Configuration — Leksikon.ai

## Setup Summary

### Error Monitoring (Sentry)
- **SDK**: @sentry/nextjs v8.x
- **Configuration**: `sentry.client.config.ts`, `sentry.server.config.ts`
- **Environment Variables**:
  - `SENTRY_DSN` - Required for error capture
  - `SENTRY_AUTH_TOKEN` - For source map uploads

### Uptime Monitoring
- **Health Endpoint**: `GET /api/health`
- **Returns**: status, timestamp, version, dependencies, responseTimeMs
- **Status Codes**: 200 (healthy/degraded), 503 (unhealthy)

## Alert Configuration

### Sentry Alerts (sentry.io)

1. **New Issue Created** → Notify engineer immediately
2. **Issue Frequency Spike** → Alert when error count increases 10x
3. **Performance Regression** → Alert on p95 latency > 2s

### Uptime Alerts (Vercel / External)

Configure in your uptime monitoring service:

| Check | URL | Expected Response |
|-------|-----|-------------------|
| Health | `/api/health` | `{ "status": "healthy" }` |

Alert on:
- HTTP status != 200 for 5 minutes
- Response time > 1s for 5 consecutive checks
- JSON parse failure

## Team Notifications

| Level | Channel | Trigger |
|-------|---------|---------|
| Critical | Email + SMS | Application down |
| High | Email | Error rate > 5% |
| Medium | Slack | Performance degraded |
| Low | Dashboard only | - |

## Environment Variables for Production

Add in Vercel project settings:

```
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=<token-for-source-maps>
```

## Verification

Test error capture:
```javascript
throw new Error('Test error from production')
```

Test health endpoint:
```bash
curl https://leksikon.ai/api/health
```