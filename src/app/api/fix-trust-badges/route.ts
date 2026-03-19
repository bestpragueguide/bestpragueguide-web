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
