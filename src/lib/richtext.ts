import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Walk a Lexical JSON tree and resolve internal link URLs.
 * Call this server-side before passing data to RichText or SafeRichText.
 */
export async function resolveRichTextLinks(
  data: any,
  locale: string,
): Promise<any> {
  if (!data?.root?.children) return data

  // Collect all internal link doc IDs grouped by collection
  const refs: Array<{ node: any; collection: string; id: number }> = []
  function walk(node: any) {
    if (!node) return
    if (
      node.type === 'link' &&
      node.fields?.linkType === 'internal' &&
      node.fields?.doc
    ) {
      const doc = node.fields.doc
      const id = typeof doc.value === 'object' ? doc.value?.id : doc.value
      if (typeof id === 'number' && doc.relationTo) {
        refs.push({ node, collection: doc.relationTo, id })
      }
    }
    if (node.children) node.children.forEach(walk)
  }
  data.root.children.forEach(walk)

  if (refs.length === 0) return data

  const payload = await getPayload({ config })

  const collectionPrefixes: Record<string, string> = {
    tours: '/tours',
    'blog-posts': '/blog',
    pages: '',
  }

  // Group by collection to minimize queries
  const byCollection = new Map<string, number[]>()
  for (const ref of refs) {
    const ids = byCollection.get(ref.collection) || []
    ids.push(ref.id)
    byCollection.set(ref.collection, ids)
  }

  const slugMap = new Map<string, string>()
  for (const [collection, ids] of byCollection) {
    try {
      const result = await payload.find({
        collection: collection as any,
        where: { id: { in: [...new Set(ids)] } },
        locale: locale as any,
        limit: ids.length,
      })
      for (const doc of result.docs) {
        const prefix = collectionPrefixes[collection] ?? ''
        slugMap.set(`${collection}:${doc.id}`, `${prefix}/${(doc as any).slug}`)
      }
    } catch {
      // ignore lookup failures
    }
  }

  // Patch link nodes with resolved URLs
  for (const ref of refs) {
    const url = slugMap.get(`${ref.collection}:${ref.id}`)
    if (url) {
      ref.node.fields.url = url
    }
  }

  return data
}
