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
    const url = node.fields?.url || node.url || '#'
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
      const Tag = (node.tag || 'h2') as keyof JSX.IntrinsicElements
      return <Tag key={idx}>{children}</Tag>
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

  // If it's a plain string (legacy data), render as paragraph
  if (typeof data === 'string') {
    return <p className={className}>{data}</p>
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
