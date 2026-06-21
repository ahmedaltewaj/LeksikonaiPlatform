# Production Alert Configuration

This document specifies the alert rules to configure in Sentry for production monitoring.

## Alert Rules to Configure in Sentry Dashboard

### 1. Critical Alerts (PagerDuty + Slack + Email)

**P1: Service Down**
```
WHEN: An error occurs
IF:   event.level >= error AND count() > 10 in 5 minutes
THEN: PagerDuty + Slack #incidents + Email to CTO
```

**P2: Health Endpoint Down**
```
WHEN: Uptime monitor fails 3 consecutive checks
THEN: PagerDuty + Slack #incidents
```

**P3: Database Connection Failed**
```
WHEN: An error occurs
IF:   error.message contains "supabase" OR error.message contains "database"
AND:  count() > 5 in 5 minutes
THEN: PagerDuty + Slack #incidents
```

### 2. High Priority Alerts (Slack + Email)

**API Error Rate Spike**
```
WHEN: An error occurs
IF:   event.category === "transaction" AND http.status_code >= 500
AND:  count() > 20 in 10 minutes
THEN: Slack #alerts
```

**P95 Latency Regression**
```
WHEN: Performance issue detected
IF:   p95(transaction.duration) > 2000ms
FOR:  5 minutes
THEN: Slack #alerts
```

**Authentication Failures**
```
WHEN: An error occurs
IF:   error.message contains "Unauthorized" OR error.message contains "Forbidden"
AND:  count() > 20 in 5 minutes
THEN: Slack #alerts
```

### 3. Medium Priority Alerts (Slack Only)

**Warning Rate**
```
WHEN: A warning occurs
IF:   event.level == "warning"
AND:  count() > 30 in 15 minutes
THEN: Slack #alerts
```

**Slow Transactions**
```
WHEN: Performance issue detected
IF:   p75(transaction.duration) > 1000ms
FOR:  10 minutes
THEN: Slack #alerts
```

### 4. Uptime Monitoring Configuration

**Configure in Sentry Dashboard → Monitors → Create Uptime Monitor:**

| Monitor | URL | Interval | Timeout | Alert On |
|---------|-----|----------|---------|----------|
| Primary API | `https://leksikon.ai/api/health` | 5 min | 10s | 3 failures |
| Frontend | `https://leksikon.ai/` | 5 min | 10s | 3 failures |
| Inquiries API | `https://leksikon.ai/api/v1/inquiries` | 5 min | 10s | 3 failures |

**Assertion for health endpoint:**
- Status code: 200
- Response body: `$.status equals "healthy"`

## Alert Thresholds Summary

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error count (5min) | >5 | >10 | PagerDuty + Slack |
| API error rate | >2% | >5% | Slack |
| P95 latency | >1000ms | >2000ms | Slack |
| Health check failures | 1 | 3 | PagerDuty + Slack |
| Auth failures (5min) | >10 | >20 | Slack |
| DB errors (5min) | >3 | >5 | PagerDuty + Slack |

## Notification Channels

| Channel | Purpose | Configured In |
|---------|---------|---------------|
| PagerDuty | P1 critical alerts | Sentry Dashboard → Settings → Integrations |
| Slack #incidents | All alerts | Sentry Dashboard → Settings → Integrations |
| Email CTO | P1 and P2 only | Sentry Dashboard → Alerts → Notification |

## Sentry Dashboard Setup Steps

1. Go to https://sentry.io/leksikon
2. Navigate to Alerts → Create Alert Rule
3. Select "Issues" for error-based alerts
4. Set conditions using the rules above
5. Add notification routes
6. Test with a test error

## Performance Monitoring

Sentry is configured with:
- `tracesSampleRate: 0.1` (10% of transactions in production)
- Automatic instrumentation for Next.js API routes

View transaction traces in Sentry:
1. Navigate to Performance
2. Filter by `transaction.op:http.server`
3. See p75, p95, p99 latency by endpoint