# MVP Feature Set & User Stories — Leksikon.ai

**Issue**: [LEKAA-284](/LEKAA/issues/LEKAA-284)
**Author**: CTO
**Date**: 2026-06-03
**Status**: Complete

---

## Executive Summary

Leksikon.ai MVP is an **AI Customer Response Assistant** — a web-based tool that helps Danish SME owners respond to customer inquiries faster using AI-generated Danish-language drafts.

**Core Value Proposition**: SME owners receive AI-drafted responses to customer inquiries in under 2 minutes, review with one click, and send — dramatically reducing time spent on routine customer communication.

---

## User Personas

### Persona 1: The Overwhelmed Small Business Owner
- **Name**: Henrik, 48
- **Role**: Owner of a 5-person HVAC repair company in Copenhagen
- **Pain**: Receives 15-20 customer emails daily about quotes, service questions, bookings. Spending 2-3 hours/day writing responses.
- **Goal**: Respond quickly and professionally without sacrificing business growth time
- **Tech comfort**: Moderate. Uses email and Facebook. Has not adopted complex CRM tools.
- **Danish language**: Native, expects Danish-language AI responses

### Persona 2: The Solo Consultant
- **Name**: Line, 34
- **Role**: Freelance HR consultant with 30+ active clients
- **Pain**: Customer inquiries come via email and website form at unpredictable times. Often misses responses when busy with client work.
- **Goal**: Never miss an inquiry, respond within hours not days
- **Tech comfort**: High. Uses Google Workspace, Asana, invoicing software.
- **Danish language**: Native

### Persona 3: The Retail Shop Manager
- **Name**: Mads, 52
- **Role**: Manager of a local bookstore in Aarhus, 3 full-time + 2 part-time staff
- **Pain**: Handles customer emails about book availability, special orders, events. Team shares inbox but responses are inconsistent.
- **Goal**: Consistent, professional responses that reflect the store's brand
- **Tech comfort**: Low. Basic email only.
- **Danish language**: Native

---

## Jobs-to-Be-Done (JTBD)

| # | Job-to-be-Done | Persona | Frequency |
|---|----------------|---------|-----------|
| 1 | As a SME owner, I want to see all customer inquiries in one place so I don't miss any | All | Daily |
| 2 | As a SME owner, I want AI-generated response drafts in Danish so I don't spend time writing from scratch | All | Per inquiry |
| 3 | As a SME owner, I want to approve/edit/send a response in under 2 minutes so it fits into my busy schedule | All | Per inquiry |
| 4 | As a SME owner, I want to see basic stats (inquiry volume, approval rate) so I understand my communication patterns | All | Weekly |
| 5 | As a SME owner, I want my email/webhook to automatically create inquiries so I don't manual-enter anything | All | Setup once |

---

## Top 5 User Stories (MVP Scope)

### Story 1: Inquiry Ingestion
**Rank**: 1 (Foundation — all other stories depend on this)

> **As a** SME owner
> **I want** my inbound emails and web form submissions to automatically appear as inquiries in my dashboard
> **So that** I don't miss any customer message and don't have to manually enter anything

**Acceptance Criteria**:
- [ ] Email webhook receives inbound emails and creates inquiry record with sender email, subject, body
- [ ] Web form webhook receives form submissions and creates inquiry record
- [ ] All inquiries appear in dashboard inbox within 30 seconds of receipt
- [ ] Inquiry status starts as "pending" (awaiting review)
- [ ] Duplicate emails (same message-ID) are rejected gracefully

**MVP vs Post-Launch**: MVP scope — this is the foundation

---

### Story 2: AI Response Generation
**Rank**: 2 (Core differentiator)

> **As a** SME owner
> **I want** the system to generate a Danish-language response draft for each inquiry
> **So that** I can review a professional response instead of writing from scratch

**Acceptance Criteria**:
- [ ] "Generate Response" button appears on each pending inquiry
- [ ] Clicking generates an AI response using Gemini 2.0 Flash
- [ ] Response is generated in Danish with appropriate formality level
- [ ] Response appears within 10 seconds (loading state shown)
- [ ] If generation fails, user sees clear error message with retry option
- [ ] Response is stored as "draft" status

**MVP vs Post-Launch**: MVP scope — this is the core value

---

### Story 3: Response Review & Send
**Rank**: 3 (Core workflow)

> **As a** SME owner
> **I want** to review the AI draft, edit if needed, and send with one click
> **So that** I can respond to customers in under 2 minutes total

**Acceptance Criteria**:
- [ ] User sees AI-generated response text in review interface
- [ ] User can: (a) Approve as-is, (b) Edit text, (c) Reject/Archive
- [ ] "Approve & Send" sends response to customer email and marks as "sent"
- [ ] "Edit & Send" saves edited text, sends to customer, marks as "edited"
- [ ] "Reject" archives the inquiry without sending
- [ ] Sent response goes to actual customer email address
- [ ] Full history of all responses is preserved with timestamps

**MVP vs Post-Launch**: MVP scope — this is the core workflow

---

### Story 4: Simple Dashboard
**Rank**: 4 (Usability)

> **As a** SME owner
> **I want** to see my inquiry inbox, pending reviews, and basic stats on one screen
> **So that** I can quickly understand my current workload

**Acceptance Criteria**:
- [ ] Dashboard shows: total inquiries, pending reviews, sent this week
- [ ] Inquiry list shows: sender name/email, subject, status, timestamp
- [ ] Clicking an inquiry opens the full conversation + response review
- [ ] Dashboard loads in under 3 seconds
- [ ] Mobile-responsive (works on phone and tablet)
- [ ] No complex navigation — everything accessible from dashboard

**MVP vs Post-Launch**: MVP scope — usability is critical for adoption

---

### Story 5: Email Integration Setup
**Rank**: 5 (Activation)

> **As a** SME owner
> **I want** to connect my existing email (forwarding or webhook) in under 10 minutes
> **So that** I can start receiving inquiries immediately

**Acceptance Criteria**:
- [ ] Setup wizard guides user through email integration
- [ ] Supports common email providers via forwarding or webhook
- [ ] Test button verifies connection before saving
- [ ] User can change email settings later from dashboard settings
- [ ] Onboarding email confirms setup is complete

**MVP vs Post-Launch**: MVP scope — must be able to receive inquiries to validate product

---

## Post-Launch Features (Not MVP)

These features are valuable but not required to validate the core hypothesis:

| Feature | Rationale for Deferral |
|---------|----------------------|
| Team collaboration (multiple users per account) | MVP is single-owner focused; validate one-user model first |
| Advanced analytics / trends | Basic counts are enough for MVP; full analytics after PMF |
| Mobile native app | Web app is mobile-responsive; native adds complexity |
| Response templates / customization | Can add after seeing what users want customized |
| Automated follow-ups / sequences | Manual send is MVP scope; automation is v2 |
| CRM integration | Not needed to validate core value prop |
| Multi-language support | Danish-only MVP to minimize scope |
| Bulk actions / batch processing | Individual inquiry flow is fine for MVP volume |
| Zapier/Make integrations | Direct integrations only; webhook is v2 |

---

## MVP Scope Boundary

### In Scope (MVP)
1. ✅ User authentication (email/password)
2. ✅ Email webhook for inquiry ingestion
3. ✅ Web form webhook for inquiry ingestion
4. ✅ Gemini AI response generation (Danish)
5. ✅ Response review interface (approve/edit/reject/send)
6. ✅ Dashboard with inquiry inbox + stats
7. ✅ Email delivery of approved responses
8. ✅ Basic analytics (inquiry count, approval rate)

### Out of Scope (Post-Launch)
- ❌ Team/collaborative features
- ❌ Payment processing (can be added post-PMF)
- ❌ Mobile native app
- ❌ Advanced integrations (CRM, Zapier)
- ❌ Response templates/brand guidelines
- ❌ Multi-language beyond Danish

---

## Success Criteria

For MVP to be considered successful:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to respond | < 2 min/inquiry | User feedback + analytics |
| AI approval rate | > 70% without edit | Response status tracking |
| Danish language quality | "Natural and professional" | User feedback (NPS) |
| Setup completion rate | > 80% complete email setup | Onboarding funnel |
| Active usage | > 50% of users respond within 24h | Dashboard analytics |

---

## Technical Constraints

- **Single-user per account**: No team features in MVP
- **Danish language only**: Gemini configured for Danish output
- **Email-based ingestion**: Webhook must receive emails, not just forms
- **Manual send**: User approves each response before sending (no fully automated mode)
- **No payment at MVP**: Free tier for initial validation

---

*Document version: 1.0 | CTO: Leksikon.ai*