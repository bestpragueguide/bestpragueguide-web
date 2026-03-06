import { RichText } from '@payloadcms/richtext-lexical/react'

interface SafeRichTextProps {
  data: any
  className?: string
}

export function SafeRichText({ data, className }: SafeRichTextProps) {
  if (!data) return null

  // If it's a plain string (legacy data), render as paragraph
  if (typeof data === 'string') {
    return <p className={className}>{data}</p>
  }

  // If it's Lexical richText format
  if (data?.root) {
    return (
      <div className={className}>
        <RichText data={data} />
      </div>
    )
  }

  return null
}
