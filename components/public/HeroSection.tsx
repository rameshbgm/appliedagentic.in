// components/public/HeroSection.tsx
// Server component — fetches live counts, renders the client hero

import { prisma }  from '@/lib/prisma'
import { logger }  from '@/lib/logger'
import HeroClient  from './HeroClient'

export default async function HeroSection() {
  let menuCount    = 0
  let articleCount = 0

  try {
    const [mc, ac] = await Promise.all([
      prisma.navMenu.count({ where: { isVisible: true } }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ])
    menuCount    = mc
    articleCount = ac
  } catch (err) {
    logger.error('[HeroSection] Failed to fetch hero stats', err)
  }

  return <HeroClient menuCount={menuCount} articleCount={articleCount} />
}
