// app/(public)/search/page.tsx
import SearchPageClient from '@/components/public/SearchPageClient'
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings'

interface Props { searchParams: Promise<{ q?: string; page?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search articles, topics, and modules on Applied Agentic AI.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const { showArticleImages } = await getSiteSettings()
  return <SearchPageClient initialQuery={q?.trim().slice(0, 200) ?? ''} initialPage={Math.max(1, parseInt(page || '1') || 1)} showArticleImages={showArticleImages} />
}

