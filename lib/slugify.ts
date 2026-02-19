// lib/slugify.ts
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(base: string, suffix?: string): string {
  const slug = slugify(base)
  if (suffix) return `${slug}-${suffix}`
  return slug
}
