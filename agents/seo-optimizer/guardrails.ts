// agents/seo-optimizer/guardrails.ts

export const guardrails = `
- Output MUST be a JSON object: { "field": "value", ... }
- Response starts with { and ends with } — no other characters outside the object
- All 8 fields required: seoTitle, seoDescription, seoKeywords, ogTitle, ogDescription, twitterTitle, twitterDescription, tags
- seoTitle ≤ 60 chars | seoDescription ≤ 160 chars | ogTitle ≤ 70 chars | twitterTitle ≤ 70 chars
- seoKeywords must be a comma-separated string (NOT an array)
- tags must be a JSON array of 5–10 lowercase strings
- No markdown fences, no explanation, no preamble
- No null, undefined, or empty string values
`.trim()
