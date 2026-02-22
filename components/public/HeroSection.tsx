// components/public/HeroSection.tsx
// Server component — fetches live counts, renders the client hero

import { prisma }  from '@/lib/prisma'
import { logger }  from '@/lib/logger'
import HeroClient  from './HeroClient'

export default async function HeroSection() {
  let moduleCount  = 0
  let articleCount = 0

  try {
    const [mc, ac] = await Promise.all([
      prisma.module.count({ where: { isPublished: true } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ])
    moduleCount  = mc
    articleCount = ac
  } catch (err) {
    logger.error('[HeroSection] Failed to fetch hero stats', err)
  }

  return <HeroClient moduleCount={moduleCount} articleCount={articleCount} />
}
