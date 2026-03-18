import type { Field } from 'payload'
import {
  lexicalEditor,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  HeadingFeature,
  BlockquoteFeature,
  HorizontalRuleFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'

const newTabLinkFeature = () =>
  LinkFeature({
    fields: ({ defaultFields }) =>
      defaultFields.map((field) =>
        'name' in field && field.name === 'newTab'
          ? ({ ...field, defaultValue: true } as Field)
          : field,
      ),
  })

export const simplifiedEditor = lexicalEditor({
  features: () => [
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    newTabLinkFeature(),
    UnorderedListFeature(),
    FixedToolbarFeature(),
  ],
})

export const fullEditor = lexicalEditor({
  features: () => [
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    newTabLinkFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    FixedToolbarFeature(),
  ],
})
