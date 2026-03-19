import type { CollectionConfig } from 'payload'
import path from 'path'

const mediaDir = process.env.MEDIA_DIR || undefined

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
  },
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Default alt to filename without extension if empty
        if (!data.alt && data.filename) {
          const name = path.parse(data.filename).name
            .replace(/[-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          data.alt = name
        }
        return data
      },
    ],
  },
  upload: {
    ...(mediaDir ? { staticDir: mediaDir } : {}),
    crop: true,
    focalPoint: true,
    formatOptions: {
      format: 'jpeg',
      options: {
        quality: 92,
        mozjpeg: true,
      },
    },
    resizeOptions: {
      fit: 'cover',
      kernel: 'lanczos3',
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 85, mozjpeg: true } },
      },
      {
        name: 'card',
        width: 640,
        height: 430,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 90, mozjpeg: true } },
      },
      {
        name: 'mobileCard',
        width: 480,
        height: 480,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 90, mozjpeg: true } },
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 92, mozjpeg: true } },
      },
      {
        name: 'mobileHero',
        width: 800,
        height: 600,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 90, mozjpeg: true } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'focalpoint',
        formatOptions: { format: 'jpeg', options: { quality: 92, mozjpeg: true } },
      },
    ],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
    },
  ],
}
