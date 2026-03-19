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

    // Seed EN booking fields + trust badges
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      data: {
        bookingFormTitle: 'Book This Tour',
        bookingSubmitLabel: 'Submit Request',
        bookingSuccessTitle: 'Request Received!',
        bookingSuccessMessage: 'Thank you! We received your request and will get back to you shortly.',
        bookingConsentText: 'I agree to the [terms] and [privacy]',
        bookingPricingDescription: 'All prices are per your individual group, not per person.',
        bookingTrustBadges: [
          { text: 'No payment until we confirm' },
          { text: 'Free cancellation 24h before' },
          { text: '100% private — just your group' },
        ],
      } as any,
    })

    // Fetch to get array item IDs
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: 'en',
    }) as any

    const badges = settings.bookingTrustBadges || []
    const ruTexts = [
      'Оплата только после подтверждения',
      'Бесплатная отмена за 24 часа',
      '100% индивидуально — только ваша группа',
    ]

    // Seed RU with matching IDs to preserve EN text
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'ru',
      data: {
        bookingFormTitle: 'Забронировать экскурсию',
        bookingSubmitLabel: 'Отправить запрос',
        bookingSuccessTitle: 'Запрос получен!',
        bookingSuccessMessage: 'Спасибо! Мы получили ваш запрос и свяжемся с вами в ближайшее время.',
        bookingConsentText: 'Я принимаю [terms] и [privacy]',
        bookingPricingDescription: 'Все цены указаны за вашу индивидуальную группу, а не за человека.',
        bookingTrustBadges: badges.map((badge: any, i: number) => ({
          id: badge.id,
          text: ruTexts[i],
        })),
      } as any,
    })

    // Verify
    const enResult = await payload.findGlobal({ slug: 'site-settings', locale: 'en' }) as any
    const ruResult = await payload.findGlobal({ slug: 'site-settings', locale: 'ru' }) as any

    return NextResponse.json({
      success: true,
      en: {
        bookingFormTitle: enResult.bookingFormTitle,
        bookingSubmitLabel: enResult.bookingSubmitLabel,
        bookingSuccessTitle: enResult.bookingSuccessTitle,
        bookingSuccessMessage: enResult.bookingSuccessMessage,
        bookingConsentText: enResult.bookingConsentText,
        bookingPricingDescription: enResult.bookingPricingDescription,
        bookingTrustBadges: enResult.bookingTrustBadges,
      },
      ru: {
        bookingFormTitle: ruResult.bookingFormTitle,
        bookingSubmitLabel: ruResult.bookingSubmitLabel,
        bookingSuccessTitle: ruResult.bookingSuccessTitle,
        bookingSuccessMessage: ruResult.bookingSuccessMessage,
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
