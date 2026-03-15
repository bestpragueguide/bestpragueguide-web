/** Extract plain text from a richText field (Lexical JSON or plain string) */
export function extractPlainText(data: any): string {
  if (!data) return ''
  if (typeof data === 'string') return data
  if (data?.root?.children) {
    return data.root.children
      .map((node: any) => {
        if (node.type === 'text') return node.text || ''
        if (node.children) return node.children.map((c: any) => c.text || '').join('')
        return ''
      })
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

interface SafeRichTextProps {
  data: any
  className?: string
}

function renderNode(node: any, idx: number): React.ReactNode {
  if (!node) return null

  if (node.type === 'text') {
    let content: React.ReactNode = node.text || ''
    // Handle formatting flags: 1=bold, 2=italic, 4=underline
    if (node.format) {
      if (node.format & 1) content = <strong key={`b${idx}`}>{content}</strong>
      if (node.format & 2) content = <em key={`i${idx}`}>{content}</em>
      if (node.format & 4) content = <u key={`u${idx}`}>{content}</u>
    }
    return content
  }

  if (node.type === 'link') {
    let url = node.fields?.url || node.url || '#'
    // Resolve internal links
    if (node.fields?.linkType === 'internal' && node.fields?.doc) {
      const doc = node.fields.doc
      const slug = typeof doc.value === 'object' ? doc.value?.slug : null
      if (slug && doc.relationTo === 'tours') {
        url = `/tours/${slug}`
      } else if (slug && doc.relationTo === 'blog-posts') {
        url = `/blog/${slug}`
      } else if (slug && doc.relationTo === 'pages') {
        url = `/${slug}`
      }
      // If slug wasn't populated, url stays as resolvedUrl (set by resolveRichTextLinks) or '#'
    }
    const target = node.fields?.newTab ? '_blank' : undefined
    return (
      <a key={idx} href={url} target={target} rel={target ? 'noopener noreferrer' : undefined}>
        {(node.children || []).map(renderNode)}
      </a>
    )
  }

  if (node.type === 'linebreak') {
    return <br key={idx} />
  }

  const children = (node.children || []).map(renderNode)

  switch (node.type) {
    case 'paragraph':
      return <p key={idx}>{children}</p>
    case 'heading': {
      const tag = node.tag || 'h2'
      if (tag === 'h2') return <h2 key={idx}>{children}</h2>
      if (tag === 'h3') return <h3 key={idx}>{children}</h3>
      if (tag === 'h4') return <h4 key={idx}>{children}</h4>
      return <h2 key={idx}>{children}</h2>
    }
    case 'list':
      if (node.listType === 'number') return <ol key={idx}>{children}</ol>
      return <ul key={idx}>{children}</ul>
    case 'listitem':
      return <li key={idx}>{children}</li>
    case 'quote':
      return <blockquote key={idx}>{children}</blockquote>
    case 'horizontalrule':
      return <hr key={idx} />
    default:
      if (children.length > 0) return <div key={idx}>{children}</div>
      return null
  }
}

export function SafeRichText({ data, className }: SafeRichTextProps) {
  if (!data) return null

  // If it's a plain string (legacy data), split into paragraphs by newlines
  if (typeof data === 'string') {
    const paragraphs = data.split(/\n\s*\n|\n/).filter(Boolean)
    if (paragraphs.length <= 1) {
      return <p className={className}>{data}</p>
    }
    return (
      <div className={className}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    )
  }

  // If it's Lexical richText format
  if (data?.root?.children) {
    return (
      <div className={className}>
        {data.root.children.map((child: any, idx: number) => renderNode(child, idx))}
      </div>
    )
  }

  return null
}
