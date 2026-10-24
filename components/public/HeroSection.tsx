// components/public/HeroSection.tsx
// Server component — fetches live counts, renders the client hero

import { prisma }  from '@/lib/prisma'
import { logger }  from '@/lib/logger'
import HeroClient  from './HeroClient'

export default async function HeroSection() {
  let moduleCount: number | null = null
  let articleCount: number | null = null

  try {
    const [mc, ac] = await Promise.all([
      prisma.navSubMenu.count({ where: { isVisible: true, menu: { isVisible: true } } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ])
    moduleCount  = mc
    articleCount = ac
  } catch (err) {
    logger.error('[HeroSection] Failed to fetch hero stats', err)
  }

  return <HeroClient moduleCount={moduleCount} articleCount={articleCount} />
}
