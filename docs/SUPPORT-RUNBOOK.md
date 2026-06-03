# Support Runbook — Early Users

**Version**: 1.0  
**Date**: 2026-05-29  
**Status**: Active  
**Owner**: CTO  

---

## Overview

This runbook helps early users of Leksikon.ai resolve common issues and understand how to get support. As an early user, you have direct access to the Leksikon.ai team. We respond within 24 hours on business days.

---

## Getting Help

### Primary Support Channel

**Email**: support@leksikon.ai

Response time: Within 24 hours on business days (Monday–Friday, 9:00–17:00 CET)

### What to Include in Your Support Request

When contacting support, include:
1. A clear description of the issue
2. Steps to reproduce (if applicable)
3. Screenshots if relevant
4. Your email address
5. Any error messages you see

### Support Scope for Early Users

| Category | Supported | Not Supported |
|----------|-----------|---------------|
| Account access issues | ✅ | |
| Inquiry receiving problems | ✅ | |
| AI response generation failures | ✅ | |
| Dashboard loading issues | ✅ | |
| Email delivery failures | ✅ | |
| Feature requests | ✅ (welcomed) | |
| Questions about AI behavior | ✅ | |
| Custom integrations | | ❌ |
| Third-party tool issues | | ❌ |
| Account deletion (self-serve only) | | ❌ |

---

## Common Issues and Solutions

### 1. Not Receiving Customer Inquiries

**Symptoms:**
- Dashboard shows "Ingen forespørgsler" (No inquiries)
- Customers say they sent emails but you don't see them

**Solutions:**

1. **Check your spam folder** — Your customers' emails may be filtered

2. **Verify webhook connection** (for web form users):
   - Go to Settings → Integrationer
   - Confirm the webhook URL is correct
   - Test with the "Send test" button

3. **Verify email forwarding** (for email users):
   - Go to Settings → Integrationer
   - Confirm your forwarding address is active
   - Check that emails from customer domains are not blocked

4. **Check connection status** — Green "Tilsluttet" status means the integration is working

**If still not working:** Email support@leksikon.ai with your account email and screenshots of your settings.

---

### 2. AI Response Not Generating

**Symptoms:**
- Clicking "Generer Svar" shows an error
- Loading spinner stays for more than 30 seconds
- Error: "Kunne ikke generere svar" (Could not generate response)

**Solutions:**

1. **Check your internet connection** — AI generation requires a stable connection

2. **Wait and retry** — Temporary AI service issues resolve quickly. Wait 1 minute and try again.

3. **Check Gemini API status** — If Google's AI service is down, responses won't generate. No action needed from you; we're notified automatically.

4. **Verify your account is active** — Expired or suspended accounts cannot generate AI responses.

**If still not working:** Email support@leksikon.ai. Include the inquiry ID if possible (visible in the inquiry URL).

---

### 3. AI Response is in Wrong Language

**Symptoms:**
- Response appears in English instead of Danish
- Response contains English phrases in a Danish email

**Solution:**

1. Go to **Indstillinger → AI Indstillinger** (Settings → AI Settings)
2. Confirm **Sprog** (Language) is set to **Dansk**
3. Confirm **Foretrukket tone** (Preferred tone) is set as desired
4. Save and try generating the response again

**If still wrong:** Use the "Rediger" (Edit) button to correct the response before sending. AI learns from corrections, so approved edits improve future responses.

---

### 4. Cannot Log In to Account

**Symptoms:**
- Password not accepted
- "Konto ikke fundet" (Account not found) error
- Email verification link expired

**Solutions:**

1. **Reset your password**:
   - Go to leksikon.ai/login
   - Click "Glemt adgangskode?" (Forgot password?)
   - Enter your email
   - Check your inbox for the reset link (check spam if not received)

2. **Verify your email**:
   - New accounts require email verification
   - Check your inbox for the verification email
   - Link expires after 24 hours — request a new one if expired

3. **Account not found**:
   - You may have signed up with a different email
   - Try common alternatives (work vs personal email)
   - Contact support if you cannot locate your account

**Account access issues:** Email support@leksikon.ai with your account email. We can help verify or reset your account.

---

### 5. Dashboard Won't Load

**Symptoms:**
- Page shows blank or infinite loading
- "Der opstod en fejl" (An error occurred) message
- Browser console shows errors

**Solutions:**

1. **Clear your browser cache**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Select "Cached images and files"
   - Refresh the page

2. **Try a different browser**:
   - We support: Chrome (recommended), Firefox, Safari, Edge
   - Update to the latest version

3. **Check JavaScript is enabled**:
   - Our app requires JavaScript
   - Settings → Privacy → Scripts → Allow all

4. **Disable browser extensions**:
   - Ad blockers may interfere
   - Try incognito/private mode

**If dashboard still won't load:** Email support@leksikon.ai with your browser type, version, and any error messages you see.

---

### 6. Response Approved But Not Sent to Customer

**Symptoms:**
- Clicked "Godkend og Send" but customer never received response
- Inquiry status shows "Godkendt" (Approved) but customer hasn't responded

**Solutions:**

1. **Check the customer's spam folder**

2. **Verify the sender email is correct**:
   - Go to Settings → Integrationer
   - Confirm the "Fra" (From) email is what your customers see

3. **Check your email provider's sent folder**:
   - Responses are sent from your configured email address
   - Verify the email was actually sent

4. **Check inquiry status**:
   - Dashboard → Inquiry → Check status
   - "Sendt" means we attempted delivery
   - "Godkendt" means you approved but haven't sent yet

**Email delivery issues:** Email support@leksikon.ai with the inquiry ID. We can check our delivery logs.

---

### 7. Response Quality Concerns

**Symptoms:**
- AI response is inaccurate or inappropriate
- Response doesn't match your business style
- Response contains incorrect information

**Solutions:**

1. **Always review before sending** — You control what gets sent to customers

2. **Edit and improve**:
   - Use "Rediger" (Edit) to correct the response
   - Your corrections train the AI for future responses

3. **Archive poor responses**:
   - Use "Arkiver" to dismiss incorrect responses
   - This helps the AI learn what not to generate

4. **Adjust AI tone**:
   - Settings → AI Indstillinger
   - Change tone: Formel, Neutral, or Uformel
   - Adjust response length preferences

**Persistent quality issues:** Email support@leksikon.ai with examples. We review patterns and adjust AI behavior.

---

## Self-Service Tools

### Account Settings

**Where**: Settings → Konto (Account)

Manage:
- Email and password
- Company profile
- Notification preferences

### AI Settings

**Where**: Settings → AI Indstillinger

Control:
- Response language (Dansk / English)
- Tone (Formel / Neutral / Uformel)
- Response length (Kort / Medium / Lang)

### Integration Setup

**Where**: Settings → Integrationer

Connect:
- Email forwarding
- Webhook for web forms
- Test connection functionality

---

## Response Time Expectations

| Issue Type | First Response | Resolution Target |
|------------|----------------|-------------------|
| Account access | 4 hours | 24 hours |
| AI generation failure | 4 hours | 24 hours |
| Email delivery issue | 4 hours | 24 hours |
| Dashboard loading | 4 hours | 48 hours |
| Feature request | 48 hours | triage only |

**Business hours**: Monday–Friday, 9:00–17:00 CET
**Urgent issues**: Email with "URGENT" in subject line for faster response (same day if before 15:00 CET)

---

## Feedback and Improvement

Your feedback helps us improve Leksikon.ai for everyone:

- **In-app feedback**: Click the feedback icon in the dashboard
- **NPS surveys**: Appear after key milestones
- **Direct email**: support@leksikon.ai

We read every piece of feedback and use it to prioritize improvements.

---

## Known Limitations (Early Version)

As an early user, you may encounter these known issues:

| Issue | Status | Workaround |
|-------|--------|------------|
| No mobile app | In development | Use mobile browser |
| Single-user only | By design | Multi-user on roadmap |
| No team collaboration | By design | Coming Q3 2026 |
| Limited email provider support | Expanding | Check supported list |
| No API access | By design | API on roadmap |

---

## Version Information

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-29 | Initial early user runbook |

---

*Leksikon.ai — Din danske AI-partner for kundeservice*
