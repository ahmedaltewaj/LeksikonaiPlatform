import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

export const emailClient = {
  get client() {
    return getResendClient()
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Leksikon AI <noreply@leksikon.dk>'
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  const resend = getResendClient()
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html
  })

  if (error) {
    console.error('Failed to send email:', error)
    throw error
  }

  return data
}