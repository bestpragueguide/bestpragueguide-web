import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendEmail, sendAdminEmail } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'
import { getIpInfo, formatLocation, type IpInfo } from '@/lib/ip'
import { sendSlackMessage, formatContactSlackMessage } from '@/lib/slack'
import { isRateLimited } from '@/lib/rate-limit'
import { isDisposableEmail } from '@/lib/email-validation'
import { getNotificationEmail, getEmailTemplates, resolveTemplate } from '@/lib/cms-data'
import { ContactConfirmationEmail } from '@/emails/contact-confirmation'
import { textToLexicalJson } from '@/lib/lexical-helpers'

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(3).max(30),
  message: z.string().min(4).max(1000),
  locale: z.enum(['en', 'ru']),
})

// Admin contact notification now uses ContactConfirmationEmail with branded header/footer

// ContactConfirmationEmail imported from @/emails/contact-confirmation

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'

  if (await isRateLimited(ip, 'contact')) {
    // Still save the message marked as rate_limited
    try {
      const body = await request.json()
      const data = contactSchema.safeParse(body)
      if (data.success) {
        const ipInfo = await getIpInfo(ip)
        const payload = await getPayload({ config })
        await payload.create({
          collection: 'contact-messages',
          data: {
            name: data.data.name,
            email: data.data.email,
            phone: data.data.phone,
            message: textToLexicalJson(data.data.message) as any,
            locale: data.data.locale,
            status: 'error',
            ipInfo: {
              ip: ipInfo.ip,
              city: ipInfo.city || '',
              region: ipInfo.region || '',
              country: ipInfo.country || '',
              isp: ipInfo.org || '',
            },
          },
        })
      }
    } catch {
      // Best effort — don't fail the 429 response
    }
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    if (isDisposableEmail(data.email)) {
      return NextResponse.json(
        { error: 'Please use a valid email address', details: [{ path: ['email'], message: 'Disposable email addresses are not accepted' }] },
        { status: 400 },
      )
    }

    console.log('[Contact Form]', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message.slice(0, 100),
      locale: data.locale,
      ip,
    })

    // Fetch IP geolocation (non-blocking — won't fail the request)
    const ipInfo = await getIpInfo(ip)
    const location = formatLocation(ipInfo)

    // Save to Payload CMS
    try {
      const payload = await getPayload({ config })
      await payload.create({
        collection: 'contact-messages',
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: textToLexicalJson(data.message) as any,
          locale: data.locale,
          ipInfo: {
            ip: ipInfo.ip,
            city: ipInfo.city || '',
            region: ipInfo.region || '',
            country: ipInfo.country || '',
            isp: ipInfo.org || '',
          },
        },
      })
    } catch (err) {
      console.error('[Contact] Failed to save to CMS:', err)
    }

    // Fetch CMS notification email
    const notificationEmail = await getNotificationEmail()

    // Send notifications in parallel
    await Promise.allSettled([
      // Both admin and customer emails use CMS templates with branded header/footer
      (async () => {
        const tpl = await getEmailTemplates(data.locale)
        const vars = { name: data.name }

        // Admin notification
        await sendAdminEmail({
          to: notificationEmail,
          subject: tpl.contactAdminSubject
            ? resolveTemplate(tpl.contactAdminSubject, vars)
            : `Contact form: ${data.name}`,
          react: ContactConfirmationEmail({
            customerName: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            locale: data.locale as 'en' | 'ru',
            cmsFooter: tpl.footer || undefined,
            cmsHeaderHtml: (tpl as any).headerHtml || undefined,
            cmsHeaderContent: (tpl as any).headerContent || undefined,
            cmsFooterHtml: (tpl as any).footerHtml || undefined,
            cmsFooterContent: (tpl as any).footerContent || undefined,
          }),
          replyTo: data.email,
        })
      })(),
      // Confirmation email to customer (CMS-editable)
      (async () => {
        const tpl = await getEmailTemplates(data.locale)
        const vars = { name: data.name }
        const subject = tpl.contactSubject
          ? resolveTemplate(tpl.contactSubject, vars)
          : data.locale === 'ru'
            ? 'Мы получили ваше сообщение — Best Prague Guide'
            : 'We received your message — Best Prague Guide'
        return sendEmail({
          to: data.email,
          subject,
          react: ContactConfirmationEmail({
            customerName: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
            locale: data.locale as 'en' | 'ru',
            cmsHeading: (tpl as any).contactHeading ? resolveTemplate((tpl as any).contactHeading, vars) : undefined,
            cmsBody: tpl.contactBody ? resolveTemplate(tpl.contactBody, vars) : undefined,
            cmsNote: tpl.contactNote ? resolveTemplate(tpl.contactNote, vars) : undefined,
            cmsFooter: tpl.footer || undefined,
            cmsHeaderHtml: (tpl as any).headerHtml || undefined,
            cmsHeaderContent: (tpl as any).headerContent || undefined,
            cmsFooterHtml: (tpl as any).footerHtml || undefined,
            cmsFooterContent: (tpl as any).footerContent || undefined,
          }),
          replyTo: 'info@bestpragueguide.com',
        })
      })(),
      // Telegram notification
      sendTelegramMessage(
        `📩 <b>Contact Form</b>\n\n<b>Name:</b> ${data.name}\n<b>Email:</b> ${data.email}\n<b>Phone:</b> ${data.phone}\n<b>Message:</b> ${data.message}\n\n<b>IP:</b> ${ip}${location ? `\n<b>Location:</b> ${location}` : ''}${ipInfo.org ? `\n<b>ISP:</b> ${ipInfo.org}` : ''}`,
      ),
      // Slack notification
      sendSlackMessage(
        formatContactSlackMessage({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          locale: data.locale,
          ip: ipInfo.ip,
          location,
          isp: ipInfo.org,
        }),
      ),
      // Meta CAPI — server-side Lead event
      import('@/lib/meta-capi').then(({ capiTrackContactLead }) =>
        capiTrackContactLead({
          email: data.email,
          phone: data.phone,
          ip,
          userAgent: request.headers.get('user-agent') || '',
        })
      ).catch(() => {}),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
