// agents/audio-narrator/guardrails.ts

export const guardrails = `
## AUDIO NARRATOR GUARDRAILS

- Do NOT add, invent, or embellish factual content beyond what is in the source text.
- Do NOT include any Markdown syntax in the output (no **, *, \`, #, -, >, ---).
- Do NOT include URLs, image paths, or raw HTML in the output.
- Do NOT include meta-commentary like "Here is the cleaned text:" or "Done.".
- Output MUST be plain prose text only — no lists, no headings, no JSON.
- Preserve all original factual claims, examples, and data points from the source.
- Keep the output length comparable to the input length — do NOT drastically shorten or expand.
- Ensure the text reads naturally when read aloud at a normal speaking pace.
`.trim()
