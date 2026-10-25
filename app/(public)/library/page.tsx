// app/(public)/library/page.tsx — the reader's own shelf (stored on their device)
import type { Metadata } from 'next'
import LibraryClient from '@/components/folio/LibraryClient'

export const metadata: Metadata = {
  title: 'Your library',
  description: 'Essays you saved, passages you highlighted and what you have read, kept on this device.',
  robots: { index: false },
}

export default function LibraryPage() {
  return <LibraryClient />
}
