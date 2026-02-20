// app/(public)/modules/page.tsx
import { prisma } from '@/lib/prisma'
import ModuleCard from '@/components/public/ModuleCard'
import { StaggerContainer, FadeIn } from '@/components/public/ScrollAnimations'
import type { Metadata } from 'next'

interface ModuleWithTopics {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  description: string | null
  _count: { topics: number }
  topics: { _count: { topicArticles: number } }[]
}

export const metadata: Metadata = {
  title: 'Learning Modules',
  description: 'Explore all 8 structured learning modules covering AI agents, LLMs, tools, memory, multi-agent systems, and more.',
}

export const revalidate = 60

export default async function ModulesPage() {
  let modules: ModuleWithTopics[] = []
  try {
    modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { topics: true } },
        topics: {
          where: { isPublished: true },
          select: { _count: { select: { topicArticles: true } } },
        },
      },
    })
  } catch {
    modules = []
  }

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <FadeIn>
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-medium uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: 'var(--bg-elevated)', color: 'var(--green)', border: '1px solid var(--bg-border)' }}>
            Curriculum
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Learning <span className="gradient-text">Modules</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {modules.length} comprehensive modules covering everything from AI fundamentals to production multi-agent deployment
          </p>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, i) => {
          const articleCount = mod.topics.reduce((sum: number, t) => sum + (t._count.topicArticles ?? 0), 0)
          return (
            <ModuleCard
              key={mod.id}
              id={mod.id}
              name={mod.name}
              slug={mod.slug}
              icon={mod.icon}
              color={mod.color}
              description={mod.description}
              topicCount={mod._count.topics}
              articleCount={articleCount}
              index={i}
            />
          )
        })}
      </StaggerContainer>

      {modules.length === 0 && (
        <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
          <p className="text-5xl mb-4">📚</p>
          <p className="text-lg">Modules coming soon</p>
        </div>
      )}
    </div>
  )
}
