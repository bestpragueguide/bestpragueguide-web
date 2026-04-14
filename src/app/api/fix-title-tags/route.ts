import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const BRAND = 'Best Prague Guide'
const BRAND_SUFFIX = ` | ${BRAND}`
const MAX_CHARS = 60

// Specific titles for core tour pages
const tourTitles: Record<string, string> = {
  'charles-bridge-old-town': `Old Town & Charles Bridge — Private Tour | ${BRAND}`,
  'prague-castle-lesser-town': `Prague Castle & Lesser Town — Private | ${BRAND}`,
  'all-prague-in-one-day': `All Prague in One Day — Full-Day Tour | ${BRAND}`,
  'hidden-prague-underground-alchemy': `Hidden Prague — Underground & Alchemy | ${BRAND}`,
  'best-of-prague-car-tour': `Prague Car Tour — Private Sightseeing | ${BRAND}`,
  'cesky-krumlov': `Cesky Krumlov — Private Day Trip | ${BRAND}`,
  'kutna-hora': `Kutna Hora — Private Day Trip | ${BRAND}`,
  'karlsbad': `Karlovy Vary — Private Day Trip | ${BRAND}`,
  'terezin-memorial': `Terezin Memorial — Private Day Trip | ${BRAND}`,
  'karlstejn-castle': `Karlstejn Castle — Private Day Trip | ${BRAND}`,
  'hluboka-castle': `Hluboka Castle — Private Day Trip | ${BRAND}`,
  'cesky-sternberk': `Cesky Sternberk — Private Day Trip | ${BRAND}`,
  'kozel-brewery-tour': `Kozel Brewery — Private Day Trip | ${BRAND}`,
  'pilsner-urquell-brewery': `Pilsner Urquell — Private Brewery Tour | ${BRAND}`,
  'skoda-factory': `Skoda Factory — Private Day Trip | ${BRAND}`,
  '1630-medieval-dinner-prague': `Medieval Dinner Show — Evening Prague | ${BRAND}`,
  '2000-medieval-dinner-prague': `Medieval Dinner Show — Evening Prague | ${BRAND}`,
}

function removeDiacritics(s: string): string {
  return s
    .replace(/[čČ]/g, (m) => m === 'č' ? 'c' : 'C')
    .replace(/[šŠ]/g, (m) => m === 'š' ? 's' : 'S')
    .replace(/[žŽ]/g, (m) => m === 'ž' ? 'z' : 'Z')
    .replace(/[řŘ]/g, (m) => m === 'ř' ? 'r' : 'R')
    .replace(/[ťŤ]/g, (m) => m === 'ť' ? 't' : 'T')
    .replace(/[ďĎ]/g, (m) => m === 'ď' ? 'd' : 'D')
    .replace(/[ňŇ]/g, (m) => m === 'ň' ? 'n' : 'N')
    .replace(/[ěĚ]/g, (m) => m === 'ě' ? 'e' : 'E')
    .replace(/[ůúŮÚ]/g, (m) => m.toLowerCase() === 'ů' || m.toLowerCase() === 'ú' ? (m === m.toLowerCase() ? 'u' : 'U') : m)
    .replace(/[ýÝ]/g, (m) => m === 'ý' ? 'y' : 'Y')
    .replace(/[áÁ]/g, (m) => m === 'á' ? 'a' : 'A')
    .replace(/[íÍ]/g, (m) => m === 'í' ? 'i' : 'I')
    .replace(/[éÉ]/g, (m) => m === 'é' ? 'e' : 'E')
    .replace(/[óÓ]/g, (m) => m === 'ó' ? 'o' : 'O')
}

function fixTitle(currentTitle: string): string | null {
  if (!currentTitle) return null

  let fixed = currentTitle

  // Remove diacritics
  fixed = removeDiacritics(fixed)

  // Fix brand name spelling
  fixed = fixed.replace(/bestpragueguide/gi, BRAND)

  // Fix separators before brand: " - Best Prague Guide" or " – Best Prague Guide" → " | Best Prague Guide"
  fixed = fixed.replace(/ [-–] Best Prague Guide$/i, ` | ${BRAND}`)

  // If brand is completely missing, add it
  if (!fixed.includes(BRAND)) {
    // Shorten title to fit with brand suffix
    const maxKeywordLen = MAX_CHARS - BRAND_SUFFIX.length
    if (fixed.length > maxKeywordLen) {
      fixed = fixed.substring(0, maxKeywordLen).trim()
      // Clean up trailing separators
      fixed = fixed.replace(/\s*[-—|:]\s*$/, '').trim()
    }
    fixed = fixed + BRAND_SUFFIX
  }

  // If still over 60 chars, shorten the keyword portion
  if (fixed.length > MAX_CHARS) {
    const brandPart = fixed.includes(BRAND_SUFFIX) ? BRAND_SUFFIX : ` | ${BRAND}`
    const keywordPart = fixed.replace(brandPart, '').trim()
    const maxLen = MAX_CHARS - brandPart.length
    const shortened = keywordPart.substring(0, maxLen).trim().replace(/\s*[-—|:]\s*$/, '').trim()
    fixed = shortened + brandPart
  }

  // If still over 60, truncate harder
  if (fixed.length > MAX_CHARS) {
    fixed = fixed.substring(0, MAX_CHARS)
  }

  return fixed !== currentTitle ? fixed : null
}

/**
 * GET — audit all EN titles
 * POST — fix all EN titles (body: { dryRun?: boolean })
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })

    // Audit tours
    const tours = await payload.find({ collection: 'tours', limit: 0, locale: 'en', depth: 0 })
    const tourResults = tours.docs.map((t: any) => {
      const current = (t.seo?.metaTitle || t.title || '') as string
      const specified = tourTitles[t.slug as string]
      return { type: 'tour', slug: t.slug, current, specified, needsFix: specified ? current !== specified : !!fixTitle(current) }
    })

    // Audit blog posts
    const posts = await payload.find({ collection: 'blog-posts', limit: 0, locale: 'en', depth: 0, where: { status: { equals: 'published' }, publishedLocales: { in: ['en'] } } })
    let blogNeedsFix = 0
    let blogOk = 0
    for (const p of posts.docs) {
      const current = ((p.seo as any)?.metaTitle || p.title || '') as string
      if (fixTitle(current)) blogNeedsFix++
      else blogOk++
    }

    return NextResponse.json({
      tours: { total: tours.totalDocs, needsFix: tourResults.filter(r => r.needsFix).length, details: tourResults },
      blog: { total: posts.totalDocs, needsFix: blogNeedsFix, ok: blogOk },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const dryRun = body.dryRun === true
    const payload = await getPayload({ config })

    let fixed = 0
    let skipped = 0
    let errors = 0

    // Fix tour titles
    const tours = await payload.find({ collection: 'tours', limit: 0, locale: 'en', depth: 0 })
    for (const t of tours.docs) {
      const slug = t.slug as string
      const current = ((t.seo as any)?.metaTitle || '') as string
      const specified = tourTitles[slug]
      const newTitle = specified || fixTitle(current)

      if (!newTitle || newTitle === current) { skipped++; continue }

      if (!dryRun) {
        try {
          await payload.update({
            collection: 'tours', id: t.id, locale: 'en',
            data: { seo: { ...((t as any).seo || {}), metaTitle: newTitle } } as any,
          })
          fixed++
        } catch { errors++ }
      } else { fixed++ }
    }

    // Fix blog post titles
    const posts = await payload.find({
      collection: 'blog-posts', limit: 0, locale: 'en', depth: 0,
      where: { status: { equals: 'published' }, publishedLocales: { in: ['en'] } },
    })
    for (const p of posts.docs) {
      const current = ((p.seo as any)?.metaTitle || p.title || '') as string
      const newTitle = fixTitle(current)

      if (!newTitle) { skipped++; continue }

      if (!dryRun) {
        try {
          await payload.update({
            collection: 'blog-posts', id: p.id, locale: 'en',
            data: { seo: { ...((p as any).seo || {}), metaTitle: newTitle } } as any,
          })
          fixed++
        } catch { errors++ }
      } else { fixed++ }
    }

    return NextResponse.json({ dryRun, fixed, skipped, errors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
