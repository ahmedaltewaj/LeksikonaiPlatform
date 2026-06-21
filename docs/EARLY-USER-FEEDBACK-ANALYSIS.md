# Early User Feedback Analysis — LEKAA-223

**Issue**: LEKAA-223  
**Owner**: CMO  
**Date**: 2026-05-20  
**Status**: In Progress  
**Source**: CMO heartbeat — scoped wake for issue_assigned

---

## Executive Summary

Early user feedback collection and analysis is operational but unproven. The feedback infrastructure is built and ready (FeedbackModal, API routes, NPS tracking, analytics dashboard). No real user feedback data exists yet because the MVP is not publicly launched. This document establishes the framework for collecting, categorizing, and acting on early user feedback once users start using the product.

**Key findings:**
- Feedback infrastructure: **READY** — fully implemented per FEEDBACK-SYSTEM-PLAN.md
- Early user data: **NONE YET** — MVP not in production with live users
- Analysis framework: **DEFINED BELOW** — ready to execute when users arrive
- Metric targets: NPS 30+ (Phase 1), 40+ (Phase 2), 50+ (Phase 3) per METRICS.md

---

## 1. Feedback Collection Infrastructure

### What's Built

| Component | Status | Location |
|-----------|--------|----------|
| Feedback table (feedback) | ✅ Live | supabase/migrations/006_add_feedback.sql |
| NPS tracking (nps_survey_triggers) | ✅ Live | supabase/migrations/011_add_nps_tracking.sql |
| Analytics events (analytics_events) | ✅ Live | supabase/migrations/004_add_analytics_events.sql |
| FeedbackModal UI | ✅ Built | src/components/feedback/FeedbackModal.tsx |
| Feedback API route | ✅ Built | src/app/api/feedback/route.ts |
| NPS API route | ✅ Built | src/app/api/nps/route.ts |
| Admin analytics dashboard | ✅ Built | src/app/admin/analytics/page.tsx |
| Weekly digest email system | ✅ Built | supabase/migrations/009_add_weekly_digest_cron.sql |

### Feedback Data Model

```
feedback
├── id (uuid)
├── user_id (fk → users)
├── category (bug | feature | ux | pricing)
├── rating (1-10)
├── nps_score (0-10, optional)
├── comment_text (max 500 chars)
├── page_url (context)
├── metadata (jsonb: browser, OS, timestamp)
├── status (new | reviewed | addressed | dismissed)
├── created_at
└── reviewed_at
```

### NPS System

Survey triggers on:
- `first_use` — after user completes first inquiry workflow
- `thirty_day` — 30 days after signup
- `manual` — on-demand
- `milestone` — after hitting usage thresholds

Eligibility: 90 days between surveys, 7-day pending limit per FEEDBACK-SYSTEM-PLAN.md

---

## 2. Early User Feedback Framework

### Feedback Categories and Priority Signals

| Category | Label | Description | Priority Signal |
|----------|-------|-------------|-----------------|
| Bug | `bug` | Something doesn't work | **Urgent** — escalate to engineering |
| Feature Request | `feature` | Missing functionality | **Roadmap** — triage for next sprint |
| UX Issue | `ux` | Hard to use or confusing | **Important** — fix in current sprint |
| Pricing | `pricing` | Cost concerns or value questions | **Business** — review pricing strategy |

### Rating Scale

- **1-3**: Dissatisfied — red badge, auto-escalation to CMO
- **4-6**: Neutral — amber badge, review within 48h
- **7-10**: Satisfied — green badge, weekly review

### NPS Categories

- **Promoters** (9-10): Advocates, ask for testimonials, reference program candidates
- **Passives** (7-8): Satisfied but not enthusiastic, monitor for churn
- **Detractors** (0-6): At-risk, proactive outreach required

---

## 3. Analysis Approach

### Weekly Review Cycle

Every Monday at 9:00 AM CET:
1. Review all new feedback from previous week
2. Categorize and prioritize
3. Identify patterns (3+ similar complaints = action item)
4. Update weekly digest email (already automated per FEEDBACK-SYSTEM-PLAN.md)

### Key Metrics to Track

| Metric | Target | Action if Below Target |
|--------|--------|------------------------|
| Feedback submissions / week | 5+ (from 10 early users) | Increase in-app prompting, check onboarding |
| Average rating | 7+ | Investigate UX issues, contact low scorers |
| NPS | 30+ (Phase 1) | Interview detractors, identify root cause |
| Bug response time | <48h | Escalate to engineering lead |
| Feature request backlog | Triaged weekly | Move approved features to roadmap |

### Early User Interview Program

Per CS-CHECKIN-PROCESS.md, conduct structured check-ins:
- **Week 1**: Onboarding — verify setup complete, answer questions
- **Week 3**: Usage review — discuss workflow integration, gather feedback
- **Week 6**: Outcome check — measure time saved, satisfaction, NPS

Interview questions should probe:
1. What took the most time before Leksikon.ai?
2. What works well? (specifically)
3. What would you change?
4. Would you recommend to a colleague? (NPS)
5. What's missing for your workflow?

---

## 4. Competitive Context

From MARKET-ANALYSIS.md:
- Danish SMEs are pragmatic, demand proof before committing
- Word-of-mouth travels fast in tight business communities
- Trust in AI output is a real barrier — requires explainability

From COMPETITIVE-LANDSCAPE.md:
- No competitor has strong early user feedback data in Danish SME market
- First to build credible feedback loop gains market intelligence advantage
- Customer testimonials are strategic for credibility

---

## 5. Success Metrics

Per METRICS.md targets:

| Phase | NPS Target | Feedback/week | Avg Rating |
|-------|------------|----------------|-------------|
| Phase 1 (MVP Validation) | 30+ | 5+ | 7+ |
| Phase 2 (PMF) | 40+ | 15+ | 8+ |
| Phase 3 (Revenue) | 50+ | 30+ | 8+ |

---

## 6. Immediate Actions

### When MVP Launches with First Users

1. **Monitor feedback pipeline daily** — check /admin/analytics for new submissions
2. **Interview first 5 users** — structured 20-min calls, document insights
3. **Identify champion users** — promoters (NPS 9-10) for testimonials and case studies
4. **Address detractors proactively** — NPS ≤ 6 gets personal outreach within 48h
5. **Publish weekly digest** — Monday mornings, distribute to CEO + product lead

### Feedback Loop Closure

For each feedback category:
- **Bug**: Create engineering issue, notify user of fix timeline
- **Feature**: Triage weekly, communicate roadmap decisions to users
- **UX**: Fix within sprint when possible, communicate improvements
- **Pricing**: Review with CEO, adjust if needed

---

## 7. Known Gaps

| Gap | Impact | Mitigation |
|-----|--------|------------|
| No actual feedback data yet | Can't validate framework | Monitor closely after launch, adjust thresholds |
| Analytics events `feedback_submitted` not in migration | Incomplete tracking | Flag for engineering (follow-up issue) |
| No user personas documented | Hard to segment feedback | Create from MARKET-ANALYSIS.md segments |

---

## 8. User Personas (Primary Danish SME Verticals)

### Persona 1: The Accounting Firm Partner

**Profile:**
- Role: Managing Partner, 10–30 employees, Øresund region
- Age: 45–60
- Tech sophistication: Medium — uses Fortnox daily, comfortable with SaaS tools
- Decision maker: Yes, P&L responsible

**Pain Points:**
1. OIOUBL/Peppol compliance deadline (2026) — time-sensitive regulatory pressure
2. High volume of client email inquiries about invoice status, contract terms
3. Document-heavy workflows (faktura, årsrapport, bogføring)

**Communication Patterns:**
- Primary: Email (Outlook), telephone
- Secondary: Fortnox portal, LinkedIn
- Tone: Formal, precise Danish — errors in contracts/factura are costly

**Willingness to Pay:** High (€200–500/month for firm-wide tool)
**Key Success Criteria:** Compliance help, time saved on client email responses, Danish language accuracy

**Interview Questions:**
- "How many client emails do you get per day about invoice status?"
- "What took most time this week that you wish you could automate?"
- "On a scale of 0-10, how likely to recommend a tool that saves you 2+ hours/week?"

---

### Persona 2: The Legal Practice Office Manager

**Profile:**
- Role: Office Manager / Partner, 5–20 employees, Copenhagen/Aarhus
- Age: 35–55
- Tech sophistication: Medium-high — practice management software, Microsoft 365
- Decision maker: Partner-level for tech investments

**Pain Points:**
1. Client correspondence precision — Danish legal language must be exact
2. High volume of contract review and drafting
3. Confidentiality concerns with AI tools (client privilege)

**Communication Patterns:**
- Primary: Email (Outlook), Teams, phone
- Secondary: Document management systems
- Tone: Very formal, precise legal Danish — mistakes have legal consequences

**Willingness to Pay:** High (€150–400/month for practice)
**Key Success Criteria:** Danish legal language precision, confidentiality guarantee, time saved on contract drafting

**Interview Questions:**
- "What percentage of your day goes to client communication vs. actual legal work?"
- "What would an AI tool need to do to earn your trust for client correspondence?"
- "Would you pay €X/month if it saved your paralegal 3 hours/week?"

---

### Persona 3: The Real Estate Agency Operations Lead

**Profile:**
- Role: Operations Manager / Owner, 5–15 employees, nationwide
- Age: 30–50
- Tech sophistication: Medium — property portals, email, some CRM
- Decision maker: Yes, often owner-operated

**Pain Points:**
1. High inquiry volume from property listings — rapid response needed
2. Property descriptions in Danish (requirements for listing portals)
3. Client follow-up across multiple properties and interested parties

**Communication Patterns:**
- Primary: Email, phone, Property24/Acquisition platform
- Secondary: WhatsApp, Facebook Messenger
- Tone: Professional but approachable Danish

**Willingness to Pay:** Medium-High (€100–250/month for team)
**Key Success Criteria:** Fast response time, accurate Danish property descriptions, multi-channel inbox management

**Interview Questions:**
- "How quickly do you need to respond to property inquiries to stay competitive?"
- "What would you delegate to AI if it was reliable?"
- "What's your biggest time drain in client communication?"

---

## 9. Immediate Actions (Post-MVP Launch)

| Action | Owner | Timing | Status |
|--------|-------|--------|--------|
| Create early user interview guide (operational script) | CMO | Week 1 post-launch | Pending |
| Set up feedback dashboard monitoring routine (weekly Monday 9am CET) | CMO | Before launch | Pending |
| Document first 3 user personas from market research | CMO | This week | **Done** |
| Fix `feedback_submitted` analytics event gap | Engineering | Before launch | Blocked |

---

## 10. Next Steps

- [x] **LEKAA-226**: Document first 3 user personas from market research (CMO — **DONE** — see Section 8 above)
- [ ] **LEKAA-224**: Create early user interview guide (CMO — Week 1 post-launch)
- [ ] **LEKAA-225**: Set up feedback dashboard monitoring routine (CMO — weekly)
- [ ] **Engineering**: Fix analytics_events gap for feedback tracking (blocker for complete metrics)

**LEKAA-223 Status:** Partial completion — persona documentation (LEKAA-226) is complete. Remaining: interview guide (LEKAA-224) and monitoring routine (LEKAA-225) depend on MVP launch.

---

*Document version: 1.2 | CMO: Leksikon.ai*  
*Updated: 2026-05-20*  
*Linked from: [LEKAA-223](/LEKAA/issues/LEKAA-223)*