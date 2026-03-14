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
} as const
