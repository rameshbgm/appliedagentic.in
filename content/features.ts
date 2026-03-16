// content/features.ts
// Feature flags for the public site.
// Import this file in both server and client components — it is a plain TS module with no side-effects.
// Control flags via environment variables (see .env.example).

export const featureFlags = {
  /**
   * Set NEXT_PUBLIC_FEATURE_AI_SUMMARY=true in .env.local to enable AI Summary buttons.
   * Defaults to false (hidden) unless explicitly set to the string "true".
   */
  aiSummary: process.env.NEXT_PUBLIC_FEATURE_AI_SUMMARY === 'true',

  /**
   * Set NEXT_PUBLIC_FEATURE_API_CACHE=true to enable unstable_cache on public API endpoints.
   * When enabled, public article list / detail responses are cached for `cacheConfig.ttl` seconds.
   */
  apiCache: process.env.NEXT_PUBLIC_FEATURE_API_CACHE === 'true',
} as const

/** Server-side cache TTL configuration (seconds). */
export const cacheConfig = {
  /** Public article list (paginated). */
  articleList: parseInt(process.env.CACHE_TTL_ARTICLE_LIST ?? '300', 10),   // 5 min
  /** Single article detail page. */
  articleDetail: parseInt(process.env.CACHE_TTL_ARTICLE_DETAIL ?? '600', 10), // 10 min
} as const
