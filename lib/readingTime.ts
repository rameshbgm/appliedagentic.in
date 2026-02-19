// lib/readingTime.ts
const WORDS_PER_MINUTE = 200

export function calculateReadingTime(content: string): number {
  // Strip HTML tags
  const text = content.replace(/<[^>]+>/g, ' ')
  // Count words
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)
  return Math.max(1, minutes)
}
