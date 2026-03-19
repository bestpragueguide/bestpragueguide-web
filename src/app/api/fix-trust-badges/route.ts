import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const seeded: string[] = []

    // Read current EN values
    const enSettings = await payload.findGlobal({
      slug: 'site-settings',
      locale: 'en',
    }) as any

    // Only seed EN fields that are empty/null
    const enData: Record<string, any> = {}
    const enDefaults: Record<string, any> = {
      bookingFormTitle: 'Book This Tour',
      bookingSubmitLabel: 'Submit Request',
      bookingSuccessTitle: 'Request Received!',
      bookingSuccessMessage: 'Thank you! We received your request and will get back to you shortly.',
      bookingDisclaimerText: 'By submitting you agree to be contacted about your request.',
      bookingConsentText: 'I agree to the [terms] and [privacy]',
      bookingPricingDescription: 'All prices are per your individual group, not per person.',
    }

    for (const [key, defaultValue] of Object.entries(enDefaults)) {
      if (!enSettings[key]) {
        enData[key] = defaultValue
        seeded.push(`EN ${key}`)
      }
    }

    // Only seed trust badges if none exist
    const hasBadges = enSettings.bookingTrustBadges && enSettings.bookingTrustBadges.length > 0
    if (!hasBadges) {
      enData.bookingTrustBadges = [
        { text: 'No payment until we confirm' },
        { text: 'Free cancellation 24h before' },
        { text: '100% private — just your group' },
      ]
      seeded.push('EN bookingTrustBadges')
    }

    if (Object.keys(enData).length > 0) {
      await payload.updateGlobal({
        slug: 'site-settings',
        locale: 'en',
        data: enData as any,
      })
    }

    // Re-fetch EN to get badge IDs (needed for RU update)
    const enRefresh = await payload.findGlobal({
      slug: 'site-settings',
      locale: 'en',
    }) as any

    // Read current RU values
    const ruSettings = await payload.findGlobal({
      slug: 'site-settings',
      locale: 'ru',
    }) as any

    // Only seed RU fields that are empty/null
    const ruData: Record<string, any> = {}
    const ruDefaults: Record<string, any> = {
      bookingFormTitle: 'Забронировать экскурсию',
      bookingSubmitLabel: 'Отправить запрос',
      bookingSuccessTitle: 'Запрос получен!',
      bookingSuccessMessage: 'Спасибо! Мы получили ваш запрос и свяжемся с вами в ближайшее время.',
      bookingDisclaimerText: 'Отправляя форму, вы соглашаетесь на связь по вашему запросу.',
      bookingConsentText: 'Я принимаю [terms] и [privacy]',
      bookingPricingDescription: 'Все цены указаны за вашу индивидуальную группу, а не за человека.',
    }

    for (const [key, defaultValue] of Object.entries(ruDefaults)) {
      if (!ruSettings[key]) {
        ruData[key] = defaultValue
        seeded.push(`RU ${key}`)
      }
    }

    // Only seed RU badges if none exist (use EN IDs to preserve EN text)
    const ruHasBadges = ruSettings.bookingTrustBadges && ruSettings.bookingTrustBadges.length > 0
    if (!ruHasBadges && enRefresh.bookingTrustBadges?.length) {
      const ruBadgeTexts = [
        'Оплата только после подтверждения',
        'Бесплатная отмена за 24 часа',
        '100% индивидуально — только ваша группа',
      ]
      ruData.bookingTrustBadges = enRefresh.bookingTrustBadges.map((badge: any, i: number) => ({
        id: badge.id,
        text: ruBadgeTexts[i],
      }))
      seeded.push('RU bookingTrustBadges')
    }

    if (Object.keys(ruData).length > 0) {
      await payload.updateGlobal({
        slug: 'site-settings',
        locale: 'ru',
        data: ruData as any,
      })
    }

    // Convert plain text email template fields to Lexical JSON
    const richTextFields = ['receivedBody', 'receivedSummaryBody', 'receivedNote', 'offerBody', 'offerNote', 'confirmedBody', 'confirmedNote', 'declinedBody', 'declinedNote', 'paymentBody', 'paymentNote', 'reminderBody', 'reminderNote']
    for (const loc of ['en', 'ru'] as const) {
      const tplData = await payload.findGlobal({ slug: 'email-templates', locale: loc }) as any
      const updates: Record<string, any> = {}
      for (const field of richTextFields) {
        const val = tplData[field]
        if (typeof val === 'string' && val.length > 0) {
          // Convert plain string to Lexical JSON
          updates[field] = {
            root: {
              type: 'root',
              children: val.split('\n').filter(Boolean).map((line: string) => ({
                type: 'paragraph',
                children: [{ type: 'text', text: line, version: 1 }],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              })),
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          }
          seeded.push(`${loc.toUpperCase()} email ${field} → Lexical`)
        }
      }
      if (Object.keys(updates).length > 0) {
        await payload.updateGlobal({ slug: 'email-templates', locale: loc, data: updates as any })
      }
    }

    // Seed email templates (non-destructive)
    const enTpl = await payload.findGlobal({ slug: 'email-templates', locale: 'en' }) as any
    if (!enTpl.receivedBody || enTpl.receivedBody === 'Thank you for your request for the "{tour}" tour on {date}. We received your request and will get back to you shortly.') {
      await payload.updateGlobal({
        slug: 'email-templates',
        locale: 'en',
        data: {
          receivedBody: 'Thank you for your booking request! Here are the details:\n\nTour: {tour}\nDate: {date}\nTime: {time}\nGuests: {guests}\nPrice: {price} {currency}\nEmail: {email}\nPhone: {phone}\nRequests: {requests}\n\nYour reference number is {ref}. We will get back to you shortly.',
        } as any,
      })
      seeded.push('EN email receivedBody')
    }
    const ruTpl = await payload.findGlobal({ slug: 'email-templates', locale: 'ru' }) as any
    if (!ruTpl.receivedBody || ruTpl.receivedBody === enTpl.receivedBody) {
      await payload.updateGlobal({
        slug: 'email-templates',
        locale: 'ru',
        data: {
          receivedBody: 'Спасибо за ваш запрос на бронирование! Вот детали:\n\nЭкскурсия: {tour}\nДата: {date}\nВремя: {time}\nГостей: {guests}\nСтоимость: {price} {currency}\nEmail: {email}\nТелефон: {phone}\nПожелания: {requests}\n\nНомер вашей заявки: {ref}. Мы свяжемся с вами в ближайшее время.',
        } as any,
      })
      seeded.push('RU email receivedBody')
    }

    // Seed offer email template (non-destructive)
    if (!(enTpl as any).offerBody) {
      await payload.updateGlobal({
        slug: 'email-templates',
        locale: 'en',
        data: {
          offerSubject: 'Your booking is confirmed — {tour}',
          offerHeading: 'Your tour is confirmed, {name}!',
          offerBody: 'Great news! Your "{tour}" tour has been confirmed.\n\nHere are the details:\n\nTour: {tour}\nDate: {date}\nTime: {time}\nGuests: {guests}\nPrice: {price} {currency}\nDeposit: {deposit} {currency}\n\nPlease click the button below to view your booking and complete the payment.',
          offerCtaLabel: 'View Your Booking',
          offerNote: 'If you have any questions, contact us via WhatsApp, email, or phone.',
          headerTitle: enTpl.headerTitle || 'Best Prague Guide',
          greeting: enTpl.greeting || 'Hello, {name}!',
          footer: enTpl.footer || 'Best Prague Guide | info@bestpragueguide.com',
        } as any,
      })
      seeded.push('EN email offer template')
    }
    if (!(ruTpl as any).offerBody) {
      await payload.updateGlobal({
        slug: 'email-templates',
        locale: 'ru',
        data: {
          offerSubject: 'Ваше бронирование подтверждено — {tour}',
          offerHeading: 'Экскурсия подтверждена, {name}!',
          offerBody: 'Отличные новости! Ваша экскурсия "{tour}" подтверждена.\n\nДетали:\n\nЭкскурсия: {tour}\nДата: {date}\nВремя: {time}\nГостей: {guests}\nСтоимость: {price} {currency}\nДепозит: {deposit} {currency}\n\nНажмите кнопку ниже, чтобы просмотреть бронирование и завершить оплату.',
          offerCtaLabel: 'Посмотреть бронирование',
          offerNote: 'Если у вас есть вопросы, свяжитесь с нами через WhatsApp, email или по телефону.',
          headerTitle: ruTpl.headerTitle || 'Best Prague Guide',
          greeting: ruTpl.greeting || 'Здравствуйте, {name}!',
          footer: ruTpl.footer || 'Best Prague Guide | info@bestpragueguide.com',
        } as any,
      })
      seeded.push('RU email offer template')
    }

    // Verify
    const enResult = await payload.findGlobal({ slug: 'site-settings', locale: 'en' }) as any
    const ruResult = await payload.findGlobal({ slug: 'site-settings', locale: 'ru' }) as any

    return NextResponse.json({
      success: true,
      seeded: seeded.length > 0 ? seeded : ['nothing — all fields already populated'],
      en: {
        bookingFormTitle: enResult.bookingFormTitle,
        bookingSubmitLabel: enResult.bookingSubmitLabel,
        bookingSuccessTitle: enResult.bookingSuccessTitle,
        bookingSuccessMessage: enResult.bookingSuccessMessage,
        bookingDisclaimerText: enResult.bookingDisclaimerText,
        bookingConsentText: enResult.bookingConsentText,
        bookingPricingDescription: enResult.bookingPricingDescription,
        bookingTrustBadges: enResult.bookingTrustBadges,
      },
      ru: {
        bookingFormTitle: ruResult.bookingFormTitle,
        bookingSubmitLabel: ruResult.bookingSubmitLabel,
        bookingSuccessTitle: ruResult.bookingSuccessTitle,
        bookingSuccessMessage: ruResult.bookingSuccessMessage,
        bookingDisclaimerText: ruResult.bookingDisclaimerText,
        bookingConsentText: ruResult.bookingConsentText,
        bookingPricingDescription: ruResult.bookingPricingDescription,
        bookingTrustBadges: ruResult.bookingTrustBadges,
      },
    })
  } catch (error) {
    console.error('[fix-trust-badges] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
