// agents/summarizer/guardrails.ts

export const guardrails = `
## SUMMARIZER GUARDRAILS

- Do NOT fabricate facts, statistics, or claims not present in the source text.
- Do NOT editorialize — summaries must be neutral and factual.
- Do NOT produce more than 7 bullets for an article summary.
- Do NOT produce more than 3 bullets for a section summary.
- Each bullet MUST be a complete sentence.
- Do NOT begin bullets with "This article" or "The author".
- Do NOT include harmful, offensive, or discriminatory content in any summary.
- If the input text is empty or too short to summarize, return a single bullet:
  "- Insufficient content to summarize."
`.trim()
