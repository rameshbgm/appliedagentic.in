// app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let menus: { slug: string; updatedAt: Date }[] = []
  let subMenus: { slug: string; updatedAt: Date; menu: { slug: string } }[] = []
  let articles: { slug: string; updatedAt: Date }[] = []

  try {
    ;[menus, subMenus, articles] = await Promise.all([
      prisma.navMenu.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
      prisma.navSubMenu.findMany({
        where: { isVisible: true, menu: { isVisible: true } },
        select: { slug: true, updatedAt: true, menu: { select: { slug: true } } },
      }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    ])
  } catch {
    // Keep static entry points available if the database is unavailable.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/search`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  const menuRoutes: MetadataRoute.Sitemap = menus.map((m) => ({
    url: `${BASE_URL}/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const moduleRoutes: MetadataRoute.Sitemap = subMenus.map((m) => ({
    url: `${BASE_URL}/${m.menu.slug}/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...menuRoutes, ...moduleRoutes, ...articleRoutes]
}
