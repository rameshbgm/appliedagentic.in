// app/sitemap.ts
import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://appliedagentic.in'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let modules: { slug: string; updatedAt: Date }[] = []
  let topics: { slug: string; updatedAt: Date }[] = []
  let articles: { slug: string; publishedAt: Date | null; updatedAt: Date }[] = []

  try {
    ;[modules, topics, articles] = await Promise.all([
      prisma.module.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.topic.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, publishedAt: true, updatedAt: true } }),
    ])
  } catch {
    // Return static routes only if database is unavailable
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/modules`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/articles`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  const moduleRoutes: MetadataRoute.Sitemap = modules.map((m) => ({
    url: `${BASE_URL}/modules/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const topicRoutes: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${BASE_URL}/topics/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE_URL}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...moduleRoutes, ...topicRoutes, ...articleRoutes]
}
