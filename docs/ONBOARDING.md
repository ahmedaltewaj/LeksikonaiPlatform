# Early User Onboarding Plan — Leksikon.ai

**Version**: 1.0  
**Date**: 2026-04-27  
**Owner**: CMO  
**Status**: Draft — Pending MVP feature completion  
**Issue**: [LEKAA-26](/LEKAA/issues/LEKAA-26)

---

## Executive Summary

This document defines the onboarding strategy for Leksikon.ai's MVP early user cohort (10+ Danish SME users). The goal is to minimize friction, demonstrate value within 15 minutes, and convert curious sign-ups into activated, regular users.

**Guiding Principle**: Danish SME owners are time-poor and skeptical of new software. Onboarding must prove ROI in the first session, not after hours of setup.

---

## Target User Personas for Early Adopters

### Primary Persona: "The Time-Pressed Practitioner"

| Attribute | Description |
|-----------|-------------|
| **Role** | Solo practitioner or small firm owner (accountant, lawyer, consultant) |
| **Age** | 40-60 |
| **Tech comfort** | Moderate — uses email, accounting software, NemID — not early adopter |
| **Pain point** | Drowning in repetitive customer emails; language barrier when responding to non-Danish speakers |
| **Motivation** | Save 30-60 minutes/day on routine responses; look professional |
| **Objection** | "This will take too long to set up" or "My customers need personal touch" |
| **Success trigger** | First AI-assisted response sent to a real customer within 20 minutes of signup |

### Secondary Persona: "The Efficiency-Seeking SME"

| Attribute | Description |
|-----------|-------------|
| **Role** | Small business owner with 2-10 employees |
| **Age** | 35-55 |
| **Tech comfort** | Comfortable — uses cloud software, smartphones, Teams |
| **Pain point** | Customer inquiry overload during peak periods; inconsistent response quality |
| **Motivation** | Handle inquiry spikes without hiring; maintain response quality |
| **Objection** | "Will this work for my specific business?" or "What if AI makes mistakes?" |
| **Success trigger** | First week: 5+ inquiries processed, 80%+ AI approval rate |

### Early Adopter Segment (Priority Order)

1. **Accountants and auditors** — High email volume, clear ROI case, motivated by OIOUBL/Peppol 2026 compliance
2. **Legal practitioners** — Document precision critical, Danish language essential
3. **Consulting/professional services** — Knowledge work, varied customer communication
4. **Real estate agencies** — High inquiry volume during listings

---

## Step-by-Step Activation Sequence

### Day 0: Registration (Target: <5 minutes)

| Step | Action | Location | Time Target |
|------|--------|----------|-------------|
| 0.1 | Land on landing page with clear value prop | `/` | — |
| 0.2 | Click "Start Free" or "Prøv Gratis" | CTA button | — |
| 0.3 | Enter email + password (or continue with existing credentials) | `/auth/signup` | 2 min |
| 0.4 | Verify email (auto-sent) | Email inbox | 1 min |
| 0.5 | Complete company profile | `/onboarding/profile` | 2 min |

**Setup Wizard Requirements** (see Setup Wizard section below)

### Day 0: First Inquiry Connection (Target: <10 minutes)

| Step | Action | Location | Time Target |
|------|--------|----------|-------------|
| 1.1 | Connect email inbox OR set up web form | `/onboarding/connect` | 5 min |
| 1.2 | Configure sender identity (name, company, reply-to) | `/settings/identity` | 2 min |
| 1.3 | Receive test inquiry OR send test email to webhook | App + email | 3 min |
| 1.4 | Confirm green "Connected" status | Dashboard | 1 min |

### Day 0: First AI Response (Target: <15 minutes total)

| Step | Action | Location | Time Target |
|------|--------|----------|-------------|
| 2.1 | View pending inquiry in dashboard | `/dashboard` | — |
| 2.2 | Click "Generate Response" | Inquiry detail page | 30 sec |
| 2.3 | Review AI-generated Danish response | Response preview | 2 min |
| 2.4 | Click "Approve & Send" (or edit first) | Response preview | 1 min |
| 2.5 | Confirm sent — see success state | Confirmation toast | — |

**Time-to-Value Milestone**: User has successfully sent an AI-assisted customer response within 15 minutes of starting registration.

---

## Time-to-Value Milestones

| Milestone | Target Time | Definition | Success Indicator |
|-----------|-------------|------------|-------------------|
| **Signed up** | 0 min | Registration complete, email verified | User in database |
| **Connected** | <15 min | Email inbox or web form linked | First inquiry received |
| **First response sent** | <20 min | AI-generated response approved and delivered | Customer receives reply |
| **First hour active** | <60 min | 3+ inquiries processed | Dashboard shows activity |
| **First day** | <24 hrs | 5+ inquiries processed, 1+ approved | DAU +1 |
| **First week** | <7 days | 10+ inquiries, 80%+ approval rate | Cohort retention |

---

## Touchpoint Plan

### Email Sequence

| Day | Email | Subject (DK) | Purpose | CTA |
|-----|-------|--------------|---------|-----|
| **Day 0** | Welcome | "Velkommen til Leksikon.ai — din nye AI-assistent" | Acknowledge signup, guide to complete setup | "Kom i gang" → Setup wizard |
| **Day 0** | Setup complete | "Din første AI-respons er klar" | Celebrate first connection, prompt to try | "Se din respons" → Dashboard |
| **Day 1** | Tip #1 | "3 tips til bedre AI-respons" | Educational, increase engagement | "Læs tips" → Help docs |
| **Day 3** | Check-in | "Hvordan klarer du dig?" | Gather feedback, offer help | "Del feedback" → Survey |
| **Day 7** | Week one | "Din første uge med AI" | Show usage stats, suggest next steps | "Se statistik" → Dashboard |
| **Day 14** | Activation | "Du er nu en pro — udvid dit setup" | Prompt to add more users/features | "Udforsk funktioner" → Settings |
| **Day 30** | NPS | "Hvor sandsynligt er det, at du vil anbefale os?" | Measure satisfaction, collect testimonial | 1-click NPS |

### In-App Touchpoints

| Moment | Trigger | Message | Action |
|--------|---------|---------|--------|
| **Post-signup** | First login | "Velkommen! Lad os forbinde din indbakke." | Guide to email setup wizard |
| **Email connected** | First inquiry received | "Din første forespørgsel er klar" | Show new inquiry badge |
| **First approval** | User clicks Approve | "Perfekt! Responsen er sendt." | Celebrate with micro-animation |
| **First edit** | User edits AI response | "God fornemmelse — dit touch gør det personligt." | Encourage personalization |
| **Streak** | 3 days active | "Du er på rette vej — 3 dage i træk!" | Encourage continued use |
| **Churn risk** | No login for 5 days | "Vi savner dig! Hvad kan vi hjælpe med?" | Offer support link |

---

## Success Criteria for "Activated" User

A user is considered **activated** when ALL of the following are true:

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| **Setup complete** | Email/webhook connected | `onboarding_completed = true` in user profile |
| **First inquiry processed** | ≥1 AI response approved and sent | `responses_sent ≥ 1` |
| **Active in first week** | Logged in 3+ days in week 1 | DAU tracking |
| **Positive signal** | No uninstall/deactivation feedback | Support ticket sentiment |

### Activation Funnel Targets

```
Signups → Email Verified → Onboarding Started → Onboarding Completed → First Response Sent → Activated
   100%          70%                50%                  35%                  25%              20%
```

**Target**: 20% of signups reach "activated" status within 7 days.

---

## Setup Wizard Requirements

The setup wizard (`/onboarding/*`) must cover these steps in order:

### Step 1: Company Profile (2 min)
**Route**: `/onboarding/profile`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Company name | text | Yes | Min 2 chars |
| Industry | select | Yes | Options: Accounting, Legal, Real Estate, Consulting, Other |
| Company size | select | Yes | Options: Solo, 2-5, 6-10, 10+ |
| Primary language | select | Yes | Default: Danish |
| Your name | text | Yes | For signature |
| Your role | text | No | For personalization |

### Step 2: Connect Inbox (5 min)
**Route**: `/onboarding/connect`

Two options presented side-by-side:

**Option A: Email Integration**
| Field | Type | Required |
|-------|------|----------|
| Email provider | select | Yes |
| Connect button | OAuth/IMAP | — |

Supported: Gmail, Outlook, IMAP generic

**Option B: Web Form**
| Field | Type | Required |
|-------|------|----------|
| Form embed code | textarea | Yes |
| Test submission | button | — |

### Step 3: Configure Identity (2 min)
**Route**: `/onboarding/identity`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Sender name | text | Yes | Min 2 chars |
| Sender email | text | Yes | Valid email format |
| Reply-to | text | Yes | Valid email format |
| Signature style | select | Yes | Options: Formal, Casual, Minimal |
| Auto-include signature | toggle | Yes | Default: On |

### Step 4: First Inquiry Test (3 min)
**Route**: `/onboarding/test`

- Send test email to webhook OR
- Submit test web form
- Confirm inquiry appears in dashboard
- Prompt: "Din forbindelse virker! Lad os prøve din første AI-respons."

### Step 5: Success State
**Route**: `/onboarding/success`

- Celebration UI (confetti or checkmark animation)
- Summary: "Du er klar til at spare tid på kundesvar"
- Primary CTA: "Gå til dashboard" → `/dashboard`
- Secondary: "Læs vores tips" → Help docs

---

## Setup Wizard UI Requirements

### Design Compliance
- Follow existing design system (DESIGN-SYSTEM.md)
- Colors: Primary (#3b82f6), Navy headers (#1a365d), White backgrounds
- Typography: Inter font family, spacing scale 4px base
- Border radius: 8px (rounded), 12px (rounded-lg)
- Shadow: shadow-sm for cards, shadow-md for elevated

### UX Principles
1. **Progress visible** — Step indicator at top (Step 1 of 4)
2. **One focus per step** — Don't overwhelm with options
3. **Skip available** — Allow users to skip optional steps
4. **Auto-save** — Never lose entered data
5. **Mobile responsive** — Must work on phone browsers (owner checking on mobile)
6. **Danish language only** — All copy in Danish, no English toggle

### Empty States
- No inquiries yet: Illustration + "Ingen forespørgsler endnu" + explanation of next step
- Loading: Skeleton loaders matching content shape
- Error: Red border + clear message in Danish + "Prøv igen" button

### Micro-copy Examples

| Context | Danish Copy |
|---------|-------------|
| Welcome | "Velkommen! Det tager kun 10 minutter at komme i gang." |
| Step 1 intro | "Lad os starte med at lære din virksomhed at kende" |
| Required field | "Skal udfyldes" (on validation error) |
| Success | "Perfekt! ✓" |
| Error | "Noget gik galt — prøv igen" |
| Skip option | "Spring dette over for nu" |
| Continue | "Næste" |
| Back | "Tilbage" |
| Complete | "Færdig" |

---

## Onboarding Email Templates (Draft)

### Day 0 — Welcome Email

```
Emne: Velkommen til Leksikon.ai — din nye AI-assistent

Hej [Fornavn],

Tak fordi du har tilmeldt dig Leksikon.ai!

Du er nu klar til at automatisere dine kundesvar og spare tid hver dag.

Det tager kun 10 minutter at komme i gang:

1. Fortæl os om din virksomhed (2 min)
2. Forbind din indbakke (5 min)
3. Send din første AI-respons (3 min)

→ [Kom i gang nu] (CTA button)

Med venlig hilsen,
Leksikon.ai teamet

---
Modtaget denne mail ved en fejl? [Afmeld]
```

### Day 0 — Setup Complete

```
Emne: Din første AI-respons er klar

Hej [Fornavn],

Tillykke! Du har forbundet din indbakke til Leksikon.ai.

Vi har modtaget din første forespørgsel fra [Afsender] og genereret et AI-svar klar til din godkendelse.

→ [Se din respons] (CTA button)

Husk: Du godkender altid hvert svar, før det sendes. Så du har fuld kontrol.

Med venlig hilsen,
Leksikon.ai teamet
```

### Day 3 — Check-in

```
Emne: Hvordan klarer du dig?

Hej [Fornavn],

Hvordan har de første dage med Leksikon.ai været?

Vi vil gerne høre, hvad der virker godt — og hvad vi kan gøre bedre.

[Del dine tanker] (CTA → 2-question survey)
[Se dit dashboard] (CTA → /dashboard)

Uden din feedback kan vi ikke forbedre os.

Med venlig hilsen,
Leksikon.ai teamet
```

---

## Success Metrics for Onboarding

| Metric | Target | Measurement |
|--------|--------|-------------|
| Registration completion rate | >60% | Started signup / completed |
| Email verification rate | >80% | Signed up / verified |
| Onboarding completion rate | >50% | Started / finished setup wizard |
| Time to first response | <20 min | First inquiry → first sent response |
| Activation rate (7-day) | >20% | Signed up / activated |
| Day 1 retention | >50% | Returned next day |
| Day 7 retention | >30% | Returned within 7 days |

---

## Open Questions / Dependencies

1. **LEKAA-11** (MVP feature implementation) must be complete before onboarding can begin
2. Email service provider (Postmark/SendGrid) webhook must be configured
3. Test inquiry generation process needs to be defined by engineering
4. NPS survey tool selection (Typeform, custom, or in-app)

---

## Next Steps

| Action | Owner | Status |
|--------|-------|--------|
| Finalize onboarding document | CMO | Draft — this doc |
| Review with CEO | CEO | Pending |
| Implement setup wizard | Engineer | Blocked on LEKAA-11 |
| Create email templates | CMO | Pending |
| Configure email automation | Engineer/CTO | Pending |
| Test full flow end-to-end | Full team | Blocked on MVP |

---

*Document version: 1.0 | Created: 2026-04-27 | CMO: Leksikon.ai*
