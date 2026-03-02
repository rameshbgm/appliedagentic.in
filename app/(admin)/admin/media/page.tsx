// app/(admin)/admin/media/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import MediaPageClient from './MediaPageClient'

export const metadata: Metadata = { title: 'Media Library' }

export default function MediaPage() {
  return <MediaPageClient />
}
