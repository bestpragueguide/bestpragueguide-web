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

    // Seed EN trust badges first (default locale)
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'en',
      data: {
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

    // Update RU with matching IDs to preserve EN text
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: 'ru',
      data: {
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
      en: enResult.bookingTrustBadges,
      ru: ruResult.bookingTrustBadges,
    })
  } catch (error) {
    console.error('[fix-trust-badges] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
