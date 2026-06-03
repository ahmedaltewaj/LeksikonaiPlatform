# On-Call Rotation & Incident Response

## Current Setup

For MVP stage (first 50 customers), the on-call rotation is:

| Role | Person | Responsibilities |
|------|--------|-------------------|
| Primary | CTO (Ahmed) | All incidents, final escalation |
| Secondary | CEO (Lars) | Business continuity, customer comms |

## Rotation Schedule

### MVP Phase (0-50 customers)
- **Week 1**: Ahmed
- **Week 2**: Lars
- **Week 3**: Ahmed
- ...alternate weekly

### Post-MVP (50+ customers)
Rotate weekly with dedicated on-call engineer.

## Incident Severity

| Severity | Definition | Response Time | Examples |
|----------|------------|---------------|----------|
| P1 Critical | Service down, data at risk | 15 min | DB connection failed, auth broken |
| P2 High | Core feature broken, >10% users affected | 1 hour | Inquiries not processing, emails not sending |
| P3 Medium | Non-critical feature broken, workaround exists | 4 hours | Analytics slow, NPS survey broken |
| P4 Low | Minor issues, no user impact | 1 business day | UI glitch, non-essential API slow |

## Incident Response Workflow

### 1. Detection
- Automated: Sentry alert → Slack notification → PagerDuty (if P1)
- Manual: Customer report → Slack #support → on-call notified

### 2. Acknowledge
- On-call must acknowledge within 15 min (P1) or 1 hour (P2)
- Acknowledge in Slack: `@oncall I got it, investigating`

### 3. Assess
- Check Sentry dashboard for error details
- Check health endpoint: `curl https://leksikon.ai/api/health`
- Check Vercel deployment status
- Check Supabase status (supabase.com/dashboard)

### 4. Communicate
- Post in #incidents: "Investigating [issue]. More updates in 30 min."
- For P1/P2: Email affected customers within 1 hour

### 5. Resolve
- Fix deployed to Vercel (main branch auto-deploys)
- Confirm health endpoint returns "healthy"
- Post resolution in #incidents

### 6. Post-Mortem
- Required for P1/P2 within 48 hours
- Document: what happened, root cause, fix, prevention

## Contact Info

| Contact | Channel | For |
|---------|---------|-----|
| Ahmed | @ahmed on Slack, +45 XX XX XX XX | Primary on-call |
| Lars | @lars on Slack, +45 XX XX XX XX | Secondary, business issues |
| Sentry | sentry.io/leksikon | Error monitoring |
| Vercel Support | vercel.com/support | Deployment issues |

## Escalation Path

```
Customer Report
      ↓
Slack #support
      ↓
On-call (15 min ack)
      ↓
CTO (if P1, 30 min no progress)
      ↓
CEO (if business critical, 1 hour no progress)
```

## Tools

- **Error Tracking**: Sentry (sentry.io/leksikon)
- **Uptime Monitoring**: Sentry + Vercel built-in
- **Communication**: Slack #incidents, #support
- **Deployment**: Vercel (auto-deploy from main)
- **Status Page**: (future) statuspage.io or updown.io

## Known Issues & Mitigations

| Issue | Workaround |
|-------|------------|
| Supabase connection slow | Health check degrades gracefully |
| Gemini API rate limit | Retry with exponential backoff, alert if >5 retries |
| Vercel cold start | Edge function warm-up, monitor p95 latency |