import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE = 'https://bestpragueguide.com'

/**
 * POST /api/add-internal-links
 *
 * Add up to 3 internal links to blog articles by modifying Lexical JSON:
 * - Link 1: to /en/prague-guide
 * - Link 2: to the most relevant tour page
 * - Link 3: to a relevant commercial article (optional)
 *
 * Body: { slugs?: string[], dryRun?: boolean, limit?: number, offset?: number }
 * - If slugs provided, process only those. Otherwise process all EN blog posts.
 * - dryRun=true returns what would change without saving.
 */

// Category → tour slug mapping
const categoryTourMap: Record<string, string> = {
  'prague-guide': '/en/tours/all-prague-in-one-day',
  'food-and-drink': '/en/tours/2000-medieval-dinner-prague',
  'day-trips': '/en/tours/cesky-krumlov',
  'tips': '/en/tours/all-prague-in-one-day',
  'history': '/en/tours/hidden-prague-underground-alchemy',
}

// Phrases to search for Link 1 (/en/prague-guide)
const pragueGuidePhrases = [
  'with a guide', 'local guide', 'licensed guide', 'private guide',
  'our guides', 'our team', 'guided tour', 'private tour',
  'walking tour', 'English-speaking guide', 'professional guide',
  'experienced guide', 'tour guide', 'guide in Prague',
]

// Anchor text variations for /en/prague-guide (rotate through these)
const pragueGuideAnchors = [
  'a licensed local guide', 'our Prague guides', 'a private guide',
  'your guide in Prague', 'our licensed guides', 'guided by a local expert',
  'an English-speaking guide', 'a guide who knows the city',
  'with someone who knows every corner', 'our team of guides',
]

// Fallback sentences when no natural phrase exists
const fallbackSentences: Record<string, string> = {
  'prague-guide': `A <a href="${BASE}/en/prague-guide" target="_blank" rel="noopener noreferrer">private guide</a> makes all the difference when exploring this part of Prague.`,
  'food-and-drink': `Our guides know the best local spots — far from the tourist traps. <a href="${BASE}/en/prague-guide" target="_blank" rel="noopener noreferrer">Learn more about our team</a>.`,
  'day-trips': `This day trip is best with a guide who handles the logistics and storytelling. <a href="${BASE}/en/prague-guide" target="_blank" rel="noopener noreferrer">Meet our team</a>.`,
  'tips': `Planning your visit? A <a href="${BASE}/en/prague-guide" target="_blank" rel="noopener noreferrer">private guide</a> takes the logistics off your plate.`,
  'history': `These stories come alive when told by someone who knows them deeply. <a href="${BASE}/en/prague-guide" target="_blank" rel="noopener noreferrer">Our licensed guides</a> share what the plaques don't say.`,
}

function extractText(node: any): string {
  if (!node) return ''
  if (node.text) return node.text
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function hasLinkTo(node: any, href: string): boolean {
  if (!node) return false
  if (node.type === 'link') {
    const url = node.fields?.url || ''
    if (url.includes(href) || url.replace(BASE, '').includes(href)) return true
  }
  if (node.children) {
    for (const child of node.children) {
      if (hasLinkTo(child, href)) return true
    }
  }
  return false
}

function createLinkNode(url: string, anchorText: string): any {
  return {
    type: 'link',
    children: [{ type: 'text', text: anchorText, version: 1, format: 0, mode: 'normal', detail: 0, style: '' }],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 3,
    fields: {
      linkType: 'custom',
      url: url.startsWith('/') ? `${BASE}${url}` : url,
      newTab: true,
    },
  }
}

/**
 * Find a paragraph node containing a target phrase and insert a link.
 * Returns true if link was inserted.
 */
function insertLinkInContent(root: any, searchPhrases: string[], linkUrl: string, anchorText: string, firstHalfOnly: boolean): boolean {
  if (!root?.children) return false
  const children = root.children
  const halfIndex = Math.ceil(children.length / 2)
  const searchRange = firstHalfOnly ? children.slice(0, halfIndex) : children

  for (const node of searchRange) {
    if (node.type !== 'paragraph') continue
    if (!node.children) continue

    // Check if this paragraph already contains a link to the same target
    if (hasLinkTo(node, linkUrl)) continue

    // Search text nodes for matching phrases
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (child.type !== 'text' || !child.text) continue

      for (const phrase of searchPhrases) {
        const idx = child.text.toLowerCase().indexOf(phrase.toLowerCase())
        if (idx === -1) continue

        // Found a match — split the text node and insert a link
        const before = child.text.substring(0, idx)
        const match = child.text.substring(idx, idx + phrase.length)
        const after = child.text.substring(idx + phrase.length)

        const newNodes: any[] = []
        if (before) {
          newNodes.push({ ...child, text: before })
        }
        newNodes.push(createLinkNode(linkUrl, match))
        if (after) {
          newNodes.push({ ...child, text: after })
        }

        // Replace the text node with the split nodes
        node.children.splice(i, 1, ...newNodes)
        return true
      }
    }
  }
  return false
}

/**
 * Add a fallback sentence with link to the end of a paragraph in the first half.
 */
function addFallbackLink(root: any, category: string): boolean {
  if (!root?.children) return false
  const sentence = fallbackSentences[category] || fallbackSentences['tips']

  // Find the last paragraph in the first half
  const halfIndex = Math.ceil(root.children.length / 2)
  let targetParagraph: any = null
  for (let i = halfIndex - 1; i >= 0; i--) {
    if (root.children[i].type === 'paragraph' && root.children[i].children?.length > 0) {
      targetParagraph = root.children[i]
      break
    }
  }

  if (!targetParagraph) return false

  // Parse the fallback sentence into Lexical nodes
  // Simple approach: add as a new paragraph after the target
  const idx = root.children.indexOf(targetParagraph)

  // Extract text and link from the fallback sentence
  const linkMatch = sentence.match(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/)
  if (!linkMatch) return false

  const parts = sentence.split(/<a[^>]*>[^<]*<\/a>/)
  const nodes: any[] = []
  if (parts[0]) {
    nodes.push({ type: 'text', text: parts[0], version: 1, format: 0, mode: 'normal', detail: 0, style: '' })
  }
  nodes.push(createLinkNode(linkMatch[1].replace(BASE, ''), linkMatch[2]))
  if (parts[1]) {
    nodes.push({ type: 'text', text: parts[1], version: 1, format: 0, mode: 'normal', detail: 0, style: '' })
  }

  const newParagraph = {
    type: 'paragraph',
    children: nodes,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  }

  root.children.splice(idx + 1, 0, newParagraph)
  return true
}

// Cluster G slugs — skip these (commercial articles already have links)
const clusterGSlugs = new Set([
  'is-prague-tour-guide-worth-it', 'how-to-choose-prague-tour-guide',
  'prague-private-tour-cost', 'private-vs-group-tours-prague',
  'prague-castle-guided-vs-self-guided', 'prague-jewish-quarter-tour-guide',
  'best-tours-prague-first-time-visitors', 'what-to-expect-private-prague-tour',
  'how-much-to-tip-tour-guide-prague', 'licensed-guide-prague',
  'things-to-know-before-booking-prague-tour', 'prague-old-town-private-tour',
  'prague-walking-tours-guide', 'prague-sightseeing-tours-comparison',
  'private-tour-couples-prague', 'senior-friendly-tours-prague',
  'family-tours-prague', 'prague-vip-luxury-tour', 'prague-custom-tour',
  'prague-airport-pickup-tour', 'prague-tour-repeat-visitors',
  'best-prague-tours-2026', 'prague-underground-alchemy-tour-guide',
])

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-init-secret')
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { slugs, dryRun = false, limit = 30, offset = 0 } = body as {
      slugs?: string[]
      dryRun?: boolean
      limit?: number
      offset?: number
    }

    const payload = await getPayload({ config })

    // Fetch posts
    let posts: any[]
    if (slugs?.length) {
      const results = await Promise.all(slugs.map(async (slug) => {
        const r = await payload.find({ collection: 'blog-posts', where: { slug: { equals: slug } }, limit: 1, locale: 'en' })
        return r.docs[0] || null
      }))
      posts = results.filter(Boolean)
    } else {
      const r = await payload.find({
        collection: 'blog-posts',
        where: { status: { equals: 'published' }, publishedLocales: { in: ['en'] } },
        limit,
        page: Math.floor(offset / limit) + 1,
        locale: 'en',
        sort: 'slug',
      })
      posts = r.docs
    }

    let anchorIdx = offset % pragueGuideAnchors.length
    const results: any[] = []

    for (const post of posts) {
      const slug = post.slug as string
      const category = (post.category || 'prague-guide') as string

      // Skip Cluster G
      if (clusterGSlugs.has(slug)) {
        results.push({ slug, status: 'skipped', reason: 'cluster-g' })
        continue
      }

      const content = post.content as any
      if (!content?.root?.children) {
        results.push({ slug, status: 'skipped', reason: 'no-content' })
        continue
      }

      // Deep clone content
      const updated = JSON.parse(JSON.stringify(content))
      const linksAdded: string[] = []

      // Link 1: /en/prague-guide
      const pgHref = '/en/prague-guide'
      if (!hasLinkTo(updated.root, pgHref) && !hasLinkTo(updated.root, '/en/about')) {
        const anchor = pragueGuideAnchors[anchorIdx % pragueGuideAnchors.length]
        anchorIdx++
        const inserted = insertLinkInContent(updated.root, pragueGuidePhrases, pgHref, anchor, true)
        if (inserted) {
          linksAdded.push(`prague-guide (phrase match)`)
        } else {
          // Try fallback sentence
          const fallbackAdded = addFallbackLink(updated.root, category)
          if (fallbackAdded) {
            linksAdded.push(`prague-guide (fallback sentence)`)
          }
        }
      }

      // Link 2: Relevant tour page
      const tourHref = categoryTourMap[category] || '/en/tours/all-prague-in-one-day'
      if (!hasLinkTo(updated.root, tourHref)) {
        // Try to find tour-related phrases
        const tourPhrases = ['private tour', 'guided tour', 'day trip', 'walking tour', 'tour of', 'explore with']
        const tourName = tourHref.split('/').pop()?.replace(/-/g, ' ') || 'tour'
        const inserted = insertLinkInContent(updated.root, tourPhrases, tourHref, tourName, false)
        if (inserted) {
          linksAdded.push(`tour: ${tourHref}`)
        }
      }

      if (linksAdded.length === 0) {
        results.push({ slug, status: 'skipped', reason: 'no-natural-phrase' })
        continue
      }

      if (dryRun) {
        results.push({ slug, status: 'would-update', links: linksAdded })
        continue
      }

      // Save updated content
      try {
        await payload.update({
          collection: 'blog-posts',
          id: post.id,
          locale: 'en',
          data: { content: updated } as any,
        })
        results.push({ slug, status: 'updated', links: linksAdded })
      } catch (err: any) {
        results.push({ slug, status: 'error', error: err.message?.substring(0, 80) })
      }
    }

    const updated = results.filter(r => r.status === 'updated').length
    const wouldUpdate = results.filter(r => r.status === 'would-update').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const errors = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      processed: posts.length,
      updated: dryRun ? wouldUpdate : updated,
      skipped,
      errors,
      dryRun,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
