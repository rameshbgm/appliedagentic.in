// app/api/ai/delegate/route.ts
// "Delegate to cloud agent" — runs the AI enrichment pipeline (SEO metadata
// + tags) for a saved article and persists the results.
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { apiSuccess, apiError } from '@/lib/utils'
import { runSeoOptimizer } from '@/agents/seo-optimizer/agent'
import { runTagsGenerator } from '@/agents/tags-generator/agent'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const { articleId } = body

    if (!articleId) return apiError('articleId is required', 422)

    // ── 1. Fetch the article ──
    const article = await prisma.article.findUnique({
      where: { id: Number(articleId) },
      select: {
        id: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogTitle: true,
        ogDescription: true,
        twitterTitle: true,
        twitterDescription: true,
        sections: { select: { content: true }, orderBy: { order: 'asc' } },
      },
    })

    if (!article) return apiError('Article not found', 404)

    const contentExcerpt = article.sections
      .map((s) => s.content)
      .join('\n')
      .slice(0, 3000)

    // ── 2. Run SEO optimiser and tags generator in parallel ──
    const [seoResult, tagsResult] = await Promise.all([
      runSeoOptimizer({
        prompt: article.title,
        context: contentExcerpt,
      }),
      runTagsGenerator({
        prompt: `Article title: ${article.title}\n\nContent excerpt:\n${contentExcerpt.slice(0, 2000)}`,
      }),
    ])

    const newTagNames: string[] = (tagsResult.tags ?? [])
      .slice(0, 10)
      .map((t: string) => t.toLowerCase().trim())
      .filter(Boolean)

    // ── 3. Upsert tags (name + slug) ──
    const tagRecords = await Promise.all(
      newTagNames.map((name) =>
        prisma.tag.upsert({
          where: { slug: slugify(name) },
          create: { name, slug: slugify(name) },
          update: {},
          select: { id: true, name: true },
        }),
      ),
    )

    // ── 4. Persist enriched data + replace article tags ──
    const enriched = {
      seoTitle:             (seoResult.seoTitle           ?? article.seoTitle  ?? '').slice(0, 60),
      seoDescription:       (seoResult.seoDescription     ?? article.seoDescription ?? '').slice(0, 160),
      seoKeywords:          seoResult.seoKeywords          ?? article.seoKeywords ?? '',
      ogTitle:              (seoResult.ogTitle             ?? article.ogTitle   ?? '').slice(0, 70),
      ogDescription:        (seoResult.ogDescription       ?? article.ogDescription ?? '').slice(0, 200),
      twitterTitle:         (seoResult.twitterTitle        ?? article.twitterTitle ?? '').slice(0, 70),
      twitterDescription:   (seoResult.twitterDescription  ?? article.twitterDescription ?? '').slice(0, 200),
      aiContentDeclaration: 'ai-assisted' as const,
    }

    await prisma.$transaction([
      prisma.articleTag.deleteMany({ where: { articleId: article.id } }),
      ...(tagRecords.length > 0
        ? [
            prisma.articleTag.createMany({
              data: tagRecords.map((tag) => ({ articleId: article.id, tagId: tag.id })),
              skipDuplicates: true,
            }),
          ]
        : []),
      prisma.article.update({
        where: { id: article.id },
        data: enriched,
      }),
    ])

    return apiSuccess({
      ...enriched,
      tags: tagRecords.map((t) => t.name),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Delegation failed'
    return apiError(`[POST /api/ai/delegate] ${message}`, 500, err)
  }
}
