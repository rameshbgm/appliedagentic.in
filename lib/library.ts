// lib/library.ts
// The reader's personal library, kept in localStorage on their device:
// reading progress per article, bookmarks and saved highlights.
// Client-only. Every read/write tolerates missing or blocked storage.

export interface ProgressEntry {
  slug: string
  title: string
  /** 0–1 */
  pct: number
  /** scroll position in px, for "continue where you left off" */
  y: number
  color?: string
  module?: string
  updated: number
}

export interface Bookmark {
  slug: string
  title: string
  module?: string
  color?: string
  added: number
}

export interface Highlight {
  id: string
  slug: string
  title: string
  text: string
  added: number
}

const KEYS = {
  progress: 'folio-progress',
  bookmarks: 'folio-bookmarks',
  highlights: 'folio-highlights',
} as const

export const LIBRARY_EVENT = 'folio-library'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(LIBRARY_EVENT))
  } catch {
    /* storage unavailable */
  }
}

export const getProgressMap = () => read<Record<string, ProgressEntry>>(KEYS.progress, {})
export const getProgress = (slug: string) => getProgressMap()[slug] ?? null

export function saveProgress(entry: Omit<ProgressEntry, 'updated'>) {
  const map = getProgressMap()
  const prev = map[entry.slug]
  // Keep the furthest point reached so a quick scroll to the top doesn't erase it
  map[entry.slug] = { ...entry, pct: Math.max(entry.pct, prev?.pct ?? 0), updated: Date.now() }
  write(KEYS.progress, map)
}

/** Most recently opened articles that are started but not finished. */
export function getInProgress(limit = 8): ProgressEntry[] {
  return Object.values(getProgressMap())
    .filter((p) => p.pct > 0.03 && p.pct < 0.97)
    .sort((a, b) => b.updated - a.updated)
    .slice(0, limit)
}

export function getHistory(limit = 30): ProgressEntry[] {
  return Object.values(getProgressMap()).sort((a, b) => b.updated - a.updated).slice(0, limit)
}

export const getBookmarks = () => read<Bookmark[]>(KEYS.bookmarks, [])
export const isBookmarked = (slug: string) => getBookmarks().some((b) => b.slug === slug)

export function toggleBookmark(b: Omit<Bookmark, 'added'>): boolean {
  const list = getBookmarks()
  const exists = list.some((x) => x.slug === b.slug)
  write(KEYS.bookmarks, exists ? list.filter((x) => x.slug !== b.slug) : [{ ...b, added: Date.now() }, ...list])
  return !exists
}

export const getHighlights = (slug?: string) => {
  const all = read<Highlight[]>(KEYS.highlights, [])
  return slug ? all.filter((h) => h.slug === slug) : all
}

export function addHighlight(h: Omit<Highlight, 'id' | 'added'>) {
  const all = read<Highlight[]>(KEYS.highlights, [])
  if (all.some((x) => x.slug === h.slug && x.text === h.text)) return
  write(KEYS.highlights, [...all, { ...h, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, added: Date.now() }])
}

export function removeHighlight(id: string) {
  write(KEYS.highlights, read<Highlight[]>(KEYS.highlights, []).filter((h) => h.id !== id))
}

/** Minutes read in the last 7 days, estimated from progress entries. */
export function weeklySummary(): { articles: number; finished: number } {
  const weekAgo = Date.now() - 7 * 864e5
  const recent = Object.values(getProgressMap()).filter((p) => p.updated > weekAgo)
  return { articles: recent.length, finished: recent.filter((p) => p.pct >= 0.97).length }
}
