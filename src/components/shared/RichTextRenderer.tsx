import React from 'react'
import {
  type SerializedEditorState,
} from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

interface RichTextRendererProps {
  content: SerializedEditorState | null | undefined
}

export default function RichText({ content }: RichTextRendererProps) {
  if (!content) return null
  return <PayloadRichText data={content} />
}
