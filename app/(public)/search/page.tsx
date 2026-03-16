// app/(public)/search/page.tsx
import SearchPageClient from '@/components/public/SearchPageClient'
import type { Metadata } from 'next'

interface Props { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: 'Search articles, topics, and modules on Applied Agentic AI.',
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  return <SearchPageClient initialQuery={q?.trim() ?? ''} />
}

