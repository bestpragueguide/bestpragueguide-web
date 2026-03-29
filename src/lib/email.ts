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
  let lastError: unknown = null

  // Try Gmail SMTP first
  if (gmailTransport) {
    try {
      console.log(`[Email] Rendering HTML for ${to}: ${subject}`)
      const html = await render(react)
      console.log(`[Email] Rendered ${html.length} chars, sending via Gmail to ${to}`)
      // Generate plain text version for better deliverability
      const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 2000)
      const info = await gmailTransport.sendMail({
        from: FROM,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
      })
      console.log(`[Email] Sent via Gmail to ${to}: ${subject} | messageId: ${info.messageId}`)
      return { success: true, provider: 'gmail' }
    } catch (error) {
      lastError = error
      console.error('[Email] Gmail send failed:', error instanceof Error ? `${error.message}\n${error.stack}` : error)
    }
  }

  // Fallback to Resend
  if (resend) {
    try {
      const result = await resend.emails.send({
        from: FROM,
        to,
        subject,
        react,
        ...(replyTo ? { replyTo } : {}),
      })
      console.log(`[Email] Sent via Resend to ${to}: ${subject}`)
      return { success: true, provider: 'resend', data: result }
    } catch (error) {
      lastError = error
      console.error('[Email] Resend send failed:', error instanceof Error ? error.message : error)
    }
  }

  if (lastError) {
    console.error(`[Email] All providers failed for ${to}: ${subject}`)
    return { success: false, error: lastError instanceof Error ? lastError.message : String(lastError) }
  }

  console.warn(`[Email] No provider configured, skipping: ${to} — ${subject}`)
  return { success: false, error: 'No email provider configured', skipped: true }
}

export async function sendAdminEmail({
  to,
  subject,
  react,
  replyTo,
}: {
  to?: string
  subject: string
  react: ReactElement
  replyTo?: string
}) {
  const adminEmail =
    to || process.env.ADMIN_EMAIL || 'info@bestpragueguide.com'
  return sendEmail({ to: adminEmail, subject, react, replyTo })
}
