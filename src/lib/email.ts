import { Resend } from 'resend'
import type { ReactElement } from 'react'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) {
  if (!resend) {
    console.log('[Email] Skipping send (no RESEND_API_KEY):', {
      to,
      subject,
    })
    return { success: true, skipped: true }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@bestpragueguide.com',
      to,
      subject,
      react,
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('[Email] Send failed:', error)
    return { success: false, error }
  }
}

export async function sendAdminEmail({
  subject,
  react,
}: {
  subject: string
  react: ReactElement
}) {
  const adminEmail =
    process.env.ADMIN_EMAIL || 'uliana@bestpragueguide.com'
  return sendEmail({ to: adminEmail, subject, react })
}
