/**
 * Convert Markdown (with HTML <a> links) to Payload Lexical JSON.
 * Handles: headings, bold, HTML links, paragraphs, lists, horizontal rules.
 */

interface LexicalNode {
  type: string
  version: number
  [key: string]: any
}

function textNode(text: string, format: number = 0): LexicalNode {
  return { type: 'text', text, version: 1, format, mode: 'normal', detail: 0, style: '' }
}

function paragraphNode(children: LexicalNode[]): LexicalNode {
  return { type: 'paragraph', children, direction: 'ltr', format: '', indent: 0, version: 1, textFormat: 0, textStyle: '' }
}

function headingNode(level: number, children: LexicalNode[]): LexicalNode {
  return { type: 'heading', tag: `h${level}`, children, direction: 'ltr', format: '', indent: 0, version: 1 }
}

function linkNode(url: string, children: LexicalNode[], newTab: boolean = true): LexicalNode {
  return {
    type: 'link',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 3,
    fields: {
      linkType: 'custom',
      url: url.startsWith('/') ? `https://bestpragueguide.com${url}` : url,
      newTab,
    },
  }
}

function listNode(items: LexicalNode[][], tag: 'ul' | 'ol' = 'ul'): LexicalNode {
  return {
    type: 'list',
    listType: tag === 'ol' ? 'number' : 'bullet',
    start: 1,
    tag,
    children: items.map((children, i) => ({
      type: 'listitem',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      value: i + 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

function horizontalRuleNode(): LexicalNode {
  return { type: 'horizontalrule', version: 1 }
}

/** Parse inline content: **bold**, <a href>links</a>, plain text */
function parseInline(text: string): LexicalNode[] {
  const nodes: LexicalNode[] = []
  const pattern = /(\*\*(.+?)\*\*)|(<a\s+href="([^"]*)"[^>]*>(.+?)<\/a>)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index)
      if (plain) nodes.push(textNode(plain))
    }

    if (match[1]) {
      nodes.push(textNode(match[2], 1))
    } else if (match[3]) {
      nodes.push(linkNode(match[4], [textNode(match[5])]))
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex)
    if (remaining) nodes.push(textNode(remaining))
  }

  if (nodes.length === 0) {
    nodes.push(textNode(text))
  }

  return nodes
}

export function markdownToLexical(markdown: string): object {
  const lines = markdown.split('\n')
  const children: LexicalNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') { i++; continue }

    if (/^---+$/.test(line.trim())) {
      children.push(horizontalRuleNode())
      i++
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      children.push(headingNode(headingMatch[1].length, parseInline(headingMatch[2])))
      i++
      continue
    }

    // HTML heading tags: <h2 ...>text</h2>, <h3>text</h3> etc.
    const htmlHeadingMatch = line.match(/^<h([2-6])[^>]*>(.*?)<\/h\1>$/)
    if (htmlHeadingMatch) {
      const level = parseInt(htmlHeadingMatch[1])
      const text = htmlHeadingMatch[2].replace(/<[^>]+>/g, '')
      children.push(headingNode(level, parseInline(text)))
      i++
      continue
    }

    // HTML list: <ul>...<li>...</li>...</ul> or <ol>
    if (line.trim() === '<ul>' || line.trim() === '<ol>') {
      const tag = line.trim() === '<ol>' ? 'ol' : 'ul'
      const items: LexicalNode[][] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith(`</${tag}>`)) {
        const liMatch = lines[i].match(/<li>(.*?)<\/li>/)
        if (liMatch) {
          const liContent = liMatch[1].replace(/<[^>]+>/g, '')
          if (liContent.trim()) items.push(parseInline(liContent))
        }
        i++
      }
      if (i < lines.length) i++ // skip </ul> or </ol>
      if (items.length > 0) children.push(listNode(items, tag as 'ul' | 'ol'))
      continue
    }

    // Skip standalone HTML tags that are list wrappers
    if (/^<\/?[uo]l>$/.test(line.trim()) || /^<li>/.test(line.trim())) {
      i++
      continue
    }

    if (/^[-*]\s+/.test(line.trim())) {
      const items: LexicalNode[][] = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*]\s+/, '')))
        i++
      }
      children.push(listNode(items, 'ul'))
      continue
    }

    if (/^\d+\.\s+/.test(line.trim())) {
      const items: LexicalNode[][] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^\d+\.\s+/, '')))
        i++
      }
      children.push(listNode(items, 'ol'))
      continue
    }

    if (line.trim().startsWith('|')) {
      const rawRows: string[] = []
      let sawDelimiter = false
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const raw = lines[i].trim()
        if (/^\|[-\s|:]+\|$/.test(raw)) {
          sawDelimiter = true
        } else {
          rawRows.push(raw)
        }
        i++
      }
      const parseRow = (tl: string): LexicalNode[][] =>
        tl.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => parseInline(c.trim()))
      if (sawDelimiter && rawRows.length >= 1) {
        const headers = parseRow(rawRows[0])
        const rows = rawRows.slice(1).map(parseRow)
        children.push({
          type: 'table',
          version: 1,
          headers,
          rows,
        })
      } else {
        for (const tl of rawRows) {
          const cells = tl.split('|').filter(c => c.trim()).map(c => c.trim())
          children.push(paragraphNode(parseInline(cells.join(' | '))))
        }
      }
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^#{1,6}\s/) && !lines[i].trim().startsWith('|') && !/^[-*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i])
      i++
    }

    if (paraLines.length > 0) {
      children.push(paragraphNode(parseInline(paraLines.join(' '))))
    }
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
