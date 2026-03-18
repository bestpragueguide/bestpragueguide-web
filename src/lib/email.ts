import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { render } from '@react-email/components'
import type { ReactElement } from 'react'

// Resend client (fallback)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Google SMTP transporter (primary)
const gmailTransport =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null

const FROM =
  process.env.RESEND_FROM_EMAIL || 'Best Prague Guide <info@bestpragueguide.com>'

export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: {
  to: string
  subject: string
  react: ReactElement
  replyTo?: string
}) {
  // Try Gmail SMTP first, then Resend, then skip
  if (gmailTransport) {
    try {
      const html = await render(react)
      await gmailTransport.sendMail({
        from: FROM,
        to,
        subject,
        html,
        ...(replyTo ? { replyTo } : {}),
      })
      return { success: true, provider: 'gmail' }
    } catch (error) {
      console.error('[Email] Gmail send failed:', error)
      // Fall through to Resend
    }
  }

  if (resend) {
    try {
      const result = await resend.emails.send({
        from: FROM,
        to,
        subject,
        react,
        ...(replyTo ? { replyTo } : {}),
      })
      return { success: true, provider: 'resend', data: result }
    } catch (error) {
      console.error('[Email] Resend send failed:', error)
      return { success: false, error }
    }
  }

  console.log('[Email] Skipping send (no email provider configured):', {
    to,
    subject,
  })
  return { success: true, skipped: true }
}

export async function sendAdminEmail({
  subject,
  react,
  replyTo,
}: {
  subject: string
  react: ReactElement
  replyTo?: string
}) {
  const adminEmail =
    process.env.ADMIN_EMAIL || 'uliana@bestpragueguide.com'
  return sendEmail({ to: adminEmail, subject, react, replyTo })
}
