// app/(admin)/admin/settings/page.tsx
export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import SettingsPageClient from './SettingsPageClient'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return <SettingsPageClient />
}
