// agents/image-prompter/guardrails.ts

export const guardrails = `
## IMAGE PROMPT GUARDRAILS

- Output a SINGLE paragraph of plain text — no markdown, no lists, no JSON.
- The prompt MUST be safe-for-work (SFW) — no nudity, violence, gore, or offensive imagery.
- Do NOT reference real people, celebrities, politicians, or their likenesses.
- Do NOT request depictions of real-world trademarked logos or brand identities.
- Do NOT request images of real software UIs or copyrighted interfaces.
- Do NOT include text-rendering instructions (DALL-E cannot reliably render text).
- Keep the prompt between 50 and 200 words — concise but descriptive.
- Always align the visual style with a professional tech platform aesthetic.
`.trim()
