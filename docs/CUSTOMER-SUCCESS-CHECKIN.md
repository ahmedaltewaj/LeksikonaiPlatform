# Customer Success Check-in Process

**Issue**: [LEKAA-99](http://127.0.0.1:3100/LEKAA/issues/LEKAA-99)  
**Owner**: CMO  
**Date**: 2026-05-12  
**Status**: Active

---

## Overview

Systematic early user check-ins to gather testimonials, measure satisfaction, and validate product-market fit. Part of Phase 3.1 (Early Users Onboarded).

## Check-in Cadence

| Milestone | Timing | Purpose |
|-----------|--------|---------|
| Welcome Check-in | Day 3 after signup | Ensure onboarding success, answer initial questions |
| 1-Week Check-in | Day 7 | First pulse on usage, initial NPS |
| 1-Month Check-in | Day 30 | Deep usage review, testimonial request |
| Quarterly Review | Day 90+ | Ongoing relationship, expansion opportunities |

## Email Templates

### 1. Welcome Check-in (Day 3)

**Subject**: How's Day 1 looking? Quick question from Leksikon.ai

**Body**:
```
Hej [Name],

This is [Sender] from Leksikon.ai — hope your first few days have been smooth!

Quick question: Did you manage to connect your first inquiry source (email/website form)? 

If you're still getting set up or have questions, I'm here to help. Just reply to this email and I'll respond personally.

Best,
[Sender]
Leksikon.ai
```

### 2. 1-Week Check-in (Day 7)

**Subject**: One week with Leksikon.ai — how's it going?

**Body**:
```
Hej [Name],

It's been a week since you started with Leksikon.ai. I'd love to hear how it's going!

Specifically:
- How many inquiries have you processed?
- Has the AI response quality been helpful?
- Any friction points I should know about?

Also, I'm including a super-quick NPS survey (30 seconds, 1 question):

**On a scale of 0-10, how likely are you to recommend Leksikon.ai to a fellow Danish SME owner?**

Just reply with your number — that's it!

And if you're open to it, I'd love to feature your story as a customer testimonial (with your permission, of course).

Best,
[Sender]
Leksikon.ai
```

### 3. 1-Month Check-in (Day 30)

**Subject**: One month milestone — let's check in

**Body**:
```
Hej [Name],

It's been a month! Congratulations on making Leksikon.ai part of your workflow.

I'd love to do a 15-minute call to hear about your experience. This helps us improve and — with your permission — I'd love to share your story to help other Danish SMEs discover us.

**Quick feedback request:**

1. **NPS score** (0-10): How likely to recommend Leksikon.ai?
2. **Testimonial**: Any quotes about your experience? (We'll send a consent form)
3. **Product feedback**: What's working well? What could be better?

If you're up for a call, just reply with a time that works for you this week.

Best,
[Sender]
Leksikon.ai
```

### 4. Quarterly Review (Day 90+)

**Subject**: Quarter check-in — Leksikon.ai insights

**Body**:
```
Hej [Name],

Time for your quarterly Leksikon.ai review! 

Here's what we've improved in the past quarter:
- [Feature updates from changelog]

And we'd love your feedback:
- How has your inquiry volume changed?
- What features would make this even more valuable?
- NPS score still holding strong?

Looking forward to hearing from you!

Best,
[Sender]
Leksikon.ai
```

## NPS Tracking

### Survey Mechanics

- **Method**: Single-question email survey embedded in check-in templates
- **Scale**: 0-10 (standard NPS)
- **Tracking**: Log NPS scores in user metadata table
- **Segments**:
  - Promoters (9-10): Ask for referral, testimonial
  - Passives (7-8): Nurture sequence
  - Detractors (0-6): Personal follow-up, recovery outreach

### NPS Score Recording

Add to user profile in Supabase:
```sql
ALTER TABLE users ADD COLUMN nps_score INTEGER;
ALTER TABLE users ADD COLUMN nps_recorded_at TIMESTAMP;
ALTER TABLE users ADD COLUMN nps_source VARCHAR(50); -- 'week1', 'month1', 'quarterly'
```

### NPS Response Handling

| Score | Action | Owner |
|-------|--------|-------|
| 9-10 | Thank you + testimonial request | Auto |
| 7-8 | Thank you + product feedback request | Auto |
| 0-6 | Personal reply within 24 hours | CMO |
| No response | Follow-up in 3 days | Auto |

## Testimonial Collection

### Process

1. **Ask permission** in 1-week check-in
2. **Capture** verbatim quotes from email reply or call
3. **Store** in `testimonials` table:

```sql
CREATE TABLE testimonials (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  quote TEXT NOT NULL,
  source VARCHAR(50), -- 'email', 'call', 'interview'
  permission_status VARCHAR(20), -- 'pending', 'approved', 'denied'
  approved_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Permission Workflow

1. User agrees → Send consent form via email
2. User approves → Store testimonial
3. User denies → Mark `permission_status: denied`, do not use

### Testimonial Usage Guidelines

- **On website**: With link to user's business (if applicable)
- **In pitch decks**: Anonymized or named based on permission
- **In ads**: Full consent required for any paid use

## Metrics to Track

| Metric | Target | Tracking |
|--------|--------|----------|
| Check-in email open rate | 60%+ | Email platform analytics |
| Check-in email response rate | 30%+ | Reply tracking |
| NPS Week 1 | 30+ | Survey responses |
| NPS Month 1 | 40+ | Survey responses |
| Testimonials collected | 1 per 10 users | Testimonials table |
| Detractor recovery rate | 50%+ | Follow-up tracking |

## Tools & Automation

### Email Automation (Phase 1 - Manual)

For MVP, use manual sends with email templates above. Track responses in a simple spreadsheet until automation is built.

### Email Automation (Phase 2 - Automated)

When email automation is implemented:
- Trigger: User signup date + cadence milestones
- Personalize: [Name], [Company], [Days since signup]
- Track: Opens, clicks, replies

### Supabase Schema for Check-in Tracking

```sql
-- Check-in log
CREATE TABLE checkin_log (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  checkin_type VARCHAR(20), -- 'welcome', 'week1', 'month1', 'quarterly'
  sent_at TIMESTAMP,
  responded_at TIMESTAMP,
  nps_score INTEGER,
  notes TEXT
);
```

## Next Steps

- [ ] Implement `checkin_log` and `testimonials` tables in Supabase
- [ ] Create consent form for testimonial usage
- [ ] Set up email sequence automation (or manual send process)
- [ ] Dashboard for NPS tracking (Phase 2)

---

*Document version: 1.0 | CMO | 2026-05-12*
