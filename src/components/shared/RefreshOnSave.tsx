'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || ''

export function RefreshOnSave() {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
}
