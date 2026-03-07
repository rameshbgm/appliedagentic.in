# Applied Agentic — AI Agents Architecture

> A developer guide explaining every agent, how the system was built, and
> how to extend it.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Directory Structure](#directory-structure)
4. [Shared Base (`agents/base.ts`)](#shared-base)
5. [Agent Catalogue](#agent-catalogue)
   - [Article Generator](#article-generator)
   - [Content Writer](#content-writer)
   - [SEO Optimizer](#seo-optimizer)
   - [Tags Generator](#tags-generator)
   - [Summarizer](#summarizer)
   - [Audio Narrator](#audio-narrator)
   - [Image Prompter](#image-prompter)
6. [Cloud Delegate Workflow](#cloud-delegate-workflow)
7. [How to Add a New Agent](#how-to-add-a-new-agent)
8. [Environment Variables](#environment-variables)
9. [Switching Providers](#switching-providers)

---

## Overview

Applied Agentic uses a **LangChain-based multi-agent architecture** where each
specialised AI task lives in its own directory under `agents/`.

All agents:
- Run **server-side only** (never imported in React client components)
- Are invoked through **Next.js API Route Handlers** (`app/api/…`)
- Share a **common execution engine** (`agents/base.ts`) that handles LLM
  creation, prompt templating, logging, and token usage tracking
- Support both **Google Gemini** and **OpenAI** via a single `provider` config
  flag

---

## Core Concepts

### AgentConfig

```ts
// agents/types.ts
interface AgentConfig {
  provider: 'openai' | 'gemini'  // which LLM backend to use
  textModel: string               // model ID, e.g. "gemini-3-flash-preview"
  temperature: number             // 0–2; higher = more creative
  maxTokens: number               // maximum output token budget
  streaming: boolean              // whether to stream the response
}
```

### AgentInput

```ts
interface AgentInput {
  prompt: string      // the main instruction/request
  context?: string    // optional extra context injected before the prompt
  maxTokens?: number  // per-call override
  temperature?: number
}
```

### AgentOutput

```ts
interface AgentOutput {
  text: string           // raw model response
  provider: string       // 'openai' | 'gemini'
  model: string          // model ID used
  usage?: {
    inputTokens?: number
    outputTokens?: number
  }
}
```

---

## Directory Structure

```
agents/
├── base.ts                  ← shared LLM runner (LangChain chain)
├── types.ts                 ← shared TypeScript interfaces
├── index.ts                 ← convenience re-exports
│
├── article-generator/
│   ├── agent.ts             ← runArticleGenerator()
│   ├── config.ts            ← provider / model / temperature
│   ├── system-prompt.ts     ← LLM system instructions
│   └── guardrails.ts        ← safety / output-format rules
│
├── content-writer/
│   ├── agent.ts             ← runContentWriter()
│   ├── config.ts
│   ├── system-prompt.ts
│   └── guardrails.ts
│
├── seo-optimizer/
│   ├── agent.ts             ← runSeoOptimizer()
│   ├── config.ts
│   ├── system-prompt.ts
│   └── guardrails.ts
│
├── tags-generator/
│   ├── agent.ts             ← runTagsGenerator()
│   ├── config.ts
│   ├── system-prompt.ts
│   └── guardrails.ts
│
├── summarizer/
│   ├── agent.ts             ← runSummarizer()
│   ├── config.ts
│   ├── system-prompt.ts
│   └── guardrails.ts
│
├── audio-narrator/
│   ├── agent.ts             ← runAudioNarrator()
│   ├── config.ts
│   ├── system-prompt.ts
│   └── guardrails.ts
│
└── image-prompter/
    ├── agent.ts             ← runImagePrompter()
    ├── config.ts
    ├── system-prompt.ts
    └── guardrails.ts
```

Each agent folder follows the same four-file pattern:

| File | Purpose |
|------|---------|
| `config.ts` | LLM provider, model name, temperature, token budget |
| `system-prompt.ts` | String exported as `systemPrompt` — the persona / instructions |
| `guardrails.ts` | String exported as `guardrails` — appended to system prompt; enforces output format and safety |
| `agent.ts` | Typed `run…()` function that calls `runAgent()`, parses the response, and returns a typed output |

---

## Shared Base

**`agents/base.ts`** is the single execution engine shared by all agents.

```ts
// Simplified signature
export async function runAgent(
  config: AgentConfig,
  systemPrompt: string,
  guardrails: string,
  input: AgentInput,
): Promise<AgentOutput>
```

**What it does:**

1. Creates the LLM instance using LangChain:
   - `ChatGoogleGenerativeAI` for Gemini
   - `ChatOpenAI` for OpenAI
2. Merges `systemPrompt` + `guardrails` into the system message
3. Escapes curly braces in the system prompt to prevent LangChain variable
   interpolation conflicts with JSON examples
4. Builds a `ChatPromptTemplate` with an optional `{context}` block before
   `{prompt}`
5. Invokes the chain via `.pipe(llm).invoke({…})`
6. Extracts token usage from `response_metadata`
7. Logs the AI call via `logger.ai(…)` for observability
8. Returns `{ text, provider, model, usage }`

---

## Agent Catalogue

### Article Generator

**File:** `agents/article-generator/agent.ts`
**API Route:** `POST /api/ai/generate-article`

Generates a **complete article** — title, slug, summary, multi-section content,
SEO metadata, and tags — from a topic prompt.

```ts
const result = await runArticleGenerator({
  prompt: 'Building a ReAct Agent with LangChain and Gemini',
  context: 'Target audience: mid-level engineers familiar with Python.',
  tone: 'technical',
  length: 'long',        // 'short' | 'medium' | 'long' | 'extra-long' | 'comprehensive'
  format: 'tutorial',    // 'article' | 'listicle' | 'how-to' | 'tutorial' | …
  mode: 'generate',      // 'generate' | 'outline' | 'expand' | 'rewrite' | …
  sectionCount: 5,
  exclude: 'LangGraph, AutoGPT',
  urls: ['https://…'],          // optional reference URLs (fetched by the API route)
  attachments: [{ name, content, type }],  // optional file attachments
})

// result.title, result.sections[].title, result.sections[].content
// result.seoTitle, result.seoDescription, result.tags, …
```

**Output fields:**
- `title`, `slug`, `summary`
- `sections[]` — `{ title: string; content: string }` array
- `seoTitle`, `seoDescription`, `seoKeywords`
- `ogTitle`, `ogDescription`
- `twitterTitle`, `twitterDescription`
- `tags[]`

---

### Content Writer

**File:** `agents/content-writer/agent.ts`
**API Route:** `POST /api/ai/write-section`

Writes or rewrites a **single section's content** given a title and optional
context.

```ts
const result = await runContentWriter({
  prompt: 'Write a section titled "Installing dependencies"',
  context: 'The article is about setting up LangChain in a Next.js project.',
})

// result.text  — markdown content for the section
```

---

### SEO Optimizer

**File:** `agents/seo-optimizer/agent.ts`
**API Routes:** `POST /api/ai/generate-meta`, `POST /api/ai/delegate`

Generates all **SEO + social metadata** for an article.

```ts
const result = await runSeoOptimizer({
  prompt: 'Article title: Building a ReAct Agent with LangChain',
  context: articleContent.slice(0, 3000),
})

result.seoTitle        // ≤ 60 chars
result.seoDescription  // ≤ 160 chars
result.seoKeywords     // comma-separated string
result.ogTitle         // ≤ 70 chars
result.ogDescription   // ≤ 200 chars
result.twitterTitle    // ≤ 70 chars
result.twitterDescription  // ≤ 200 chars
result.tags            // string[] (bonus output from same prompt)
```

The agent internally parses the model's JSON output and enforces character
limits.

---

### Tags Generator

**File:** `agents/tags-generator/agent.ts`
**API Routes:** `POST /api/ai/generate-tags`, `POST /api/ai/delegate`

Generates up to **10 relevant lowercase tags** for an article.

```ts
const result = await runTagsGenerator({
  prompt: `Article title: ${title}\n\nContent excerpt:\n${content.slice(0, 2000)}`,
})

result.tags  // string[], e.g. ['langchain', 'react agent', 'gemini', …]
```

The agent expects a JSON array response (stripped of markdown fences if present).

---

### Summarizer

**File:** `agents/summarizer/agent.ts`
**API Route:** `POST /api/ai/summarize`

Produces a **bullet-point summary** of an article or a single section.

```ts
const result = await runSummarizer({
  prompt: 'Summarize the following content.',
  context: sectionContent,
  scope: 'section',   // 'article' | 'section'
})

result.text     // raw markdown bullets
result.bullets  // string[] — split on bullet markers
```

The scope hint instructs the model to return 2–3 bullets for sections or 3–7
for full articles.

---

### Audio Narrator

**File:** `agents/audio-narrator/agent.ts`
**API Route:** `POST /api/ai/narrate`

Converts an article section's markdown content into **narration-ready prose**
(removes code blocks, normalises markdown syntax for text-to-speech). The
output text is then sent to a TTS provider (e.g. OpenAI TTS) to produce an
audio file.

```ts
const result = await runAudioNarrator({
  prompt: 'Convert the following article section to spoken narration:',
  context: sectionMarkdown,
})

result.text  // clean prose ready for TTS
```

---

### Image Prompter

**File:** `agents/image-prompter/agent.ts`
**API Route:** `POST /api/ai/generate-image` (prompt-generation step)

Given an article topic or partial prompt, generates an **optimised image
generation prompt** for use with DALL-E or Gemini image models.

```ts
const result = await runImagePrompter({
  prompt: 'Cover image for an article about ReAct agents',
})

result.text  // e.g. "A photorealistic neural network diagram with glowing nodes…"
```

---

## Cloud Delegate Workflow

The **Delegate to Cloud Agent** feature (`POST /api/ai/delegate`) runs the
SEO + tagging pipeline on an already-saved article in a single request:

```
Editor or List                API Route                  Agents
─────────────────────────────────────────────────────────────────
Click "Delegate"         →   POST /api/ai/delegate
                             { articleId }
                                │
                                ├── Fetch article from DB
                                │
                                ├── runSeoOptimizer()  ──►  Gemini Flash
                                ├── runTagsGenerator() ──►  Gemini Flash
                                │     (in parallel via Promise.all)
                                │
                                ├── Upsert tags to DB
                                ├── Update article SEO fields (transaction)
                                │
                                └── Return enriched payload
                                        │
                         ◄──────────────┘
                    Update editor state (SEO + tags)
                    toast.success(…)
```

The key benefit: **saves → enriches → persists** atomically, so a single click
commits the current draft and hands off the heavy LLM work to the server.

---

## How to Add a New Agent

1. **Create the directory:**
   ```bash
   mkdir agents/my-agent
   ```

2. **`config.ts`** — pick your provider and model:
   ```ts
   import type { AgentConfig } from '../types'

   export const config: AgentConfig = {
     provider: 'gemini',
     textModel: 'gemini-3-flash-preview',
     temperature: 0.5,
     maxTokens: 2048,
     streaming: false,
   }
   ```

3. **`system-prompt.ts`** — write your persona:
   ```ts
   export const systemPrompt = `
   You are an expert technical editor. Your job is to …
   Return your response as a JSON object with the following keys: …
   `
   ```

4. **`guardrails.ts`** — enforce output rules:
   ```ts
   export const guardrails = `
   - Always respond in valid JSON.
   - Never include markdown fences in the JSON.
   - If you cannot complete the task, return { "error": "reason" }.
   `
   ```

5. **`agent.ts`** — implement the typed runner:
   ```ts
   import { runAgent }     from '../base'
   import { config }       from './config'
   import { systemPrompt } from './system-prompt'
   import { guardrails }   from './guardrails'
   import type { AgentInput, AgentOutput } from '../types'

   export interface MyAgentInput extends AgentInput {
     prompt: string
   }

   export interface MyAgentOutput extends AgentOutput {
     result: string
   }

   export async function runMyAgent(input: MyAgentInput): Promise<MyAgentOutput> {
     const raw = await runAgent(config, systemPrompt, guardrails, input)
     // parse raw.text …
     return { ...raw, result: parsed }
   }
   ```

6. **Create an API route** in `app/api/ai/my-agent/route.ts`:
   ```ts
   import { NextRequest } from 'next/server'
   import { auth }        from '@/lib/auth'
   import { apiSuccess, apiError } from '@/lib/utils'
   import { runMyAgent }  from '@/agents/my-agent/agent'

   export async function POST(req: NextRequest) {
     const session = await auth()
     if (!session) return apiError('Unauthorized', 401)
     const { prompt } = await req.json()
     const result = await runMyAgent({ prompt })
     return apiSuccess(result)
   }
   ```

7. **Call it from a client component:**
   ```ts
   const res = await fetch('/api/ai/my-agent', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ prompt }),
   })
   const data = await res.json()
   ```

---

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `GOOGLE_GENAI_API_KEY` | All Gemini agents | Google AI Studio / Vertex API key |
| `OPENAI_API_KEY` | All OpenAI agents | OpenAI platform API key |
| `NEXT_PUBLIC_SITE_URL` | Metadata generation | Public base URL of the site |

---

## Switching Providers

Every agent declares its provider in `config.ts`. To switch an agent from
Gemini to OpenAI (or vice versa), edit two lines:

```diff
// agents/seo-optimizer/config.ts
 export const config: AgentConfig = {
-  provider: 'gemini',
-  textModel: 'gemini-3-flash-preview',
+  provider: 'openai',
+  textModel: 'gpt-4o-mini',
   temperature: 0.4,
   maxTokens: 1024,
   streaming: false,
 }
```

No other code changes are needed — `agents/base.ts` selects the correct
LangChain chat model automatically.

---

*Last updated: March 2026*
