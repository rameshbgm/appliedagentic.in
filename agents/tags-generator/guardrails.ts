// agents/tags-generator/guardrails.ts

export const guardrails = `
- Output MUST be a JSON array of strings: [ "tag", "tag", ... ]
- Response starts with [ and ends with ] — no other characters outside the array
- 5 to 10 tags, all lowercase, 1–3 words each, hyphens allowed
- No markdown fences, no explanation, no preamble
- No empty strings, no duplicates
`.trim()
