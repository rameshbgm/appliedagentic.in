// agents/image-prompter/agent.ts
// Image Prompter agent — generates image prompts from article content.
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
  target?: 'openai' | 'gemini'
  /** Aspect ratio hint */
  aspectRatio?: '1:1' | '3:2' | '2:3'
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
 *   target: 'openai',
 *   aspectRatio: '3:2',
 * })
 * // Pass result.imagePrompt to the selected image provider.
 */
export async function runImagePrompter(
  input: ImagePrompterInput,
): Promise<ImagePrompterOutput> {
  const targetNote = input.target === 'gemini'
    ? 'Generate a prompt optimised for Gemini Nano Banana 2.1.'
    : 'Generate a prompt optimised for GPT Image 2.5 Flare.'

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
