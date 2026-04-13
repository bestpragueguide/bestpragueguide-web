import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * POST /api/fix-about-seo — Update CMS globals for About page SEO:
 * 1. about-page: set EN metaTitle + metaDescription
 * 2. about-page: update EN founderHeading
 * 3. navigation: update EN /about links → /prague-guide
 * 4. homepage: update guideLearnMoreHref → /prague-guide
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const results: string[] = []

    // 1. Update about-page SEO fields (EN)
    try {
      await payload.updateGlobal({
        slug: 'about-page',
        locale: 'en',
        data: {
          seo: {
            metaTitle: 'Prague Tour Guide — Licensed Private Tours | Best Prague Guide',
            metaDescription: 'Hire a licensed private tour guide in Prague. Uliana Formina and her team offer private-only tours — just your group, no strangers →',
          },
        } as any,
      })
      results.push('about-page SEO: updated')
    } catch (err: any) {
      results.push('about-page SEO: error - ' + err.message?.substring(0, 100))
    }

    // 2. Update navigation — replace /about with /prague-guide in EN header links
    try {
      const nav = await payload.findGlobal({ slug: 'navigation', locale: 'en' })
      const navData = nav as any

      // Update header links
      const headerLinks = navData.headerLinks?.map((link: any) => ({
        ...link,
        href: link.href === '/about' ? '/prague-guide' : link.href,
      })) || []

      // Update footer columns
      const footerColumns = navData.footerColumns?.map((col: any) => ({
        ...col,
        links: col.links?.map((link: any) => ({
          ...link,
          href: link.href === '/about' ? '/prague-guide' : link.href,
        })) || [],
      })) || []

      await payload.updateGlobal({
        slug: 'navigation',
        locale: 'en',
        data: {
          headerLinks,
          footerColumns,
        } as any,
      })
      results.push('navigation: updated /about → /prague-guide')
    } catch (err: any) {
      results.push('navigation: error - ' + err.message?.substring(0, 100))
    }

    // 3. Update homepage guideLearnMoreHref
    try {
      await payload.updateGlobal({
        slug: 'homepage',
        locale: 'en',
        data: {
          guideLearnMoreHref: '/prague-guide',
        } as any,
      })
      results.push('homepage guideLearnMoreHref: updated')
    } catch (err: any) {
      results.push('homepage: error - ' + err.message?.substring(0, 100))
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
