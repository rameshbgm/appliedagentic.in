import { cache } from 'react'
import { prisma } from './prisma'
import { siteConfig } from '@/content/site'

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  return {
    siteName: settings?.siteName || siteConfig.name,
    siteUrl: settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://appliedagentic.in',
    showArticleImages: settings?.showArticleImages ?? true,
    tagline: settings?.tagline || null,
    metaDescription: settings?.metaDescription || siteConfig.description,
    footerText: settings?.footerText || null,
  }
})
