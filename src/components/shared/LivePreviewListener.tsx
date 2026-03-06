'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface LivePreviewListenerProps {
  initialData: any
  serverURL: string
  depth?: number
}

export function LivePreviewListener({
  initialData,
  serverURL,
  depth = 2,
}: LivePreviewListenerProps) {
  const router = useRouter()
  const { data } = useLivePreview({
    initialData,
    serverURL,
    depth,
  })

  useEffect(() => {
    if (data !== initialData) {
      router.refresh()
    }
  }, [data, initialData, router])

  return null
}
