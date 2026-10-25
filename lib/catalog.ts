import type React from 'react'
// lib/catalog.ts
// Catalog data helpers: every visible NavMenu is a module, every NavSubMenu a
// chapter, every article a lesson. Module colours come from menu position.
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/** Module colour + readable text colour pairs. Each design defines --m1…--m8 and
 *  --on-m1…--on-m8 in styles/globals.css; modules cycle through them by position. */
export const PALETTE = Array.from({ length: 8 }, (_, i) => ({
  color: `var(--m${i + 1})`,
  fg: `var(--on-m${i + 1})`,
}))

export function swatch(index: number) {
  const i = ((index % PALETTE.length) + PALETTE.length) % PALETTE.length
  return PALETTE[i]
}

/** Inline style that sets --c (block colour) and --fg (text on it). */
export function swatchStyle(index: number): React.CSSProperties {
  const s = swatch(index)
  return { '--c': s.color, '--fg': s.fg } as React.CSSProperties
}

export interface NetworkZone {
  id: number
  title: string
  slug: string
  description: string | null
  stops: number
  minutes: number
}

export interface NetworkLine {
  id: number
  title: string
  slug: string
  description: string | null
  /** 1-based module number */
  number: number
  color: string
  fg: string
  zones: NetworkZone[]
  directStops: number
  stops: number
  minutes: number
}

const published = { article: { status: 'PUBLISHED' as const } }

/** All visible lines with their zones and journey totals. Cached per request. */
export const getNetwork = cache(async (): Promise<NetworkLine[]> => {
  try {
    const menus = await prisma.navMenu.findMany({
      where: { isVisible: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subMenus: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            articles: { where: published, select: { article: { select: { readingTimeMinutes: true } } } },
          },
        },
        menuArticles: { where: published, select: { article: { select: { readingTimeMinutes: true } } } },
      },
    })

    return menus.map((m, index) => {
      const zones: NetworkZone[] = m.subMenus.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        description: s.description,
        stops: s.articles.length,
        minutes: s.articles.reduce((sum, a) => sum + (a.article.readingTimeMinutes ?? 0), 0),
      }))
      const directMinutes = m.menuArticles.reduce((sum, a) => sum + (a.article.readingTimeMinutes ?? 0), 0)
      return {
        id: m.id,
        title: m.title,
        slug: m.slug,
        description: m.description,
        number: index + 1,
        color: swatch(index).color,
        fg: swatch(index).fg,
        zones,
        directStops: m.menuArticles.length,
        stops: zones.reduce((sum, z) => sum + z.stops, 0) + m.menuArticles.length,
        minutes: zones.reduce((sum, z) => sum + z.minutes, 0) + directMinutes,
      }
    })
  } catch (err) {
    logger.error('[catalog] DB error loading modules', err)
    return []
  }
})

/** Find the line a menu id belongs to (for colours on article pages). */
export async function getLineById(menuId: number | null | undefined): Promise<NetworkLine | null> {
  if (menuId == null) return null
  const network = await getNetwork()
  return network.find((l) => l.id === menuId) ?? null
}

export async function getLineBySlug(slug: string): Promise<NetworkLine | null> {
  const network = await getNetwork()
  return network.find((l) => l.slug === slug) ?? null
}

/** "1 h 12 min" style total reading time. */
export function formatJourney(minutes: number): string {
  if (!minutes || minutes < 1) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`
}

/** Serializable subset of the network for client components (nav, sheets). */
export interface ShellLine {
  id: number
  title: string
  slug: string
  number: number
  color: string
  fg: string
  zones: { id: number; title: string; slug: string; stops: number }[]
}

export function toShellLines(network: NetworkLine[]): ShellLine[] {
  return network.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    number: l.number,
    color: l.color,
    fg: l.fg,
    zones: l.zones.map((z) => ({ id: z.id, title: z.title, slug: z.slug, stops: z.stops })),
  }))
}

/** First line (in network order) among the menu ids an article is filed under. */
export function resolveLine(network: NetworkLine[], menuIds: (number | null | undefined)[]): NetworkLine | null {
  const ids = new Set(menuIds.filter((id): id is number => id != null))
  return network.find((l) => ids.has(l.id)) ?? null
}

/** Prisma select that returns the menus an article belongs to (for resolveLine). */
export const articleLineSelect = {
  subMenuArticles: { take: 3, select: { subMenu: { select: { menuId: true } } } },
  menuArticles: { take: 3, select: { menuId: true } },
} as const

export function menuIdsOf(a: { subMenuArticles?: { subMenu: { menuId: number } }[]; menuArticles?: { menuId: number }[] }): number[] {
  return [...(a.subMenuArticles ?? []).map((s) => s.subMenu.menuId), ...(a.menuArticles ?? []).map((m) => m.menuId)]
}

/** Roman numerals for module numbering (1 → I, 8 → VIII). */
export function toRoman(n: number): string {
  const map: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  let v = Math.max(1, Math.floor(n))
  for (const [k, r] of map) while (v >= k) { out += r; v -= k }
  return out
}
