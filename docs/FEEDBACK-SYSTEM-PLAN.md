# Plan: User Feedback Collection System (LEKAA-98)

## Goal

Build a system to collect, categorize, and track user feedback from early users to inform product iteration and measure satisfaction.

---

## Research & Design

### 1. Feedback Categories (CMS Branding)

From market analysis and user persona research:

| Category | Label | Description | Priority Signal |
|----------|-------|-------------|-----------------|
| Bug | `bug` | Something doesn't work | Urgent |
| Feature Request | `feature` | Missing functionality | Roadmap |
| UX Issue | `ux` | Hard to use or confusing | Important |
| Pricing | `pricing` | Cost concerns or value questions | Business |

### 2. Feedback Rating Scale

- **1-3**: Dissatisfied (red)
- **4-6**: Neutral (amber)
- **7-10**: Satisfied (green)

Also collect optional NPS-style single question: "How likely are you to recommend Leksikon.ai to a colleague?" (0-10 scale)

### 3. User Context Captured

- User ID + email (from session)
- Timestamp (automatic)
- Current page URL (context)
- Browser/OS (for debugging UX issues)

---

## Data Model

### Feedback Table (Supabase)

```
feedback
├── id (uuid, primary key)
├── user_id (fk → users)
├── category (enum: bug | feature | ux | pricing)
├── rating (1-10 integer)
├── nps_score (0-10 integer, nullable)
├── comment_text (text, nullable)
├── page_url (text)
├── metadata (jsonb: browser, OS, timestamp)
├── status (enum: new | reviewed | addressed | dismissed)
├── created_at (timestamp)
└── reviewed_at (timestamp, nullable)
```

---

## UI Specification

### Feedback Trigger

- Floating button (bottom-right corner)
- Icon: chat bubble or thumbs up
- Appears after user completes first inquiry workflow
- Design follows existing brand (Deep Navy primary, Sky Blue actions)

### Feedback Form (Modal Overlay)

1. **Rating**: 5-star or 0-10 slider
2. **Category**: 4-button toggle (Bug / Feature / UX / Pricing)
3. **Comment**: Optional textarea (max 500 chars)
4. **NPS Question**: "How likely to recommend?" 0-10 scale (optional)
5. **Submit**: Primary button "Send Feedback"

### Post-Submission

- Toast notification: "Thanks for your feedback!"
- Auto-dismiss modal after 2s

---

## Weekly Digest

### Format

Email sent every Monday at 9:00 AM CET to:
- Product Lead
- CMO (me)
- CEO (optional)

### Digest Content

1. **Summary Stats** (last 7 days)
   - Total feedback submissions
   - Average rating
   - NPS score
   - Category breakdown

2. **New Items** (last 7 days)
   - List of feedback with category + rating + comment excerpt

3. **Action Items**
   - Any feedback marked `new` with rating ≤ 3 auto-escalated
   - Bugs auto-assigned to engineering

### Implementation

- Supabase Edge Function + cron trigger
- Or external email service (Postmark or Loops)

---

## Implementation Tasks

Child issues created for engineering:

| Issue | Task | Priority |
|-------|------|----------|
| LEKAA-99 | Implement feedback data model + Supabase table | High |
| LEKAA-100 | Build feedback UI component (button + modal) | High |
| LEKAA-101 | Create feedback submission API route | High |
| LEKAA-102 | Build weekly digest email system | Medium |

---

## Success Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Feedback submissions / week | 5+ | From 10 early users |
| Average rating | 7+ | Indicates satisfaction |
| NPS | 30+ | Matches Phase 1 target |
| Bug response time | <48h | Escalation from rating ≤3 |

---

*Plan v1.0 | CMO | 2026-05-08*