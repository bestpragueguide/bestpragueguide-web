/**
 * Convert plain text to Lexical JSON structure for richText fields.
 * Use when saving form-submitted text to Payload richText fields.
 */
export function textToLexicalJson(text: string) {
  if (!text) return undefined
  return {
    root: {
      type: 'root',
      children: text
        .split('\n')
        .filter(Boolean)
        .map((paragraph: string) => ({
          type: 'paragraph',
          children: [{ type: 'text', text: paragraph, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
