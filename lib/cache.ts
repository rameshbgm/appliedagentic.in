// lib/cache.ts — thin wrapper around Next.js unstable_cache, gated by featureFlags.apiCache.
// When the flag is off, the wrapped function is called directly (zero overhead).
import { unstable_cache, revalidateTag } from 'next/cache'
import { featureFlags, cacheConfig } from '@/content/features'

type CacheScope = keyof typeof cacheConfig

/**
 * Conditionally wraps an async function with Next.js `unstable_cache`.
 * Returns the function as-is when `featureFlags.apiCache` is false.
 *
 * @param fn        The async function to cache
 * @param keyParts  Unique key segments (same semantics as unstable_cache)
 * @param scope     Which TTL bucket to use from cacheConfig
 * @param tags      Cache tags for targeted invalidation via `invalidateCache()`
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  scope: CacheScope,
  tags: string[] = [],
): T {
  if (!featureFlags.apiCache) return fn
  return unstable_cache(fn, keyParts, {
    revalidate: cacheConfig[scope],
    tags,
  }) as unknown as T
}

/** Bust cache entries matching a tag. Only effective when apiCache is enabled. */
export function invalidateCache(...tags: string[]) {
  if (!featureFlags.apiCache) return
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }
}
