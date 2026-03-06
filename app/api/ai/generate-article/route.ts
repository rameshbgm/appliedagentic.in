// app/api/ai/generate-article/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { runArticleGenerator } from '@/agents/article-generator/agent'

// ---------------------------------------------------------------------------
// URL content extractor — strips HTML tags, scripts, styles, nav, footer
// to leave readable body text.
// ---------------------------------------------------------------------------
function extractTextFromHtml(html: string): string {
  return html
    // Remove script and style blocks
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    // Remove nav, header, footer, aside (boilerplate)
    .replace(/<(nav|header|footer|aside|noscript)[\s\S]*?<\/\1>/gi, '')
    // Replace block tags with newlines
    .replace(/<\/(p|div|section|article|li|h[1-6]|blockquote|pre)>/gi, '\n')
    // Replace <br> with newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip all remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function fetchUrlContent(url: string): Promise<string> {
  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 15000) // 15s timeout per URL
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AppliedAgenticBot/1.0; +https://appliedagentic.in)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return `[Failed to fetch ${url}: HTTP ${res.status}]`
    const contentType = res.headers.get('content-type') ?? ''
    const text = await res.text()
    if (contentType.includes('text/html')) {
      const extracted = extractTextFromHtml(text)
      // Limit per URL to avoid blowing context window
      return `[Source: ${url}]\n${extracted.slice(0, 6000)}`
    }
    // Plain text, markdown, JSON, etc.
    return `[Source: ${url}]\n${text.slice(0, 6000)}`
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return `[Could not fetch ${url}: ${msg}]`
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('Unauthorized', 401)

  try {
    const body = await req.json()
    const {
      prompt,
      context,
      mode = 'generate',
      tone = 'professional',
      length = 'medium',
      format = 'article',
      url,          // legacy single URL (kept for backwards compat)
      urls = [],    // multiple URLs
      attachments = [], // [{ name: string; content: string; type: string }]
      exclude,
    } = body

    if (!prompt?.trim()) return apiError('Article topic is required', 422)

    // ── 1. Collect URLs (merge legacy `url` into `urls` array) ──
    const allUrls: string[] = [
      ...(url ? [url] : []),
      ...(Array.isArray(urls) ? urls.filter((u: string) => u?.trim()) : []),
    ]

    // ── 2. Fetch URL contents in parallel ──
    const urlContents = await Promise.all(allUrls.map(fetchUrlContent))

    // ── 3. Collect attachment text ──
    const attachmentTexts: string[] = (attachments as { name: string; content: string }[])
      .filter((a) => a?.content?.trim())
      .map((a) => `[Attachment: ${a.name}]\n${a.content.slice(0, 8000)}`)

    // ── 4. Assemble reference content ──
    const allReferenceChunks = [...urlContents, ...attachmentTexts].filter(Boolean)
    const referenceContent = allReferenceChunks.length
      ? allReferenceChunks.join('\n\n---\n\n')
      : undefined

    // ── 5. Run the agent ──
    const result = await runArticleGenerator({
      prompt,
      context,
      mode,
      tone,
      length,
      format,
      url: allUrls[0],
      exclude,
      referenceContent,
    })

    return apiSuccess({
      title:               result.title,
      slug:                result.slug,
      summary:             result.summary,
      content:             result.content,
      sections:            result.sections,
      seoTitle:            result.seoTitle,
      seoDescription:      result.seoDescription,
      seoKeywords:         result.seoKeywords,
      ogTitle:             result.ogTitle,
      ogDescription:       result.ogDescription,
      twitterTitle:        result.twitterTitle,
      twitterDescription:  result.twitterDescription,
      tags:                result.tags,
      // Meta for client
      referenceSourceCount: allUrls.length + attachmentTexts.length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Article generation failed'
    return apiError(`[POST /api/ai/generate-article] ${message}`, 500, err)
  }
}
