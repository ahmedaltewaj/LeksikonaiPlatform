# Getting Started with Leksikon.ai

**Estimated time: 15 minutes to first AI-assisted response**

Leksikon.ai helps Danish SMEs automate customer responses using AI. This guide walks you through the core journey: from signup to sending your first AI-assisted response.

---

## 1. Create Your Account

1. Go to [leksikon.ai](https://leksikon.ai) and click **Start Free**
2. Enter your email and create a password
3. Check your email for a verification link (sent within 2 minutes)

---

## 2. Complete Setup Wizard (5 minutes)

After login, the setup wizard guides you through 4 steps:

### Step 1: Company Profile
- Company name, industry (Accounting, Legal, Real Estate, Consulting, Other)
- Company size (Solo, 2-5, 6-10, 10+)
- Primary language (defaults to Danish)

### Step 2: Connect Your Inbox
Choose one:
- **Email integration**: Connect Gmail, Outlook, or IMAP
- **Web form**: Copy the embed code to your website

### Step 3: Configure Identity
- Sender name and email (shown to customers)
- Reply-to address
- Signature style (Formal, Casual, or Minimal)

### Step 4: Test Your Setup
- Receive a test inquiry, or submit your web form
- Confirm it appears in your dashboard

**Success indicator**: Green "Connected" status and a message: *"Din forbindelse virker!"*

---

## 3. Core Workflow: Review and Send Responses

### 3.1 View Pending Inquiries

```
Dashboard → Inquiry List (status: "Afventer" / Pending)
```

Each inquiry shows: sender name, email, subject, received time.

### 3.2 Generate AI Response

Click **Generer Svar** (Generate Response) on any inquiry.

The system calls Gemini AI with:
- The inquiry text
- Your configured identity and style preferences
- Danish language context

AI response appears in ~5 seconds.

### 3.3 Review and Send

You have three options:

| Action | Result |
|--------|--------|
| **Godkend og Send** | Approves AI text, sends directly to customer |
| **Rediger** | Opens text editor, then approve to send |
| **Arkiver** | Dismisses without sending |

**Your approval is always required** — AI never sends without your explicit action.

---

## 4. Understanding the Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ I alt       │  │ Denne uge  │  │ Godkendt    │     │
│  │ 24          │  │ 8           │  │ 85%         │     │
│  │ forespørgs. │  │ forespørgs. │  │ rate        │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  Recent Inquiries                                       │
│  ───────────────────────────────────────────────────   │
│  • [Afventer] Henvendelse fra Karsten R. - 10 min siden │
│  • [Afventer] Spørgsmål om pris - 2 timer siden        │
│  • [Sendt] Bekræftelse på ordre #123 - 1 dag siden      │
└─────────────────────────────────────────────────────────┘
```

Metrics explained:
- **I alt**: Total inquiries received
- **Denne uge**: This week's inquiry volume
- **Godkendt rate**: Percentage of AI responses approved without edit

---

## 5. Troubleshooting

| Issue | Solution |
|-------|----------|
| Test email not arriving | Check spam folder; verify webhook URL in settings |
| AI response is poor quality | Edit the text before sending — AI learns from approvals |
| Can't connect inbox | Verify email credentials; try re-authenticating |
| Dashboard shows "Ingen forespørgsler" | Wait for customer email or submit test form |

---

## 6. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `G` then `R` | Go to Responses |
| `G` then `D` | Go to Dashboard |
| `J` / `K` | Navigate between inquiries |
| `Enter` | Generate response for selected inquiry |

---

## What's Next?

- **Add more users**: Settings → Team (coming soon)
- **View analytics**: Dashboard → Statistik
- **Customize AI behavior**: Settings → AI Indstillinger

---

*Document version: 1.0 | Leksikon.ai*