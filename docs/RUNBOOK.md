# Runbook: Leksikon.ai Production Monitoring

## Alert Thresholds

| Severity | Condition | Response Time | Notification |
|----------|-----------|---------------|--------------|
| Critical | Application down (health check fails) | 5 minutes | Immediate |
| High | Error rate > 5% for 5 minutes | 5 minutes | Immediate |
| Medium | Response time p95 > 2s | 15 minutes | Next business day |
| Low | Performance degradation | 24 hours | Next business day |

## Monitoring Dashboards

### Sentry (Error Tracking)
- URL: https://sentry.io/organizations/leksikonai/projects
- Purpose: View unhandled exceptions, stack traces, error trends
- Access: All team members with Sentry invite

### Health Check Endpoint
- URL: `https://leksikon.ai/api/health`
- Purpose: Uptime monitoring, dependency status
- Response times < 500ms when healthy

## Common Issues

### Database Connection Failures (Supabase)

**Symptoms:**
- Health check shows `supabase: error`
- API returns 500 with database errors
- Users cannot log in

**Diagnosis:**
1. Check Supabase status at status.supabase.com
2. Check Supabase project usage at supabase.com/dashboard
3. Verify environment variables in Vercel

**Resolution:**
1. If Supabase is down - wait and monitor
2. If connection issue - verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. If rate limited - wait for quota reset or upgrade plan

### Gemini API Errors

**Symptoms:**
- AI response generation fails
- Errors mentioning `gemini` or `Google AI`

**Diagnosis:**
1. Check Gemini API status
2. Verify `GEMINI_API_KEY` is set in Vercel
3. Check API quota in Google Cloud Console

**Resolution:**
1. If API key invalid - regenerate at console.cloud.google.com
2. If rate limited - implement exponential backoff
3. If outage - monitor status and fallback to manual responses

### Authentication Failures

**Symptoms:**
- Users cannot log in
- JWT validation errors

**Diagnosis:**
1. Check Supabase Auth status
2. Verify JWT secret in Supabase settings
3. Check browser console for specific errors

**Resolution:**
1. Clear browser cookies and retry
2. Verify Supabase Auth configuration
3. Check RLS policies are not blocking

### Webhook Processing Failures

**Symptoms:**
- Inbound emails not creating inquiries
- Form submissions not working

**Diagnosis:**
1. Check webhook endpoint logs in Vercel
2. Verify webhook secret is configured
3. Check email provider status

**Resolution:**
1. Verify `EMAIL_WEBHOOK_SECRET` is set
2. Check webhook payload format
3. Resend webhook from email provider

## Escalation Path

1. **Automated alerts** → Engineer receives notification
2. **If no response in 15 minutes** → CEO notified
3. **If production down > 30 minutes** → All hands response

## Viewing Logs

### Vercel Logs
```bash
vercel logs leksikon-ai --since=1h
```

### Supabase Logs
Dashboard: supabase.com/dashboard → Project → Logs

## Getting Help

- Sentry Issues: https://sentry.io/organizations/leksikonai/issues/
- Vercel Support: https://vercel.com/docs
- Supabase Support: https://supabase.com/docs