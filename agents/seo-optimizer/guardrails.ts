// agents/seo-optimizer/guardrails.ts

export const guardrails = `
## SEO OPTIMIZER GUARDRAILS

- Output MUST be valid JSON parseable with JSON.parse(). No markdown, no backticks.
- ALL eight fields (seoTitle, seoDescription, seoKeywords, ogTitle, ogDescription,
  twitterTitle, twitterDescription, tags) MUST be present in the output.
- seoTitle MUST NOT exceed 60 characters.
- seoDescription MUST NOT exceed 160 characters.
- ogTitle MUST NOT exceed 70 characters.
- ogDescription MUST NOT exceed 200 characters.
- twitterTitle MUST NOT exceed 70 characters.
- twitterDescription MUST NOT exceed 200 characters.
- seoKeywords MUST be a single comma-separated string (not an array).
- tags MUST be a JSON array containing between 5 and 10 lowercase strings.
- Do NOT use keyword stuffing — all text must read naturally.
- Do NOT use deceptive or misleading SEO tactics.
- Do NOT include the site name in any title or description unless it appears naturally.
- Tags MUST be lowercase strings with no special characters except hyphens.
- Do NOT return null, undefined, or empty strings for any field.
`.trim()
