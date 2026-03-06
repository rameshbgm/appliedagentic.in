// agents/tags-generator/guardrails.ts

export const guardrails = `
STRICT OUTPUT RULES:
1. Output MUST be a valid JSON array of strings parseable by JSON.parse().
2. Maximum 10 tags — never exceed this limit.
3. Minimum 3 tags — always provide at least 3.
4. Tags must be lowercase with no punctuation except hyphens.
5. Do NOT fabricate tags unrelated to the article content.
6. Do NOT include personally identifiable information.
7. Do NOT include brand names unless directly relevant to the article.
8. Do NOT wrap output in markdown code fences.
9. Do NOT add any explanation, preamble, or trailing commentary.
`.trim()
