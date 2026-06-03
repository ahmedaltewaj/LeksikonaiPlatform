# Weekly Feedback Digest — Email Specification

**Version**: 1.1
**Date**: 2026-05-08
**Status**: Approved — ready for engineering
**Owner**: CMO
**Issue**: [LEKAA-137](/LEKAA/issues/LEKAA-137)
**Review**: Approved by CEO 2026-05-08

---

## Purpose

The weekly feedback digest gives Leksikon.ai leadership a structured, actionable view of user sentiment each week. It aggregates raw feedback submissions into a concise report that surfaces critical issues and trends — without requiring recipients to dig into the database manually.

---

## Sending Schedule

| Property | Value |
|----------|-------|
| **Frequency** | Weekly, every Monday |
| **Time** | 9:00 AM CET |
| **Day zero** | Data from the preceding 7 days (Monday 00:00 → Sunday 23:59 UTC) |

**Recipients** (defined in LEKAA-137):
- Product Lead
- CMO (me)
- CEO

---

## Digest Contents

### Section 1 — Summary Stats (Last 7 Days)

| Metric | Description |
|--------|-------------|
| Total submissions | Count of all feedback records created in the week |
| Average rating | Mean of all `rating` values (1–10 scale) |
| NPS score | Mean of all `nps_score` values (0–10 scale), nulls excluded |
| Category breakdown | Count per category: Bug / Feature / UX / Pricing |
| Response rate | % of submissions that include a comment |

### Section 2 — New Feedback Items (Last 7 Days)

Table format, newest first:

| Submitted | Category | Rating | Comment Excerpt | Urgent? |
|-----------|----------|--------|-----------------|---------|
| Mon, May 4 | Bug | 2 | "AI responses are..." | ⚠️ Yes |
| Tue, May 5 | Feature | 8 | "Would be great to..." | No |

- **Comment excerpt**: First 120 characters of `comment_text`, truncated with ellipsis if longer.
- **Urgent flag**: `rating ≤ 3` → "⚠️ Yes" in the Urgent column. All others "No".

### Section 3 — Auto-Escalation Items

Any feedback where `rating ≤ 3` is listed in this section with:
- Full `comment_text` (not truncated)
- `page_url` and `metadata` (browser/OS) for debugging UX issues
- `category` label (so the right person handles it — bugs → engineering, UX → design, etc.)

---

## Email Design

### Visual Style

Follows existing Leksikon.ai brand:
- **Primary**: Deep Navy (`#1E3A5F`)
- **Action**: Sky Blue (`#38BDF8`)
- **Background**: White (`#FFFFFF`)
- **Text**: Near-black (`#1F2937`)
- **Urgent accent**: Red (`#DC2626`)

### Layout

```
[Leksikon.ai Logo]  Weekly Feedback Digest | Mon 5 May 2026

─────────────────────────────────────────────
SUMMARY STATS
├── 12 submissions (↑ 3 vs prior week)
├── Avg rating: 7.4
├── NPS: 42
├── Categories: Bug (2) | Feature (5) | UX (3) | Pricing (2)
└── 67% included a comment
─────────────────────────────────────────────
NEW ITEMS
[Table: Submitted | Category | Rating | Excerpt | Urgent]
─────────────────────────────────────────────
ACTION REQUIRED (2 items)
[Card per urgent item with full details]
─────────────────────────────────────────────
Sent by Leksikon.ai · Feedback system · Manage digest preferences
```

### Responsive Design

- Desktop: Full-width table, stats in 4-column grid
- Mobile: Single-column stack, table becomes card list
- Tested clients: Gmail (web + mobile), Outlook (Windows + Mac), Apple Mail

---

## Technical Implementation

### Recommended: Supabase Edge Function + Cron

Per the existing tech stack (Supabase Edge Functions for email), this is the preferred implementation:

1. **Cron trigger**: Supabase pg_cron or Edge Function scheduler, every Monday 08:00 UTC (9:00 AM CET)
2. **Query**: Aggregate `feedback` table for date range, compute stats
3. **Render**: HTML email from template
4. **Send**: Use Supabase Edge Functions with an email provider (Postmark recommended for transactional reliability)

### Alternative: External Email Service (Postmark / Loops)

If engineering prefers a managed email API:
- **Postmark**: Transactional email, high deliverability, clean API
- **Loops**: Alternative, simpler onboarding

Both support:
- Scheduled sends (cron → webhook → provider API)
- HTML email templates with merge tags
- Delivery analytics (open rate, bounce rate)

---

## Email Template (HTML)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Feedback Digest | Leksikon.ai</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #1E3A5F; color: #FFFFFF; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 4px 0 0; opacity: 0.8; font-size: 14px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB; }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1E3A5F; }
    .stat-label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .section { padding: 24px; border-bottom: 1px solid #E5E7EB; }
    .section-title { font-size: 14px; font-weight: 600; color: #1E3A5F; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 8px 12px; background: #F3F4F6; color: #6B7280; font-weight: 500; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .badge-bug { background: #FEE2E2; color: #991B1B; }
    .badge-feature { background: #DBEAFE; color: #1E40AF; }
    .badge-ux { background: #F3E8FF; color: #6B21A8; }
    .badge-pricing { background: #FEF3C7; color: #92400E; }
    .urgent-row { background: #FEF2F2; }
    .urgent-badge { color: #DC2626; font-weight: 700; }
    .escalation-card { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .escalation-card:last-child { margin-bottom: 0; }
    .escalation-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .escalation-title { font-weight: 600; color: #991B1B; font-size: 14px; }
    .escalation-meta { font-size: 12px; color: #6B7280; }
    .escalation-comment { font-size: 14px; color: #1F2937; margin: 0; line-height: 1.5; }
    .footer { padding: 16px 24px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Feedback Digest</h1>
      <p>Monday, 5 May 2026 · Leksikon.ai</p>
    </div>

    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">12</div>
        <div class="stat-label">Submissions</div>
      </div>
      <div class="stat">
        <div class="stat-value">7.4</div>
        <div class="stat-label">Avg Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value">42</div>
        <div class="stat-label">NPS</div>
      </div>
      <div class="stat">
        <div class="stat-value">67%</div>
        <div class="stat-label">Response Rate</div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">New Items</h2>
      <table>
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Comment</th>
            <th>Urgent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mon, May 4</td>
            <td><span class="badge badge-bug">Bug</span></td>
            <td>2</td>
            <td>AI responses are truncating long inquiries...</td>
            <td class="urgent-badge">⚠️ Yes</td>
          </tr>
          <tr>
            <td>Tue, May 5</td>
            <td><span class="badge badge-feature">Feature</span></td>
            <td>8</td>
            <td>Would be great to have a mobile app...</td>
            <td>No</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">Action Required</h2>
      <div class="escalation-card">
        <div class="escalation-header">
          <span class="escalation-title">⚠️ Urgent: Rating = 2</span>
          <span class="escalation-meta">Bug · Submitted Mon 4 May</span>
        </div>
        <p class="escalation-comment">"AI responses are truncating long inquiries. When a customer writes more than ~500 words, the response gets cut off mid-sentence. This has happened 3 times this week."</p>
        <p class="escalation-meta">Page: /dashboard/inquiries · Browser: Chrome 122 / macOS</p>
      </div>
    </div>

    <div class="footer">
      Sent by Leksikon.ai · Feedback system · <a href="#">Manage digest preferences</a>
    </div>
  </div>
</body>
</html>
```

---

## Open Questions for Engineering — RESOLVED

| # | Question | Decision |
|---|----------|----------|
| 1 | Email provider | **Postmark** — transactional, high deliverability, fits existing stack |
| 2 | Cron mechanism | **pg_cron** — already in stack, reliable |
| 3 | Recipient management | **`digest_recipients` config table** — supports future growth, easy additions |
| 4 | Unsubscribe/preferences | **All-or-nothing for MVP** — per-recipient prefs deferred to v2 |

---

## Dependencies

- [LEKAA-134](/LEKAA/issues/LEKAA-134) (feedback data model + Supabase table) — **COMPLETE** ✓
- [LEKAA-135](/LEKAA/issues/LEKAA-135) (feedback UI) — independent of digest, can run in parallel

---

* CMO | Leksikon.ai | 2026-05-08