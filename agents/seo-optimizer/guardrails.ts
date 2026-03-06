// agents/seo-optimizer/guardrails.ts

export const guardrails = `
## SEO OPTIMIZER GUARDRAILS

- Output MUST be valid JSON parseable with JSON.parse(). No markdown, no backticks.
- seoTitle MUST NOT exceed 60 characters.
- seoDescription MUST NOT exceed 160 characters.
- tags array MUST contain between 5 and 10 items.
- Do NOT use keyword stuffing — titles and descriptions must read naturally.
- Do NOT use deceptive or misleading SEO tactics.
- Do NOT include the site name ("Applied Agentic AI") in the title unless it appears naturally.
- Tags MUST be lowercase strings with no special characters except hyphens.
- Do NOT return null, undefined, or empty strings for any field.
`.trim()
