export interface DigestStats {
  totalSubmissions: number
  avgRating: number
  npsScore: number
  categoryBreakdown: { bug: number; feature: number; ux: number; pricing: number }
  responseRate: number
}

export interface DigestItem {
  id: string
  category: 'bug' | 'feature' | 'ux' | 'pricing'
  rating: number
  commentText: string | null
  pageUrl: string
  metadata: Record<string, unknown>
  createdAt: string
  isUrgent: boolean
}

export interface DigestData {
  periodStart: Date
  periodEnd: Date
  stats: DigestStats
  items: DigestItem[]
  escalatedItems: DigestItem[]
}

export function renderWeeklyDigest(digest: DigestData): string {
  const { periodStart, periodEnd, stats, items, escalatedItems } = digest

  const weekStr = periodStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  const categoryBadge = (cat: string) => {
    const map: Record<string, string> = {
      bug: '<span class="badge badge-bug">Bug</span>',
      feature: '<span class="badge badge-feature">Feature</span>',
      ux: '<span class="badge badge-ux">UX</span>',
      pricing: '<span class="badge badge-pricing">Pricing</span>'
    }
    return map[cat] || cat
  }

  const itemRows = items.map(item => {
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const excerpt = item.commentText ? item.commentText.substring(0, 120) + (item.commentText.length > 120 ? '...' : '') : '—'
    const urgentHtml = item.isUrgent ? '<td class="urgent-badge">⚠️ Yes</td>' : '<td>No</td>'
    const rowClass = item.isUrgent ? ' class="urgent-row"' : ''
    return `<tr${rowClass}>
      <td>${dateStr}</td>
      <td>${categoryBadge(item.category)}</td>
      <td>${item.rating}</td>
      <td>${excerpt}</td>
      ${urgentHtml}
    </tr>`
  }).join('')

  const escalationCards = escalatedItems.map(item => {
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const browser = item.metadata?.browser || 'Unknown'
    const os = item.metadata?.os || 'Unknown'
    return `<div class="escalation-card">
      <div class="escalation-header">
        <span class="escalation-title">⚠️ Urgent: Rating = ${item.rating}</span>
        <span class="escalation-meta">${item.category.charAt(0).toUpperCase() + item.category.slice(1)} · Submitted ${dateStr}</span>
      </div>
      <p class="escalation-comment">"${item.commentText || 'No comment'}"</p>
      <p class="escalation-meta">Page: ${item.pageUrl} · Browser: ${browser} / ${os}</p>
    </div>`
  }).join('')

  return `<!DOCTYPE html>
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
    .footer a { color: #38BDF8; }
    @media (max-width: 600px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      table { font-size: 12px; }
      th, td { padding: 6px 8px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Feedback Digest</h1>
      <p>${weekStr} · Leksikon.ai</p>
    </div>

    <div class="stats-grid">
      <div class="stat">
        <div class="stat-value">${stats.totalSubmissions}</div>
        <div class="stat-label">Submissions</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.avgRating.toFixed(1)}</div>
        <div class="stat-label">Avg Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.npsScore}</div>
        <div class="stat-label">NPS</div>
      </div>
      <div class="stat">
        <div class="stat-value">${stats.responseRate}%</div>
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
          ${itemRows || '<tr><td colspan="5" style="text-align:center;color:#6B7280;">No feedback this week</td></tr>'}
        </tbody>
      </table>
    </div>

    ${escalatedItems.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Action Required (${escalatedItems.length} item${escalatedItems.length !== 1 ? 's' : ''})</h2>
      ${escalationCards}
    </div>
    ` : ''}

    <div class="footer">
      Sent by Leksikon.ai · Feedback system · <a href="#">Manage digest preferences</a>
    </div>
  </div>
</body>
</html>`
}