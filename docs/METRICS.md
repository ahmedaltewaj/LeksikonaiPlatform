# MVP Success Metrics

**Issue**: LEKAA-25  
**Owner**: CEO  
**Date**: 2026-04-27  
**Status**: Active

---

## Phase 1: MVP Validation (Month 1-2)

### User Acquisition

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| Early users registered | 10+ | — | App analytics / Supabase |
| Daily active users (DAU) | 5+ | — | App analytics |
| Inquiry volume per user per week | 10+ | — | App analytics |

### AI Performance

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| AI response coverage | 80%+ | — | % of inquiries with AI suggestions |
| AI approval rate (no edits) | 60%+ | — | Approved / total suggestions |
| AI edit rate | <20% | — | Edited / total suggestions |
| Average response time | <5s | — | API latency tracking |

### Technical Quality

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| System uptime | 99%+ | — | Uptime monitoring |
| Response time P95 | <2s | — | API latency tracking |
| Zero data loss incidents | 100% | — | Error tracking |
| Concurrent users | 10+ | — | Load test + production |

### User Satisfaction

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| NPS (early users) | 30+ | — | In-app survey |
| Churn rate (month 1) | <20% | — | DAU / MAU tracking |
| Support tickets per user | <2/week | — | Support ticket volume |

---

## Phase 2: Product-Market Fit (Month 3-6)

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| Paying customers | 50+ | — | Payment records |
| MRR | €2,500 | — | Stripe / billing |
| Customer retention (month 3) | 80%+ | — | Cohort analysis |
| AI approval rate | 70%+ | — | App analytics |
| NPS | 40+ | — | In-app survey |

---

## Phase 3: Revenue Generation (Month 7-12)

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| MRR | €5,000 | — | Stripe / billing |
| Monthly churn | <5% | — | Cohort analysis |
| CAC payback | <6 months | — | Marketing + billing |
| LTV:CAC ratio | 3:1+ | — | Financial tracking |
| NPS | 50+ | — | In-app survey |

---

## Phase 4: Scale Ready (Month 12-18)

| Metric | Target | Current | Tracking Method |
|--------|--------|---------|----------------|
| MRR | €10,000 | — | Stripe / billing |
| Paying customers | 200+ | — | Payment records |
| Gross margin | 70%+ | — | Financial tracking |
| Team utilization | <40 hrs/week | — | Time tracking |

---

## Tracking Approach

- **App Analytics**: Supabase + custom event tracking in the application
- **Billing**: Stripe dashboard for MRR, churn, LTV
- **User Feedback**: In-app NPS survey (1 question) + support ticket categorization
- **Technical**: UptimeRobot for uptime, application logs for latency
- **Review Cadence**: Weekly metrics review in weekly standup, monthly deep-dive

## North Star Metric

**AI Approval Rate** (suggestions approved without edits / total suggestions) is the primary North Star.

- Directly measures product value: high approval = AI is saving time
- Leading indicator of retention and NPS
- Adjustable as we learn: start at 60% target, calibrate from early data

## Reporting

Weekly metrics snapshot posted to the company dashboard. First review: 2 weeks after MVP launch.
