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
    const results: string[] = []

    // Homepage EN
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'en',
      data: {
        seo: {
          metaTitle: 'Private Tours in Prague and Czech Republic | Best Prague Guide',
          metaDescription: 'Discover Prague with private tours from a licensed guide with 17+ years of experience. Walking tours, Prague Castle, Old Town, day trips to Český Krumlov, Karlovy Vary. Just your group — no strangers.',
        },
      } as any,
    })
    results.push('EN homepage SEO set')

    // Homepage RU
    await payload.updateGlobal({
      slug: 'homepage',
      locale: 'ru',
      data: {
        seo: {
          metaTitle: 'Индивидуальные экскурсии по Праге и Чехии | Best Prague Guide',
          metaDescription: 'Откройте Прагу с лицензированным гидом с 17-летним опытом. Пешие экскурсии, Пражский Град, Старый город, поездки в Чески-Крумлов, Карловы Вары. Только ваша группа — никаких посторонних.',
        },
      } as any,
    })
    results.push('RU homepage SEO set')

    // About EN
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'en',
      data: {
        seo: {
          metaTitle: 'About Us — Meet Your Guide Uliana Formina | Best Prague Guide',
          metaDescription: 'Meet Uliana Formina — highest-category licensed guide with 17+ years in Prague. Our team of certified Czech Guide Association members delivers private, personalized tour experiences for guests from around the world.',
        },
      } as any,
    })
    results.push('EN about SEO set')

    // About RU
    await payload.updateGlobal({
      slug: 'about-page',
      locale: 'ru',
      data: {
        seo: {
          metaTitle: 'О нас — Ваш гид Ульяна Формина | Best Prague Guide',
          metaDescription: 'Познакомьтесь с Ульяной Форминой — лицензированным гидом высшей категории с 17-летним опытом работы в Праге. Команда сертифицированных гидов Ассоциации гидов Чехии для индивидуальных экскурсий.',
        },
      } as any,
    })
    results.push('RU about SEO set')

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
