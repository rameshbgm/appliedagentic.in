// agents/image-prompter/agent.ts
// Image Prompter agent — generates optimised DALL-E / Imagen prompts from article content.
// SERVER-SIDE ONLY.

import { runAgent }     from '../base'
import { config }       from './config'
import { systemPrompt } from './system-prompt'
import { guardrails }   from './guardrails'
import type { AgentInput, AgentOutput } from '../types'

export interface ImagePrompterInput extends AgentInput {
  /**
   * Article topic, title, or short description of what the image should represent.
   * Example: "ReAct agent reasoning loop with tool calls"
   */
  prompt: string
  /** Optional: content snippet to give the agent more context */
  context?: string
  /** Target image generation service — affects style hints */
  target?: 'dalle3' | 'imagen'
  /** Aspect ratio hint */
  aspectRatio?: '1:1' | '16:9' | '4:3'
}

export interface ImagePrompterOutput extends AgentOutput {
  /** Ready-to-use image generation prompt string */
  imagePrompt: string
}

/**
 * Run the Image Prompter agent.
 *
 * @example
 * const result = await runImagePrompter({
 *   prompt: 'Autonomous AI agent orchestrating multiple tools',
 *   target: 'dalle3',
 *   aspectRatio: '16:9',
 * })
 * // Pass result.imagePrompt directly to the DALL-E API
 */
export async function runImagePrompter(
  input: ImagePrompterInput,
): Promise<ImagePrompterOutput> {
  const targetNote = input.target === 'imagen'
    ? 'Generate a prompt optimised for Google Imagen 3.'
    : 'Generate a prompt optimised for DALL-E 3.'

  const aspectNote = input.aspectRatio
    ? `Target aspect ratio: ${input.aspectRatio}.`
    : ''

  const enrichedPrompt = [
    `Article topic: ${input.prompt}`,
    targetNote,
    aspectNote,
  ]
    .filter(Boolean)
    .join('\n')

  const result = await runAgent(config, systemPrompt, guardrails, {
    ...input,
    prompt: enrichedPrompt,
  })

  return {
    ...result,
    imagePrompt: result.text.trim(),
  }
}
